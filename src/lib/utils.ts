import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatWeight(
  kg: number,
  unit: "KG" | "LBS" = "KG"
): string {
  if (unit === "LBS") {
    const lbs = kg * 2.20462;
    return `${lbs.toLocaleString("en-US", { maximumFractionDigits: 2 })} lbs`;
  }
  return `${kg.toLocaleString("en-US", { maximumFractionDigits: 2 })} kg`;
}

export function formatCBM(cbm: number): string {
  return `${cbm.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 3 })} CBM`;
}

export function formatDate(
  dateInput: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }
): string {
  if (!dateInput) return "—";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

export function formatDateTime(dateInput: string | Date | null | undefined): string {
  return formatDate(dateInput, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export function getShipmentModeLabel(mode: string): string {
  const modes: Record<string, string> = {
    OCEAN_FCL: "Ocean (FCL)",
    OCEAN_LCL: "Ocean (LCL)",
    AIR: "Air Freight",
    ROAD: "Road / Trucking",
    RAIL: "Rail Freight",
  };
  return modes[mode] || mode;
}

export function getIncotermDescription(incoterm: string): string {
  const incoterms: Record<string, string> = {
    EXW: "Ex Works (Buyer assumes all risk & transport costs from seller's premises)",
    FOB: "Free on Board (Seller covers transport to port & loading; buyer pays main carriage)",
    CIF: "Cost, Insurance & Freight (Seller pays freight & basic insurance to destination port)",
    DDP: "Delivered Duty Paid (Seller assumes maximum responsibility including customs & import taxes)",
    DAP: "Delivered at Place (Seller delivers to destination; buyer pays import customs & duties)",
    FCA: "Free Carrier (Seller delivers to carrier specified by buyer)",
    CPT: "Carriage Paid To (Seller pays carriage to named place; risk transfers upon handover)",
    CIP: "Carriage and Insurance Paid To (Seller covers carriage and comprehensive insurance)",
  };
  return incoterms[incoterm] || incoterm;
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
