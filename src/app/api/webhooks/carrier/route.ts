import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { createServiceRoleClient } from "@/utils/supabase/service-role";
import { ShipmentStatus, Database } from "@/types/database";

const carrierWebhookPayloadSchema = z.object({
  tracking_number: z.string().min(1, "Tracking number is required"),
  carrier_name: z.string().min(1, "Carrier name is required"),
  carrier_reference: z.string().optional().nullable(),
  status: z.enum([
    "BOOKED",
    "DOCUMENTS_PENDING",
    "CARGO_RECEIVED",
    "DEPARTED_ORIGIN",
    "IN_TRANSIT",
    "ARRIVED_DESTINATION",
    "CUSTOMS_CLEARANCE",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "ON_HOLD",
    "CANCELLED",
  ] as const),
  event_title: z.string().min(2, "Event title is required"),
  event_description: z.string().optional().nullable(),
  location_name: z.string().min(2, "Location is required"),
  location_country: z.string().max(2).optional().nullable(),
  occurred_at: z.string().default(() => new Date().toISOString()),
  source: z.enum(["CARRIER_EDI", "CARRIER_API", "MANUAL", "SYSTEM"]).default("CARRIER_API"),
  vessel_flight_number: z.string().optional().nullable(),
  voyage_number: z.string().optional().nullable(),
  container_numbers: z.array(z.string()).optional().nullable(),
  current_location: z.string().optional().nullable(),
  etd: z.string().optional().nullable(),
  eta: z.string().optional().nullable(),
});

/**
 * Verifies HMAC SHA-256 signature from carrier webhook request
 */
export function verifyCarrierSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader || !secret) {
    return false;
  }

  try {
    // Strip optional "sha256=" prefix if present
    const cleanSignature = signatureHeader.startsWith("sha256=")
      ? signatureHeader.slice(7)
      : signatureHeader;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody, "utf8")
      .digest("hex");

    const sigBuf = Buffer.from(cleanSignature, "hex");
    const expBuf = Buffer.from(expectedSignature, "hex");

    if (sigBuf.length !== expBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const secret =
    process.env.CARRIER_WEBHOOK_SECRET || "forwardflow_default_carrier_webhook_secret_2026";
  const signature =
    req.headers.get("x-carrier-signature") || req.headers.get("x-signature-256");

  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch (err) {
    return NextResponse.json(
      { error: "Unable to read request payload" },
      { status: 400 }
    );
  }

  // Verify HMAC signature
  const isAuthorized = verifyCarrierSignature(rawBody, signature, secret);
  if (!isAuthorized) {
    return NextResponse.json(
      { error: "Invalid carrier webhook signature" },
      { status: 401 }
    );
  }

  // Parse JSON
  let jsonPayload: unknown;
  try {
    jsonPayload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parseResult = carrierWebhookPayloadSchema.safeParse(jsonPayload);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid schema", details: parseResult.error.issues },
      { status: 422 }
    );
  }

  const data = parseResult.data;
  const serviceClient = createServiceRoleClient();

  // Find shipment in database by tracking number or master bill of lading
  const { data: shipment, error: findErr } = await serviceClient
    .from("shipments")
    .select("id, company_id, tracking_number, status, origin_name, destination_name")
    .or(
      `tracking_number.eq.${data.tracking_number},master_bill_of_lading.eq.${data.carrier_reference || data.tracking_number}`
    )
    .maybeSingle();

  if (findErr) {
    console.error("Carrier webhook database query error:", findErr);
    return NextResponse.json(
      { error: "Database error querying shipment" },
      { status: 500 }
    );
  }

  if (!shipment) {
    // Return 200 OK so external carrier doesn't incessantly retry nonexistent records
    return NextResponse.json(
      {
        received: true,
        matched: false,
        message: `No active shipment found matching tracking number ${data.tracking_number}`,
      },
      { status: 200 }
    );
  }

  const shipmentId = shipment.id;
  const occurredAt = data.occurred_at || new Date().toISOString();

  // 1. Insert Milestone Event
  const { data: newEvent, error: eventErr } = await serviceClient
    .from("shipment_events")
    .insert({
      shipment_id: shipmentId,
      status: data.status,
      event_title: data.event_title,
      event_description:
        data.event_description ||
        `Carrier ${data.carrier_name} reported status update: ${data.status}`,
      location_name: data.location_name,
      location_country: data.location_country || null,
      occurred_at: occurredAt,
      source: data.source,
      is_milestone: true,
      metadata: {
        carrier_name: data.carrier_name,
        carrier_reference: data.carrier_reference,
        vessel_flight: data.vessel_flight_number,
        voyage: data.voyage_number,
        containers: data.container_numbers,
      },
    })
    .select("id")
    .single();

  if (eventErr) {
    console.error("Failed to insert carrier tracking event:", eventErr);
    return NextResponse.json(
      { error: "Failed to record tracking event in database" },
      { status: 500 }
    );
  }

  // 2. Update Shipment State
  const shipmentUpdates: Database["public"]["Tables"]["shipments"]["Update"] = {
    status: data.status,
    current_location: data.current_location || data.location_name,
    updated_at: new Date().toISOString(),
  };

  if (data.carrier_name) shipmentUpdates.carrier_name = data.carrier_name;
  if (data.vessel_flight_number) shipmentUpdates.vessel_flight_number = data.vessel_flight_number;
  if (data.voyage_number) shipmentUpdates.voyage_number = data.voyage_number;
  if (data.container_numbers && data.container_numbers.length > 0) {
    shipmentUpdates.container_numbers = data.container_numbers;
  }
  if (data.eta) shipmentUpdates.eta = data.eta;
  if (data.etd) shipmentUpdates.etd = data.etd;

  // Specific milestone timestamp markers
  if (data.status === "DEPARTED_ORIGIN") {
    shipmentUpdates.actual_departure = occurredAt;
  } else if (data.status === "ARRIVED_DESTINATION") {
    shipmentUpdates.actual_arrival = occurredAt;
  } else if (data.status === "DELIVERED") {
    shipmentUpdates.delivered_at = occurredAt;
  }

  await serviceClient.from("shipments").update(shipmentUpdates).eq("id", shipmentId);

  // 3. Dispatch in-app customer notification
  try {
    // Notify company users
    const { data: companyUsers } = await serviceClient
      .from("company_users")
      .select("user_id")
      .eq("company_id", shipment.company_id);

    if (companyUsers && companyUsers.length > 0) {
      const notificationsToInsert = companyUsers.map((cu) => ({
        user_id: cu.user_id,
        company_id: shipment.company_id,
        title: `Shipment ${shipment.tracking_number} Update: ${data.status}`,
        message: `${data.event_title} at ${data.location_name} via ${data.carrier_name}.`,
        category: "SHIPMENT" as const,
        reference_id: shipmentId,
        reference_type: "shipment",
      }));

      await serviceClient.from("notifications").insert(notificationsToInsert);
    }
  } catch (notifyErr) {
    console.warn("Non-fatal notification dispatch error:", notifyErr);
  }

  // 4. Record Immutable Audit Log
  try {
    await serviceClient.from("audit_logs").insert({
      actor_email: `carrier-webhook@${data.carrier_name.toLowerCase().replace(/\s+/g, "")}.com`,
      actor_role: "SUPER_ADMIN",
      company_id: shipment.company_id,
      action: "CARRIER_MILESTONE_UPDATED",
      entity_type: "shipments",
      entity_id: shipmentId,
      changes: {
        newStatus: data.status,
        eventTitle: data.event_title,
        carrier: data.carrier_name,
        location: data.location_name,
      },
    });
  } catch (auditErr) {
    console.warn("Non-fatal audit log error:", auditErr);
  }

  return NextResponse.json({
    success: true,
    matched: true,
    shipment_id: shipmentId,
    event_id: newEvent?.id,
    new_status: data.status,
    message: "Carrier milestone successfully recorded and dispatched",
  });
}
