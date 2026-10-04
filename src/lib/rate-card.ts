/**
 * Rate Card Engine — Trade Lane Corridors & Customer Volume Tier Margins
 * Provides standardized freight pricing calculations across major international trade lanes.
 */

import { ShipmentMode } from '@/types/database';

export type TradeLaneCorridor =
  | 'TRANSPACIFIC_EB'   // Asia to North America Eastbound
  | 'TRANSPACIFIC_WB'   // North America to Asia Westbound
  | 'ASIA_EUROPE_WB'    // Asia to Europe Westbound
  | 'ASIA_EUROPE_EB'    // Europe to Asia Eastbound
  | 'TRANSATLANTIC_WB'  // Europe to North America Westbound
  | 'TRANSATLANTIC_EB'  // North America to Europe Eastbound
  | 'MIDDLE_EAST_ASIA'  // Middle East <-> Asia
  | 'GLOBAL_OTHER';     // Rest of world

export type CustomerVolumeTier = 'STANDARD' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface RateCardQuoteParams {
  corridor: TradeLaneCorridor;
  mode: ShipmentMode;
  grossWeightKg: number;
  totalCbm: number;
  tier?: CustomerVolumeTier;
  isHazardous?: boolean;
}

export interface DetailedRateBreakdown {
  corridor: TradeLaneCorridor;
  mode: ShipmentMode;
  tier: CustomerVolumeTier;
  baseFreight: number;
  bunkerFuelSurcharge: number;
  terminalHandlingCharges: number;
  customsDocumentationFee: number;
  hazardousSurcharge: number;
  volumeTierDiscount: number;
  netTotalAmount: number;
  currency: string;
  transitDaysEstimate: number;
}

export const TIER_DISCOUNT_PERCENT: Record<CustomerVolumeTier, number> = {
  STANDARD: 0,
  SILVER: 5,
  GOLD: 10,
  PLATINUM: 15,
};

// Base pricing constants per corridor (in USD)
export const CORRIDOR_PROFILES: Record<
  TradeLaneCorridor,
  {
    transitDaysOceanFCL: number;
    transitDaysAir: number;
    oceanFcl20ftBase: number;
    oceanLclPerCbm: number;
    airPerKg: number;
  }
> = {
  TRANSPACIFIC_EB: {
    transitDaysOceanFCL: 18,
    transitDaysAir: 3,
    oceanFcl20ftBase: 2400,
    oceanLclPerCbm: 95,
    airPerKg: 4.8,
  },
  TRANSPACIFIC_WB: {
    transitDaysOceanFCL: 22,
    transitDaysAir: 4,
    oceanFcl20ftBase: 1600,
    oceanLclPerCbm: 75,
    airPerKg: 3.9,
  },
  ASIA_EUROPE_WB: {
    transitDaysOceanFCL: 28,
    transitDaysAir: 4,
    oceanFcl20ftBase: 2900,
    oceanLclPerCbm: 110,
    airPerKg: 5.2,
  },
  ASIA_EUROPE_EB: {
    transitDaysOceanFCL: 32,
    transitDaysAir: 5,
    oceanFcl20ftBase: 1750,
    oceanLclPerCbm: 80,
    airPerKg: 4.1,
  },
  TRANSATLANTIC_WB: {
    transitDaysOceanFCL: 14,
    transitDaysAir: 2,
    oceanFcl20ftBase: 2100,
    oceanLclPerCbm: 85,
    airPerKg: 3.5,
  },
  TRANSATLANTIC_EB: {
    transitDaysOceanFCL: 15,
    transitDaysAir: 2,
    oceanFcl20ftBase: 1950,
    oceanLclPerCbm: 80,
    airPerKg: 3.4,
  },
  MIDDLE_EAST_ASIA: {
    transitDaysOceanFCL: 16,
    transitDaysAir: 3,
    oceanFcl20ftBase: 1800,
    oceanLclPerCbm: 70,
    airPerKg: 3.8,
  },
  GLOBAL_OTHER: {
    transitDaysOceanFCL: 25,
    transitDaysAir: 5,
    oceanFcl20ftBase: 2200,
    oceanLclPerCbm: 90,
    airPerKg: 4.5,
  },
};

/**
 * Determines the trade lane corridor from origin and destination country codes
 */
export function resolveTradeCorridor(
  originCountry: string,
  destCountry: string
): TradeLaneCorridor {
  const o = originCountry.toUpperCase();
  const d = destCountry.toUpperCase();

  const isOriginAsia = ['CN', 'JP', 'KR', 'TW', 'VN', 'SG', 'TH', 'MY', 'IN'].includes(o);
  const isDestAsia = ['CN', 'JP', 'KR', 'TW', 'VN', 'SG', 'TH', 'MY', 'IN'].includes(d);

  const isOriginUS = ['US', 'CA', 'MX'].includes(o);
  const isDestUS = ['US', 'CA', 'MX'].includes(d);

  const isOriginEU = ['GB', 'DE', 'FR', 'NL', 'BE', 'IT', 'ES', 'PL'].includes(o);
  const isDestEU = ['GB', 'DE', 'FR', 'NL', 'BE', 'IT', 'ES', 'PL'].includes(d);

  if (isOriginAsia && isDestUS) return 'TRANSPACIFIC_EB';
  if (isOriginUS && isDestAsia) return 'TRANSPACIFIC_WB';
  if (isOriginAsia && isDestEU) return 'ASIA_EUROPE_WB';
  if (isOriginEU && isDestAsia) return 'ASIA_EUROPE_EB';
  if (isOriginEU && isDestUS) return 'TRANSATLANTIC_WB';
  if (isOriginUS && isDestEU) return 'TRANSATLANTIC_EB';
  if (['AE', 'SA', 'QA'].includes(o) || ['AE', 'SA', 'QA'].includes(d)) return 'MIDDLE_EAST_ASIA';

  return 'GLOBAL_OTHER';
}

/**
 * Calculates itemized freight pricing using corridor rates and customer volume tier discounts.
 */
export function calculateRateCardQuote(params: RateCardQuoteParams): DetailedRateBreakdown {
  const {
    corridor,
    mode,
    grossWeightKg,
    totalCbm,
    tier = 'STANDARD',
    isHazardous = false,
  } = params;

  const profile = CORRIDOR_PROFILES[corridor] || CORRIDOR_PROFILES.GLOBAL_OTHER;

  let baseFreight = 0;
  let transitDays = 20;

  switch (mode) {
    case 'OCEAN_FCL': {
      // Containers needed (standard 20ft container ~33 CBM)
      const containerCount = Math.max(1, Math.ceil(totalCbm / 30));
      baseFreight = containerCount * profile.oceanFcl20ftBase;
      transitDays = profile.transitDaysOceanFCL;
      break;
    }
    case 'OCEAN_LCL': {
      // Chargeable by CBM (minimum 1 CBM)
      const billableCbm = Math.max(1, totalCbm);
      baseFreight = billableCbm * profile.oceanLclPerCbm;
      transitDays = profile.transitDaysOceanFCL + 4; // LCL consolidation buffer
      break;
    }
    case 'AIR': {
      // IATA Volumetric Ratio: 1 CBM = 167 KG
      const volumetricWeight = totalCbm * 167;
      const chargeableWeight = Math.max(grossWeightKg, volumetricWeight, 45); // min 45kg
      baseFreight = chargeableWeight * profile.airPerKg;
      transitDays = profile.transitDaysAir;
      break;
    }
    case 'ROAD': {
      baseFreight = Math.max(250, grossWeightKg * 0.4 + totalCbm * 40);
      transitDays = 4;
      break;
    }
    case 'RAIL': {
      baseFreight = Math.max(800, totalCbm * 65);
      transitDays = 18;
      break;
    }
  }

  // Surcharges
  const bunkerFuelSurcharge = Math.round(baseFreight * 0.12); // 12% BAF
  const terminalHandlingCharges = mode === 'AIR' ? 180 : 320;
  const customsDocumentationFee = 150;
  const hazardousSurcharge = isHazardous ? Math.max(200, Math.round(baseFreight * 0.2)) : 0;

  const grossTotal =
    baseFreight +
    bunkerFuelSurcharge +
    terminalHandlingCharges +
    customsDocumentationFee +
    hazardousSurcharge;

  // Tier Discount
  const discountPercent = TIER_DISCOUNT_PERCENT[tier] || 0;
  const volumeTierDiscount = Math.round((grossTotal * discountPercent) / 100);
  const netTotalAmount = Math.max(100, grossTotal - volumeTierDiscount);

  return {
    corridor,
    mode,
    tier,
    baseFreight: Math.round(baseFreight),
    bunkerFuelSurcharge,
    terminalHandlingCharges,
    customsDocumentationFee,
    hazardousSurcharge,
    volumeTierDiscount,
    netTotalAmount: Math.round(netTotalAmount),
    currency: 'USD',
    transitDaysEstimate: transitDays,
  };
}
