"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createServiceRoleClient } from "@/utils/supabase/service-role";
import { getCurrentProfile } from "@/domain/auth/server";
import {
  quoteRequestSchema,
  QuoteRequestInput,
  estimateFreightCharges,
} from "./index";
import { QuoteStatus, Database } from "@/types/database";

export interface QuoteActionResult<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Submit a new freight quote request and generate preliminary pricing.
 */
export async function createQuoteRequestAction(
  rawInput: QuoteRequestInput
): Promise<QuoteActionResult<{ quoteId: string; quoteNumber: string; totalAmount: number }>> {
  const parsed = quoteRequestSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid quote request parameters",
    };
  }

  const data = parsed.data;
  const profile = await getCurrentProfile();
  const serviceClient = createServiceRoleClient();

  // Determine Company ID (either from active user or fallback default)
  let companyId = profile?.company_id;
  if (!companyId) {
    const { data: fallbackCompany } = await serviceClient
      .from("companies")
      .select("id")
      .limit(1)
      .single();
    companyId = fallbackCompany?.id;
  }

  if (!companyId) {
    return {
      success: false,
      error: "Unable to allocate customer company for quote. Please contact support.",
    };
  }

  // Calculate totals across items
  const totalWeight = data.items.reduce((acc, item) => acc + (item.gross_weight_kg || 0), 0);
  const totalVolume = data.items.reduce((acc, item) => acc + (item.total_volume_cbm || 0), 0);

  const estimate = estimateFreightCharges(data.mode, totalWeight, totalVolume);
  const quoteNumber = `QT-${Date.now().toString().slice(-6)}`;
  const validUntil = new Date(Date.now() + 86400000 * 14).toISOString(); // 14-day validity

  // 1. Insert Quote Record
  const { data: quote, error: quoteErr } = await serviceClient
    .from("quotes")
    .insert({
      quote_number: quoteNumber,
      company_id: companyId,
      requested_by: profile?.id || null,
      mode: data.mode,
      incoterm: data.incoterm,
      origin_port: data.origin_port,
      destination_port: data.destination_port,
      cargo_ready_date: data.cargo_ready_date,
      target_delivery_date: data.target_delivery_date || null,
      estimated_transit_days: estimate.estimatedTransitDays,
      status: "SUBMITTED",
      currency: "USD",
      freight_charge: estimate.freightCharge,
      origin_charges: estimate.originCharges,
      destination_charges: estimate.destinationCharges,
      customs_charges: estimate.customsCharges,
      insurance_charge: estimate.insuranceCharge,
      total_amount: estimate.totalAmount,
      valid_until: validUntil,
      special_instructions: data.special_instructions || null,
    })
    .select("id")
    .single();

  if (quoteErr || !quote) {
    console.error("Failed to insert quote record:", quoteErr);
    return {
      success: false,
      error: "Database error occurred while generating quote.",
    };
  }

  // 2. Insert Quote Cargo Items
  const quoteItemsToInsert = data.items.map((item) => ({
    quote_id: quote.id,
    package_type: item.package_type,
    quantity: item.quantity,
    length_cm: item.length_cm || null,
    width_cm: item.width_cm || null,
    height_cm: item.height_cm || null,
    gross_weight_kg: item.gross_weight_kg,
    total_volume_cbm: item.total_volume_cbm,
    commodity_description: item.commodity_description,
    hs_code: item.hs_code || null,
    is_hazardous: item.is_hazardous || false,
    un_number: item.un_number || null,
    hazard_class: item.hazard_class || null,
    temperature_control: item.temperature_control || null,
  }));

  const { error: itemsErr } = await serviceClient
    .from("quote_items")
    .insert(quoteItemsToInsert);

  if (itemsErr) {
    console.error("Failed to insert quote line items:", itemsErr);
  }

  // 3. Audit Log
  try {
    await serviceClient.from("audit_logs").insert({
      actor_id: profile?.id || null,
      actor_email: profile?.email || "guest@forwardflow.com",
      actor_role: profile?.role || "CUSTOMER_USER",
      company_id: companyId,
      action: "QUOTE_REQUESTED",
      entity_type: "quotes",
      entity_id: quote.id,
      changes: {
        quoteNumber,
        mode: data.mode,
        totalAmount: estimate.totalAmount,
        itemCount: data.items.length,
      },
    });
  } catch (auditErr) {
    console.warn("Non-fatal quote audit log error:", auditErr);
  }

  revalidatePath("/portal/quotes");
  revalidatePath("/admin/quotes");

  return {
    success: true,
    data: {
      quoteId: quote.id,
      quoteNumber,
      totalAmount: estimate.totalAmount,
    },
  };
}

/**
 * Customer accepts an issued quote, automatically initiating a linked booking.
 */
export async function acceptQuoteAction(quoteId: string): Promise<QuoteActionResult<{ bookingId: string }>> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const serviceClient = createServiceRoleClient();

  // Fetch quote
  const { data: quote, error: getErr } = await serviceClient
    .from("quotes")
    .select("*")
    .eq("id", quoteId)
    .single();

  if (getErr || !quote) {
    return { success: false, error: "Quote not found." };
  }

  // Update Quote Status to ACCEPTED
  await serviceClient
    .from("quotes")
    .update({
      status: "ACCEPTED",
      updated_at: new Date().toISOString(),
    })
    .eq("id", quoteId);

  // Automatically provision a Booking record
  const bookingNumber = `BK-${Date.now().toString().slice(-6)}`;
  const { data: newBooking, error: bookErr } = await serviceClient
    .from("bookings")
    .insert({
      booking_number: bookingNumber,
      company_id: quote.company_id,
      quote_id: quoteId,
      created_by: profile.id,
      status: "CONFIRMED",
      cargo_cutoff_date: quote.cargo_ready_date,
      estimated_departure_date: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
      estimated_arrival_date: quote.target_delivery_date || null,
      special_requirements: quote.special_instructions,
    })
    .select("id")
    .single();

  if (bookErr || !newBooking) {
    console.error("Failed to automatically generate booking from quote:", bookErr);
  }

  // Audit Log
  try {
    await serviceClient.from("audit_logs").insert({
      actor_id: profile.id,
      actor_email: profile.email,
      actor_role: profile.role,
      company_id: quote.company_id,
      action: "QUOTE_ACCEPTED",
      entity_type: "quotes",
      entity_id: quoteId,
      changes: {
        bookingId: newBooking?.id,
        bookingNumber,
      },
    });
  } catch (auditErr) {
    console.warn("Non-fatal quote audit error:", auditErr);
  }

  revalidatePath("/portal/quotes");
  revalidatePath("/portal/bookings");
  revalidatePath("/admin/bookings");

  return {
    success: true,
    data: {
      bookingId: newBooking?.id || "",
    },
  };
}

/**
 * Operations staff updates quote status (e.g. ISSUED, REJECTED).
 */
export async function updateQuoteStatusAction(
  quoteId: string,
  status: QuoteStatus,
  rejectionReason?: string
): Promise<QuoteActionResult> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return { success: false, error: "Unauthorized." };
  }

  const serviceClient = createServiceRoleClient();

  const updates: Database["public"]["Tables"]["quotes"]["Update"] = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "REJECTED" && rejectionReason) {
    updates.rejection_reason = rejectionReason;
  }

  const { error } = await serviceClient
    .from("quotes")
    .update(updates)
    .eq("id", quoteId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/quotes");
  revalidatePath(`/admin/quotes/${quoteId}`);
  revalidatePath("/portal/quotes");

  return { success: true };
}
