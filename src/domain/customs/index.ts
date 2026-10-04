import { z } from "zod";

export type DeclarationType =
  | "US_ACE_EXPORT"
  | "US_CBP_IMPORT"
  | "EU_NCTS_TRANSIT"
  | "UK_CDS_IMPORT"
  | "UK_CDS_EXPORT";

export type DeclarationStatus =
  | "DRAFT"
  | "VALIDATING"
  | "SUBMITTED"
  | "ACCEPTED"
  | "REJECTED"
  | "CUSTOMS_HOLD"
  | "CLEARED";

export type CustomsHoldReason =
  | "INTENSIVE_EXAM"
  | "DOCUMENT_DISCREPANCY"
  | "QUARANTINE_HOLD"
  | "DUTY_ASSESSMENT"
  | "SECURITY_HOLD";

// Regex validators
export const US_EIN_REGEX = /^\d{2}-?\d{7}$/;
export const EORI_REGEX = /^[A-Z]{2}[0-9A-Z]{1,15}$/;
export const ACE_ITN_REGEX = /^X\d{14}$/;
export const CDS_MRN_REGEX = /^\d{2}[A-Z]{2}[A-Z0-9]{14}$/;

/**
 * Validation Schema for US Automated Commercial Environment (ACE / AES Direct)
 */
export const aceExportDeclarationSchema = z.object({
  shipment_id: z.string().min(1, "Shipment ID is required"),
  company_id: z.string().min(1, "Company ID is required"),
  usppi_ein: z
    .string()
    .regex(US_EIN_REGEX, "Invalid US EIN (format: XX-XXXXXXX or 9 digits)"),
  consignee_name: z.string().min(2, "Consignee name is required"),
  consignee_country: z.string().length(2, "Two-letter country code required"),
  port_of_export: z.string().min(4, "Schedule D Port code is required (e.g. 2704)"),
  port_of_unlading: z.string().min(2, "Port of unlading required"),
  transport_mode: z.enum(["VESSEL", "AIR", "TRUCK", "RAIL"]).default("VESSEL"),
  carrier_scac_or_iata: z.string().min(2, "Carrier code (SCAC/IATA) required"),
  commercial_value_usd: z.number().min(1, "Commercial value must be positive"),
  commodities: z
    .array(
      z.object({
        schedule_b_or_hts: z.string().min(6, "HTS/Schedule B code required"),
        description: z.string().min(2, "Commodity description required"),
        quantity: z.number().positive(),
        unit_of_measure: z.string().default("X"),
        value_usd: z.number().positive(),
        eccn: z.string().optional().default("EAR99"),
      })
    )
    .min(1, "At least one commodity line item is required"),
});

export type AceExportDeclarationInput = z.infer<typeof aceExportDeclarationSchema>;

/**
 * Validation Schema for European / UK Customs Declarations (HMRC CDS & EU NCTS)
 */
export const cdsDeclarationSchema = z.object({
  shipment_id: z.string().min(1, "Shipment ID is required"),
  company_id: z.string().min(1, "Company ID is required"),
  declarant_eori: z.string().regex(EORI_REGEX, "Invalid Declarant EORI number"),
  importer_eori: z.string().regex(EORI_REGEX, "Invalid Importer EORI number"),
  customs_office: z.string().min(5, "Customs Office code required (e.g. GB000060)"),
  declaration_category: z.enum(["IMPORT_STANDARD", "EXPORT_STANDARD", "TRANSIT_T1"]).default("IMPORT_STANDARD"),
  cif_value: z.number().min(1, "CIF valuation must be positive"),
  currency: z.string().length(3).default("EUR"),
  duty_rate_percent: z.number().min(0).max(100).default(4.5),
  vat_rate_percent: z.number().min(0).max(100).default(20),
  commodities: z
    .array(
      z.object({
        taric_code: z.string().min(8, "8-10 digit TARIC/Commodity code required"),
        description: z.string().min(2),
        net_mass_kg: z.number().positive(),
        invoice_value: z.number().positive(),
      })
    )
    .min(1, "At least one commodity line item is required"),
});

export type CdsDeclarationInput = z.infer<typeof cdsDeclarationSchema>;

/**
 * Validation Schema for Customs Holds
 */
export const customsHoldSchema = z.object({
  shipment_id: z.string().min(1, "Shipment ID is required"),
  hold_reason: z.enum([
    "INTENSIVE_EXAM",
    "DOCUMENT_DISCREPANCY",
    "QUARANTINE_HOLD",
    "DUTY_ASSESSMENT",
    "SECURITY_HOLD",
  ] as const),
  customs_authority: z.string().min(2, "Customs authority is required"),
  inspection_location: z.string().min(2, "Inspection location is required"),
  action_required: z.string().min(5, "Action required is required"),
  officer_reference: z.string().optional(),
});

export type CustomsHoldInput = z.infer<typeof customsHoldSchema>;

/**
 * Validation Schema for Customs Release
 */
export const customsClearanceReleaseSchema = z.object({
  shipment_id: z.string().min(1, "Shipment ID is required"),
  declaration_id: z.string().min(1, "Declaration ID is required"),
  clearance_reference: z.string().min(2, "Official clearance reference is required"),
  assessed_duty: z.number().min(0).default(0),
  assessed_tax: z.number().min(0).default(0),
  currency: z.string().length(3).default("USD"),
  officer_notes: z.string().optional(),
});

export type CustomsClearanceReleaseInput = z.infer<typeof customsClearanceReleaseSchema>;

/**
 * Generates an official-format ACE Internal Transaction Number (ITN).
 * Format: X + YYYYMMDD + 6 numeric digits (Total 15 chars)
 */
export function generateAceItn(date = new Date()): string {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const randomSuffix = Math.floor(100000 + Math.random() * 900000).toString();
  return `X${yyyy}${mm}${dd}${randomSuffix}`;
}

/**
 * Generates an official-format CDS/NCTS Movement Reference Number (MRN).
 * Format: 2-digit year + 2-letter Country + 14 alphanumeric chars (Total 18 chars)
 */
export function generateCdsMrn(countryCode = "GB", date = new Date()): string {
  const yy = String(date.getUTCFullYear()).slice(-2);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomPart = "";
  for (let i = 0; i < 14; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${yy}${countryCode.toUpperCase()}${randomPart}`;
}

/**
 * Validates whether an ITN conforms to ACE AES Direct standard.
 */
export function validateAceItn(itn: string): boolean {
  return ACE_ITN_REGEX.test(itn);
}

/**
 * Validates whether an MRN conforms to European CDS / NCTS standard.
 */
export function validateCdsMrn(mrn: string): boolean {
  return CDS_MRN_REGEX.test(mrn);
}

/**
 * Calculates estimated customs duty and VAT/GST liability.
 */
export function calculateCustomsDuties({
  cifValue,
  dutyRatePercent,
  vatRatePercent,
}: {
  cifValue: number;
  dutyRatePercent: number;
  vatRatePercent: number;
}): {
  dutyPayable: number;
  vatBase: number;
  vatPayable: number;
  totalCustomsLiability: number;
} {
  const dutyPayable = Math.round(cifValue * (dutyRatePercent / 100) * 100) / 100;
  const vatBase = cifValue + dutyPayable;
  const vatPayable = Math.round(vatBase * (vatRatePercent / 100) * 100) / 100;
  const totalCustomsLiability = Math.round((dutyPayable + vatPayable) * 100) / 100;

  return {
    dutyPayable,
    vatBase,
    vatPayable,
    totalCustomsLiability,
  };
}
