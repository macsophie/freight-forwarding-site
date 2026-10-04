"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/utils/supabase/service-role";
import { getCurrentProfile } from "@/domain/auth/server";
import { isStaffRole } from "@/domain/auth";

export type KybStatus =
  | "UNVERIFIED"
  | "PENDING_REVIEW"
  | "VERIFIED"
  | "FLAGGED"
  | "REJECTED";

export interface RiskAssessment {
  riskScore: number; // 0 to 100
  riskTier: "LOW" | "MEDIUM" | "HIGH";
  suggestedCreditLimitUsd: number;
  reasons: string[];
}

export const kybSubmissionSchema = z.object({
  company_id: z.string().min(1, "Company ID is required"),
  legal_name: z.string().min(2, "Official legal entity name required"),
  country: z.string().length(2, "Two-letter ISO country code required"),
  tax_id: z.string().min(5, "Tax ID / EIN / VAT number is required"),
  eori_number: z.string().optional(),
  registration_number: z.string().min(3, "Company registration / CRN required"),
  industry: z.string().min(2, "Industry classification required"),
  annual_freight_budget_usd: z.number().min(0).default(50000),
});

export type KybSubmissionInput = z.infer<typeof kybSubmissionSchema>;

/**
 * Validates country-specific tax identifier formats (US EIN, EU/UK VAT, etc.)
 */
export function validateTaxIdFormat(taxId: string, country: string): boolean {
  const clean = taxId.trim().toUpperCase();
  const c = country.toUpperCase();

  if (c === "US") {
    // US EIN: XX-XXXXXXX or 9 digits
    return /^\d{2}-?\d{7}$/.test(clean);
  }
  if (c === "GB") {
    // UK VAT: GB followed by 9 or 12 digits, or simply 9 digits
    return /^(GB)?\d{9}(\d{3})?$/.test(clean);
  }
  if (c === "DE") {
    // German USt-IdNr: DE followed by 9 digits
    return /^DE\d{9}$/.test(clean);
  }
  if (c === "FR") {
    // French TVA: FR followed by 2 letters/digits + 9 digits
    return /^FR[A-Z0-9]{2}\d{9}$/.test(clean);
  }
  if (c === "CN") {
    // China Unified Social Credit Code: 18 chars
    return /^[0-9A-HJ-NPQRTUWXY]{18}$/.test(clean);
  }

  // Fallback generic format: 6-20 alphanumeric characters
  return /^[A-Z0-9-]{6,20}$/.test(clean);
}

/**
 * Assesses commercial credit risk and calculates initial approved credit limit.
 */
export function assessCompanyRiskTier({
  country,
  annualFreightBudgetUsd,
  hasEori,
}: {
  country: string;
  annualFreightBudgetUsd: number;
  hasEori: boolean;
}): RiskAssessment {
  let riskScore = 20; // baseline low risk
  const reasons: string[] = [];

  const tier1Countries = ["US", "CA", "GB", "DE", "FR", "NL", "JP", "SG", "AU"];
  if (!tier1Countries.includes(country.toUpperCase())) {
    riskScore += 25;
    reasons.push("Incorporated in non-Tier-1 jurisdiction");
  }

  if (!hasEori && ["GB", "DE", "FR", "NL"].includes(country.toUpperCase())) {
    riskScore += 15;
    reasons.push("Missing European EORI trader registration");
  }

  if (annualFreightBudgetUsd >= 500000) {
    riskScore -= 10;
    reasons.push("High annual volume corporate shipper");
  } else if (annualFreightBudgetUsd < 50000) {
    riskScore += 15;
    reasons.push("Low annual volume trading profile");
  }

  const finalScore = Math.max(5, Math.min(95, riskScore));
  let riskTier: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  let suggestedCreditLimitUsd = 25000;

  if (finalScore > 50) {
    riskTier = "HIGH";
    suggestedCreditLimitUsd = 0; // Prepayment required
  } else if (finalScore > 30) {
    riskTier = "MEDIUM";
    suggestedCreditLimitUsd = 10000;
  } else {
    riskTier = "LOW";
    suggestedCreditLimitUsd = 50000;
  }

  return {
    riskScore: finalScore,
    riskTier,
    suggestedCreditLimitUsd,
    reasons,
  };
}

/**
 * Submits company information for automated and compliance officer KYB review.
 */
export async function submitKybVerificationAction(
  rawInput: KybSubmissionInput
): Promise<{ success: boolean; error?: string; riskTier?: string; suggestedCreditLimit?: number }> {
  const profile = await getCurrentProfile();
  if (!profile) return { success: false, error: "Unauthorized." };

  const parsed = kybSubmissionSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid KYB submission details",
    };
  }

  const data = parsed.data;
  const isTaxValid = validateTaxIdFormat(data.tax_id, data.country);
  if (!isTaxValid) {
    return {
      success: false,
      error: `Tax ID format is invalid for country code ${data.country}.`,
    };
  }

  const assessment = assessCompanyRiskTier({
    country: data.country,
    annualFreightBudgetUsd: data.annual_freight_budget_usd,
    hasEori: Boolean(data.eori_number),
  });

  const serviceClient = createServiceRoleClient();

  try {
    // 1. Update company record
    await serviceClient
      .from("companies")
      .update({
        legal_name: data.legal_name,
        tax_id: data.tax_id,
        eori_number: data.eori_number || null,
        registration_number: data.registration_number,
        industry: data.industry,
        status: assessment.riskTier === "HIGH" ? "PENDING_VERIFICATION" : "ACTIVE",
        credit_limit: assessment.suggestedCreditLimitUsd,
      })
      .eq("id", data.company_id);

    // 2. Audit log entry
    await serviceClient.from("audit_logs").insert({
      actor_id: profile.id,
      actor_email: profile.email,
      actor_role: profile.role,
      company_id: data.company_id,
      action: "KYB_SUBMITTED",
      entity_type: "companies",
      entity_id: data.company_id,
      changes: {
        risk_tier: assessment.riskTier,
        risk_score: assessment.riskScore,
        suggested_credit: assessment.suggestedCreditLimitUsd,
        reasons: assessment.reasons,
      },
    });

    revalidatePath(`/portal/settings`);
    revalidatePath(`/admin/customers`);

    return {
      success: true,
      riskTier: assessment.riskTier,
      suggestedCreditLimit: assessment.suggestedCreditLimitUsd,
    };
  } catch (err: any) {
    console.error("KYB submission error:", err);
    return { success: false, error: err.message || "Failed to submit KYB verification" };
  }
}

/**
 * Staff-level manual override or approval of company credit limit and KYB status.
 */
export async function approveKybVerificationAction({
  companyId,
  status,
  approvedCreditLimit,
}: {
  companyId: string;
  status: "ACTIVE" | "SUSPENDED";
  approvedCreditLimit: number;
}): Promise<{ success: boolean; error?: string }> {
  const profile = await getCurrentProfile();
  if (!profile || !isStaffRole(profile.role)) {
    return { success: false, error: "Staff operations authorization required." };
  }

  const serviceClient = createServiceRoleClient();

  try {
    await serviceClient
      .from("companies")
      .update({
        status,
        credit_limit: approvedCreditLimit,
      })
      .eq("id", companyId);

    await serviceClient.from("audit_logs").insert({
      actor_id: profile.id,
      actor_email: profile.email,
      actor_role: profile.role,
      company_id: companyId,
      action: "KYB_APPROVAL_OVERRIDE",
      entity_type: "companies",
      entity_id: companyId,
      changes: {
        status,
        credit_limit: approvedCreditLimit,
        approved_by: profile.id,
      },
    });

    revalidatePath(`/admin/customers`);
    return { success: true };
  } catch (err: any) {
    console.error("KYB approval error:", err);
    return { success: false, error: err.message || "Failed to approve KYB" };
  }
}
