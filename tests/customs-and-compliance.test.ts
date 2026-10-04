import { describe, it, expect } from "vitest";
import {
  generateAceItn,
  generateCdsMrn,
  validateAceItn,
  validateCdsMrn,
  calculateCustomsDuties,
  US_EIN_REGEX,
  EORI_REGEX,
  aceExportDeclarationSchema,
  cdsDeclarationSchema,
} from "@/domain/customs";

describe("Phase 2 — Customs & Compliance Engine", () => {
  describe("ACE AES Direct ITN Generation & Validation", () => {
    it("generates a valid 15-character ACE ITN starting with 'X' followed by 14 digits", () => {
      const itn = generateAceItn();
      expect(itn).toMatch(/^X\d{14}$/);
      expect(validateAceItn(itn)).toBe(true);
    });

    it("rejects malformed or tampered ITN numbers", () => {
      expect(validateAceItn("X12345")).toBe(false);
      expect(validateAceItn("A20260906123456")).toBe(false);
      expect(validateAceItn("X2026090612345Z")).toBe(false);
    });
  });

  describe("HMRC CDS & EU NCTS MRN Generation & Validation", () => {
    it("generates an 18-character MRN starting with year digits, country code, and 14 alphanumeric chars", () => {
      const mrnUk = generateCdsMrn("GB");
      expect(mrnUk).toMatch(/^\d{2}GB[A-Z0-9]{14}$/);
      expect(validateCdsMrn(mrnUk)).toBe(true);

      const mrnNl = generateCdsMrn("NL");
      expect(mrnNl).toMatch(/^\d{2}NL[A-Z0-9]{14}$/);
      expect(validateCdsMrn(mrnNl)).toBe(true);
    });

    it("rejects non-compliant MRNs", () => {
      expect(validateCdsMrn("26GBA")).toBe(false);
      expect(validateCdsMrn("GB2612345678901234")).toBe(false);
    });
  });

  describe("Customs Duty & Import VAT Calculation", () => {
    it("correctly calculates duty and compounded VAT base", () => {
      // CIF: 10,000 | Duty: 5% -> 500 | VAT Base: 10,500 | VAT: 20% -> 2,100
      const calc = calculateCustomsDuties({
        cifValue: 10000,
        dutyRatePercent: 5,
        vatRatePercent: 20,
      });

      expect(calc.dutyPayable).toBe(500);
      expect(calc.vatBase).toBe(10500);
      expect(calc.vatPayable).toBe(2100);
      expect(calc.totalCustomsLiability).toBe(2600);
    });

    it("handles zero-duty goods correctly", () => {
      const calc = calculateCustomsDuties({
        cifValue: 50000,
        dutyRatePercent: 0,
        vatRatePercent: 19,
      });

      expect(calc.dutyPayable).toBe(0);
      expect(calc.vatBase).toBe(50000);
      expect(calc.vatPayable).toBe(9500);
      expect(calc.totalCustomsLiability).toBe(9500);
    });
  });

  describe("Trader Tax ID Validation Patterns", () => {
    it("validates US Employer Identification Numbers (EIN)", () => {
      expect(US_EIN_REGEX.test("12-3456789")).toBe(true);
      expect(US_EIN_REGEX.test("123456789")).toBe(true);
      expect(US_EIN_REGEX.test("123-45678")).toBe(false);
      expect(US_EIN_REGEX.test("EIN123456")).toBe(false);
    });

    it("validates European and UK EORI numbers", () => {
      expect(EORI_REGEX.test("GB123456789000")).toBe(true);
      expect(EORI_REGEX.test("NL820192834")).toBe(true);
      expect(EORI_REGEX.test("123456789")).toBe(false); // Missing country prefix
    });
  });

  describe("Zod Declaration Schema Validation", () => {
    it("validates full ACE export declaration input", () => {
      const validPayload = {
        shipment_id: "123e4567-e89b-12d3-a456-426614174000",
        company_id: "123e4567-e89b-12d3-a456-426614174001",
        usppi_ein: "12-3456789",
        consignee_name: "Apex Logistics Europe",
        consignee_country: "NL",
        port_of_export: "2704",
        port_of_unlading: "Rotterdam",
        transport_mode: "VESSEL" as const,
        carrier_scac_or_iata: "MAEU",
        commercial_value_usd: 85000,
        commodities: [
          {
            schedule_b_or_hts: "8504.40.95",
            description: "Solar Power Inverters",
            quantity: 200,
            unit_of_measure: "NO",
            value_usd: 85000,
            eccn: "EAR99",
          },
        ],
      };

      const result = aceExportDeclarationSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });
  });
});
