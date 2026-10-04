"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/utils/supabase/service-role";
import { getCurrentProfile } from "@/domain/auth/server";
import {
  updateShipmentMilestoneSchema,
  shipmentEventSchema,
  UpdateShipmentMilestoneInput,
  ShipmentEventInput,
} from "./index";
import { SHIPMENT_MILESTONES } from "@/lib/constants";
import { Database } from "@/types/database";

export interface ShipmentActionResult<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Progress a shipment to a new operational milestone and dispatch notifications.
 */
export async function updateShipmentMilestoneAction(
  rawInput: UpdateShipmentMilestoneInput
): Promise<ShipmentActionResult<{ eventId: string }>> {
  const profile = await getCurrentProfile();
  if (!profile) return { success: false, error: "Unauthorized." };

  const parsed = updateShipmentMilestoneSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid milestone parameters",
    };
  }

  const { shipment_id, status, location, eventDescription, occurredAt } = parsed.data;
  const serviceClient = createServiceRoleClient();

  // Fetch current shipment
  const { data: shipment, error: shpErr } = await serviceClient
    .from("shipments")
    .select("id, tracking_number, company_id, status")
    .eq("id", shipment_id)
    .single();

  if (shpErr || !shipment) {
    return { success: false, error: "Shipment not found." };
  }

  const milestoneDef = SHIPMENT_MILESTONES.find((m) => m.status === status);
  const eventTitle = milestoneDef?.label || `Milestone reached: ${status}`;

  // 1. Insert Milestone Event
  const { data: newEvent, error: eventErr } = await serviceClient
    .from("shipment_events")
    .insert({
      shipment_id,
      status,
      event_title: eventTitle,
      event_description: eventDescription || milestoneDef?.description || null,
      location_name: location,
      occurred_at: occurredAt || new Date().toISOString(),
      source: "MANUAL",
      is_milestone: true,
      recorded_by: profile.id,
    })
    .select("id")
    .single();

  if (eventErr || !newEvent) {
    return { success: false, error: "Failed to record milestone event." };
  }

  // 2. Update Shipment
  const updates: Database["public"]["Tables"]["shipments"]["Update"] = {
    status,
    current_location: location,
    updated_at: new Date().toISOString(),
  };

  if (status === "DEPARTED_ORIGIN") updates.actual_departure = occurredAt;
  if (status === "ARRIVED_DESTINATION") updates.actual_arrival = occurredAt;
  if (status === "DELIVERED") updates.delivered_at = occurredAt;

  await serviceClient.from("shipments").update(updates).eq("id", shipment_id);

  // 3. Customer Notification
  try {
    const { data: companyUsers } = await serviceClient
      .from("company_users")
      .select("user_id")
      .eq("company_id", shipment.company_id);

    if (companyUsers && companyUsers.length > 0) {
      const notifications = companyUsers.map((u) => ({
        user_id: u.user_id,
        company_id: shipment.company_id,
        title: `Shipment ${shipment.tracking_number}: ${milestoneDef?.shortLabel || status}`,
        message: `${eventTitle} at ${location}.`,
        category: "SHIPMENT" as const,
        reference_id: shipment_id,
        reference_type: "shipment",
      }));
      await serviceClient.from("notifications").insert(notifications);
    }
  } catch (notifyErr) {
    console.warn("Non-fatal notification error:", notifyErr);
  }

  // 4. Audit Log
  try {
    await serviceClient.from("audit_logs").insert({
      actor_id: profile.id,
      actor_email: profile.email,
      actor_role: profile.role,
      company_id: shipment.company_id,
      action: "SHIPMENT_MILESTONE_UPDATED",
      entity_type: "shipments",
      entity_id: shipment_id,
      changes: {
        previousStatus: shipment.status,
        newStatus: status,
        location,
      },
    });
  } catch (auditErr) {
    console.warn("Non-fatal audit error:", auditErr);
  }

  revalidatePath("/admin/shipments");
  revalidatePath(`/admin/shipments/${shipment_id}`);
  revalidatePath("/portal/shipments");
  revalidatePath(`/portal/shipments/${shipment_id}`);
  revalidatePath("/track");

  return {
    success: true,
    data: {
      eventId: newEvent.id,
    },
  };
}

/**
 * Record an ad-hoc tracking or customs inspection event on a shipment.
 */
export async function addShipmentEventAction(
  rawInput: ShipmentEventInput
): Promise<ShipmentActionResult<{ eventId: string }>> {
  const profile = await getCurrentProfile();
  if (!profile) return { success: false, error: "Unauthorized." };

  const parsed = shipmentEventSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid event input",
    };
  }

  const data = parsed.data;
  const serviceClient = createServiceRoleClient();

  const { data: newEvent, error } = await serviceClient
    .from("shipment_events")
    .insert({
      shipment_id: data.shipment_id,
      status: data.status,
      event_title: data.event_title,
      event_description: data.event_description || null,
      location_name: data.location_name,
      location_country: data.location_country || null,
      occurred_at: data.occurred_at,
      source: data.source,
      is_milestone: data.is_milestone,
      metadata: data.metadata || null,
      recorded_by: profile.id,
    })
    .select("id")
    .single();

  if (error || !newEvent) {
    return { success: false, error: error?.message || "Failed to record event." };
  }

  revalidatePath(`/admin/shipments/${data.shipment_id}`);
  revalidatePath(`/portal/shipments/${data.shipment_id}`);

  return {
    success: true,
    data: {
      eventId: newEvent.id,
    },
  };
}
