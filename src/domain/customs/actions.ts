"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/utils/supabase/service-role";
import { getCurrentProfile } from "@/domain/auth/server";
import {
  aceExportDeclarationSchema,
  AceExportDeclarationInput,
  cdsDeclarationSchema,
  CdsDeclarationInput,
  customsHoldSchema,
  CustomsHoldInput,
  customsClearanceReleaseSchema,
  CustomsClearanceReleaseInput,
  generateAceItn,
  generateCdsMrn,
  calculateCustomsDuties,
} from "./index";

export interface CustomsActionResult<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Submits an Automated Commercial Environment (ACE / AES Direct) export declaration.
 * Generates an official ITN (Internal Transaction Number) and records in chain of custody.
 */
export async function submitAceExportFilingAction(
  rawInput: AceExportDeclarationInput
): Promise<CustomsActionResult<{ itnNumber: string; filingReference: string }>> {
  const profile = await getCurrentProfile();
  if (!profile) return { success: false, error: "Unauthorized." };

  const parsed = aceExportDeclarationSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid ACE export declaration parameters",
    };
  }

  const data = parsed.data;
  const itnNumber = generateAceItn();
  const filingReference = `ACE-${Date.now().toString().slice(-8)}`;
  const serviceClient = createServiceRoleClient();

  try {
    // 1. Append Chain of Custody Event for ACE Filing
    await serviceClient.from("shipment_events").insert({
      shipment_id: data.shipment_id,
      status: "DOCUMENTS_PENDING",
      event_title: "US ACE AES Direct Export Declaration Accepted",
      event_description: `Electronic Export Information (EEI) filed. ITN generated: ${itnNumber}. Port of Export: ${data.port_of_export}.`,
      location_name: `US CBP Export Gateway (${data.port_of_export})`,
      occurred_at: new Date().toISOString(),
      source: "CARRIER_API",
    });

    // 2. Write Audit Log for Compliance
    await serviceClient.from("audit_logs").insert({
      actor_id: profile.id,
      actor_email: profile.email,
      actor_role: profile.role,
      company_id: data.company_id,
      action: "CUSTOMS_ACE_EXPORT_FILED",
      entity_type: "customs_declarations",
      entity_id: data.shipment_id,
      changes: {
        filing_reference: filingReference,
        itn_number: itnNumber,
        usppi_ein: data.usppi_ein,
        consignee: data.consignee_name,
        commercial_value_usd: data.commercial_value_usd,
      },
    });

    revalidatePath(`/admin/shipments/${data.shipment_id}`);
    revalidatePath(`/portal/shipments/${data.shipment_id}`);

    return {
      success: true,
      data: {
        itnNumber,
        filingReference,
      },
    };
  } catch (err: any) {
    console.error("ACE filing error:", err);
    return {
      success: false,
      error: err.message || "Failed to submit ACE declaration",
    };
  }
}

/**
 * Submits an HMRC CDS or EU NCTS Import Declaration.
 * Generates an 18-character MRN (Movement Reference Number) and calculates duty/tax obligations.
 */
export async function submitCdsDeclarationAction(
  rawInput: CdsDeclarationInput
): Promise<CustomsActionResult<{ mrnNumber: string; dutyPayable: number; vatPayable: number }>> {
  const profile = await getCurrentProfile();
  if (!profile) return { success: false, error: "Unauthorized." };

  const parsed = cdsDeclarationSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid CDS declaration parameters",
    };
  }

  const data = parsed.data;
  const countryPrefix = data.customs_office.slice(0, 2).toUpperCase() || "GB";
  const mrnNumber = generateCdsMrn(countryPrefix);
  const calculation = calculateCustomsDuties({
    cifValue: data.cif_value,
    dutyRatePercent: data.duty_rate_percent,
    vatRatePercent: data.vat_rate_percent,
  });

  const serviceClient = createServiceRoleClient();

  try {
    // 1. Record event in shipment log
    await serviceClient.from("shipment_events").insert({
      shipment_id: data.shipment_id,
      status: "CUSTOMS_CLEARANCE",
      event_title: `Customs Declaration Lodged (${countryPrefix} CDS/NCTS)`,
      event_description: `Import entry accepted under MRN ${mrnNumber}. Estimated Customs Duty: ${data.currency} ${calculation.dutyPayable}, Import VAT: ${data.currency} ${calculation.vatPayable}.`,
      location_name: `Customs Hub (${data.customs_office})`,
      occurred_at: new Date().toISOString(),
      source: "CARRIER_API",
    });

    // 2. Audit log entry
    await serviceClient.from("audit_logs").insert({
      actor_id: profile.id,
      actor_email: profile.email,
      actor_role: profile.role,
      company_id: data.company_id,
      action: "CUSTOMS_CDS_IMPORT_LODGED",
      entity_type: "customs_declarations",
      entity_id: data.shipment_id,
      changes: {
        mrn_number: mrnNumber,
        customs_office: data.customs_office,
        importer_eori: data.importer_eori,
        cif_value: data.cif_value,
        duty_payable: calculation.dutyPayable,
        vat_payable: calculation.vatPayable,
        currency: data.currency,
      },
    });

    revalidatePath(`/admin/shipments/${data.shipment_id}`);
    revalidatePath(`/portal/shipments/${data.shipment_id}`);

    return {
      success: true,
      data: {
        mrnNumber,
        dutyPayable: calculation.dutyPayable,
        vatPayable: calculation.vatPayable,
      },
    };
  } catch (err: any) {
    console.error("CDS filing error:", err);
    return {
      success: false,
      error: err.message || "Failed to submit CDS declaration",
    };
  }
}

/**
 * Places a shipment under a Customs Hold / Inspection Exception.
 */
export async function flagCustomsHoldAction(
  rawInput: CustomsHoldInput
): Promise<CustomsActionResult<{ eventId: string }>> {
  const profile = await getCurrentProfile();
  if (!profile) return { success: false, error: "Unauthorized." };

  const parsed = customsHoldSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid customs hold details",
    };
  }

  const data = parsed.data;
  const serviceClient = createServiceRoleClient();

  try {
    // 1. Insert urgent exception event
    const { data: event, error: evtErr } = await serviceClient
      .from("shipment_events")
      .insert({
        shipment_id: data.shipment_id,
        status: "CUSTOMS_CLEARANCE",
        event_title: `CUSTOMS HOLD: ${data.hold_reason.replace("_", " ")}`,
        event_description: `${data.customs_authority} has flagged this shipment at ${data.inspection_location}. Action Required: ${data.action_required}.`,
        location_name: data.inspection_location,
        occurred_at: new Date().toISOString(),
        source: "MANUAL",
      })
      .select("id")
      .single();

    if (evtErr) throw evtErr;

    // 2. Audit entry
    await serviceClient.from("audit_logs").insert({
      actor_id: profile.id,
      actor_email: profile.email,
      actor_role: profile.role,
      company_id: profile.company_id || null,
      action: "CUSTOMS_HOLD_FLAGGED",
      entity_type: "shipments",
      entity_id: data.shipment_id,
      changes: {
        hold_reason: data.hold_reason,
        authority: data.customs_authority,
        action_required: data.action_required,
        officer_reference: data.officer_reference || null,
      },
    });

    revalidatePath(`/admin/shipments/${data.shipment_id}`);
    revalidatePath(`/portal/shipments/${data.shipment_id}`);

    return {
      success: true,
      data: {
        eventId: event.id,
      },
    };
  } catch (err: any) {
    console.error("Flag customs hold error:", err);
    return {
      success: false,
      error: err.message || "Failed to flag customs hold",
    };
  }
}

/**
 * Releases a Customs Hold and updates shipment status upon statutory clearance.
 */
export async function releaseCustomsHoldAction(
  rawInput: CustomsClearanceReleaseInput
): Promise<CustomsActionResult<{ status: string }>> {
  const profile = await getCurrentProfile();
  if (!profile) return { success: false, error: "Unauthorized." };

  const parsed = customsClearanceReleaseSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid clearance parameters",
    };
  }

  const data = parsed.data;
  const serviceClient = createServiceRoleClient();

  try {
    // 1. Record Clearance Event
    await serviceClient.from("shipment_events").insert({
      shipment_id: data.shipment_id,
      status: "CUSTOMS_CLEARANCE",
      event_title: "Customs Clearance Granted & Duties Settled",
      event_description: `Shipment cleared customs inspection under release reference: ${data.clearance_reference}. Assessed duty: ${data.currency} ${data.assessed_duty}. Cargo released for final dispatch.`,
      location_name: "Customs Clearance Center",
      occurred_at: new Date().toISOString(),
      source: "MANUAL",
    });

    // 2. Advance Shipment Status to OUT_FOR_DELIVERY
    await serviceClient
      .from("shipments")
      .update({
        status: "OUT_FOR_DELIVERY",
      })
      .eq("id", data.shipment_id);

    // 3. Record in Audit Log
    await serviceClient.from("audit_logs").insert({
      actor_id: profile.id,
      actor_email: profile.email,
      actor_role: profile.role,
      company_id: profile.company_id || null,
      action: "CUSTOMS_HOLD_RELEASED",
      entity_type: "shipments",
      entity_id: data.shipment_id,
      changes: {
        clearance_reference: data.clearance_reference,
        assessed_duty: data.assessed_duty,
        assessed_tax: data.assessed_tax,
        notes: data.officer_notes || null,
      },
    });

    revalidatePath(`/admin/shipments/${data.shipment_id}`);
    revalidatePath(`/portal/shipments/${data.shipment_id}`);

    return {
      success: true,
      data: {
        status: "OUT_FOR_DELIVERY",
      },
    };
  } catch (err: any) {
    console.error("Release customs hold error:", err);
    return {
      success: false,
      error: err.message || "Failed to release customs hold",
    };
  }
}
