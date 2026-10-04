import { describe, it, expect } from "vitest";
import {
  validateTaxIdFormat,
  assessCompanyRiskTier,
  kybSubmissionSchema,
} from "@/domain/companies/kyb";

describe("Phase 2 — Customer KYB & Commercial Risk Assessment", () => {
  describe("Tax Identification Syntax Validation", () => {
    it("validates US EIN numbers with or without hyphen", () => {
      expect(validateTaxIdFormat("12-3456789", "US")).toBe(true);
      expect(validateTaxIdFormat("123456789", "US")).toBe(true);
      expect(validateTaxIdFormat("123-4567", "US")).toBe(false);
      expect(validateTaxIdFormat("ABC123456", "US")).toBe(false);
    });

    it("validates UK VAT numbers", () => {
      expect(validateTaxIdFormat("GB123456789", "GB")).toBe(true);
      expect(validateTaxIdFormat("123456789", "GB")).toBe(true);
      expect(validateTaxIdFormat("GB1234", "GB")).toBe(false);
    });

    it("validates German USt-IdNr", () => {
      expect(validateTaxIdFormat("DE123456789", "DE")).toBe(true);
      expect(validateTaxIdFormat("123456789", "DE")).toBe(false);
    });

    it("validates French TVA numbers", () => {
      expect(validateTaxIdFormat("FR12123456789", "FR")).toBe(true);
      expect(validateTaxIdFormat("FRAB123456789", "FR")).toBe(true);
    });

    it("handles generic international fallback formatting", () => {
      expect(validateTaxIdFormat("CHE-123.456.789", "CH")).toBe(false); // special char
      expect(validateTaxIdFormat("CHE123456789", "CH")).toBe(true);
    });
  });

  describe("Commercial Risk Scoring & Credit Tier Assignment", () => {
    it("assigns LOW risk tier and high credit limit for established Tier-1 corporate shippers", () => {
      const assessment = assessCompanyRiskTier({
        country: "US",
        annualFreightBudgetUsd: 750000,
        hasEori: true,
      });

      expect(assessment.riskTier).toBe("LOW");
      expect(assessment.suggestedCreditLimitUsd).toBe(50000);
      expect(assessment.reasons).toContain("High annual volume corporate shipper");
    });

    it("assigns MEDIUM risk tier when European trader lacks EORI registration", () => {
      const assessment = assessCompanyRiskTier({
        country: "GB",
        annualFreightBudgetUsd: 80000,
        hasEori: false,
      });

      expect(assessment.riskTier).toBe("MEDIUM");
      expect(assessment.suggestedCreditLimitUsd).toBe(10000);
      expect(assessment.reasons).toContain("Missing European EORI trader registration");
    });

    it("assigns HIGH risk tier and $0 credit line for non-Tier-1 jurisdiction", () => {
      const assessment = assessCompanyRiskTier({
        country: "BR",
        annualFreightBudgetUsd: 25000,
        hasEori: false,
      });

      expect(assessment.riskTier).toBe("HIGH");
      expect(assessment.suggestedCreditLimitUsd).toBe(0);
      expect(assessment.reasons).toContain("Incorporated in non-Tier-1 jurisdiction");
    });
  });

  describe("KYB Zod Schema Validation", () => {
    it("validates compliant corporate onboarding submission", () => {
      const payload = {
        company_id: "123e4567-e89b-12d3-a456-426614174000",
        legal_name: "Apex Global Imports LLC",
        country: "US",
        tax_id: "12-3456789",
        registration_number: "CRN-981024",
        industry: "Renewable Energy & Solar Hardware",
        annual_freight_budget_usd: 350000,
      };

      const result = kybSubmissionSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });
});
