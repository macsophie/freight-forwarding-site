"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/utils/supabase/service-role";
import { getCurrentProfile } from "@/domain/auth/server";
import { BookingStatus, ShipmentMode, Incoterm } from "@/types/database";

export interface BookingActionResult<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Operations staff confirms booking and provisions a live shipment with tracking number.
 */
export async function confirmBookingAction(
  bookingId: string,
  carrierName: string,
  carrierReference: string
): Promise<BookingActionResult<{ shipmentId: string; trackingNumber: string }>> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return { success: false, error: "Unauthorized." };
  }

  const serviceClient = createServiceRoleClient();

  // Fetch Booking
  const { data: booking, error: bookErr } = await serviceClient
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (bookErr || !booking) {
    return { success: false, error: "Booking not found." };
  }

  // Fetch linked quote if available
  let quote = null;
  if (booking.quote_id) {
    const { data: qData } = await serviceClient
      .from("quotes")
      .select("*")
      .eq("id", booking.quote_id)
      .maybeSingle();
    quote = qData;
  }

  // Update Booking
  await serviceClient
    .from("bookings")
    .update({
      status: "CONFIRMED",
      carrier_name: carrierName,
      carrier_booking_reference: carrierReference,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  // Generate unique shipment tracking number
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  const regionSuffix = quote?.destination_port?.slice(0, 2) || "US";
  const trackingNumber = `FWD-${randomDigits}-${regionSuffix}`;
  const shipmentNumber = `SHP-${new Date().getFullYear()}-${randomDigits}`;

  const mode = (quote?.mode as ShipmentMode) || "OCEAN_FCL";
  const incoterm = (quote?.incoterm as Incoterm) || "FOB";

  // Create Shipment record
  const { data: newShipment, error: shpErr } = await serviceClient
    .from("shipments")
    .insert({
      shipment_number: shipmentNumber,
      tracking_number: trackingNumber,
      company_id: booking.company_id,
      booking_id: bookingId,
      quote_id: booking.quote_id,
      mode,
      incoterm,
      status: "BOOKED",
      carrier_name: carrierName,
      master_bill_of_lading: carrierReference,
      origin_name: quote?.origin_port || "Origin Gateway CY",
      origin_port: quote?.origin_port || "ORIGIN",
      origin_country: "CN",
      destination_name: quote?.destination_port || "Destination Port Terminal",
      destination_port: quote?.destination_port || "DEST",
      destination_country: regionSuffix,
      total_packages: 1,
      total_gross_weight_kg: 5000,
      total_volume_cbm: 20,
      commodity_summary: "Commercial Freight Consignment",
      etd: booking.estimated_departure_date,
      eta: booking.estimated_arrival_date,
      current_location: quote?.origin_port || "Origin Gateway CY",
    })
    .select("id")
    .single();

  if (shpErr || !newShipment) {
    console.error("Failed to provision shipment:", shpErr);
    return { success: false, error: "Failed to provision shipment record." };
  }

  // Insert initial milestone event
  await serviceClient.from("shipment_events").insert({
    shipment_id: newShipment.id,
    status: "BOOKED",
    event_title: "Booking Confirmed & Space Allocated",
    event_description: `Carrier space confirmed with ${carrierName}. Carrier Reference: ${carrierReference}`,
    location_name: quote?.origin_port || "Origin Gateway",
    location_country: "CN",
    occurred_at: new Date().toISOString(),
    source: "SYSTEM",
    is_milestone: true,
  });

  // Notify customer
  try {
    const { data: companyUsers } = await serviceClient
      .from("company_users")
      .select("user_id")
      .eq("company_id", booking.company_id);

    if (companyUsers && companyUsers.length > 0) {
      const notes = companyUsers.map((u) => ({
        user_id: u.user_id,
        company_id: booking.company_id,
        title: `Shipment Created: ${trackingNumber}`,
        message: `Booking ${booking.booking_number} confirmed. Live tracking is now active.`,
        category: "SHIPMENT" as const,
        reference_id: newShipment.id,
        reference_type: "shipment",
      }));
      await serviceClient.from("notifications").insert(notes);
    }
  } catch (notifyErr) {
    console.warn("Non-fatal booking notification error:", notifyErr);
  }

  // Audit Log
  try {
    await serviceClient.from("audit_logs").insert({
      actor_id: profile.id,
      actor_email: profile.email,
      actor_role: profile.role,
      company_id: booking.company_id,
      action: "BOOKING_CONFIRMED_SHIPMENT_PROVISIONED",
      entity_type: "bookings",
      entity_id: bookingId,
      changes: {
        trackingNumber,
        shipmentId: newShipment.id,
        carrierName,
      },
    });
  } catch (auditErr) {
    console.warn("Non-fatal booking audit error:", auditErr);
  }

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/shipments");
  revalidatePath("/portal/bookings");
  revalidatePath("/portal/shipments");

  return {
    success: true,
    data: {
      shipmentId: newShipment.id,
      trackingNumber,
    },
  };
}

/**
 * Update booking status (e.g. PROCESSING, CANCELLED).
 */
export async function updateBookingStatusAction(
  bookingId: string,
  status: BookingStatus
): Promise<BookingActionResult> {
  const profile = await getCurrentProfile();
  if (!profile) return { success: false, error: "Unauthorized." };

  const serviceClient = createServiceRoleClient();

  const { error } = await serviceClient
    .from("bookings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", bookingId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/bookings");
  revalidatePath("/portal/bookings");

  return { success: true };
}
