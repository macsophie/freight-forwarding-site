import { z } from 'zod';
import { ShipmentMode, Incoterm, QuoteStatus } from '@/types/database';

export const quoteItemSchema = z.object({
  id: z.string().uuid().optional(),
  package_type: z.string().min(1, 'Package type is required (e.g. Pallet, Box, 20ft Container)'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  length_cm: z.number().min(0).optional().nullable(),
  width_cm: z.number().min(0).optional().nullable(),
  height_cm: z.number().min(0).optional().nullable(),
  gross_weight_kg: z.number().min(0.1, 'Gross weight is required'),
  total_volume_cbm: z.number().min(0.001, 'Total volume (CBM) is required'),
  commodity_description: z.string().min(2, 'Commodity description is required'),
  hs_code: z.string().optional().nullable(),
  is_hazardous: z.boolean().default(false),
  un_number: z.string().optional().nullable(),
  hazard_class: z.string().optional().nullable(),
  temperature_control: z.string().optional().nullable(),
});

export const quoteRequestSchema = z.object({
  mode: z.enum(['OCEAN_FCL', 'OCEAN_LCL', 'AIR', 'ROAD', 'RAIL'] as const),
  incoterm: z.enum(['EXW', 'FOB', 'CIF', 'DDP', 'DAP', 'FCA', 'CPT', 'CIP'] as const),
  origin_name: z.string().min(2, 'Origin city / location is required'),
  origin_port: z.string().min(2, 'Origin port / airport is required'),
  origin_country: z.string().min(2).max(2, '2-letter country code required'),
  destination_name: z.string().min(2, 'Destination city / location is required'),
  destination_port: z.string().min(2, 'Destination port / airport is required'),
  destination_country: z.string().min(2).max(2, '2-letter country code required'),
  cargo_ready_date: z.string().min(1, 'Cargo ready date is required'),
  target_delivery_date: z.string().optional().nullable(),
  special_instructions: z.string().optional().nullable(),
  items: z.array(quoteItemSchema).min(1, 'At least one cargo item is required'),
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;
export type QuoteItemInput = z.infer<typeof quoteItemSchema>;

/**
 * Calculates air freight volumetric weight (standard IATA formula: CBM * 167 or (L*W*H / 6000))
 */
export function calculateAirVolumetricWeightKg(
  lengthCm: number,
  widthCm: number,
  heightCm: number,
  quantity: number
): number {
  return ((lengthCm * widthCm * heightCm) / 6000) * quantity;
}

/**
 * Calculates total CBM from dimensions in cm
 */
export function calculateCBM(
  lengthCm: number,
  widthCm: number,
  heightCm: number,
  quantity: number
): number {
  return ((lengthCm * widthCm * heightCm) / 1_000_000) * quantity;
}

/**
 * Indicative freight charge estimation based on mode, weight, and volume
 */
export function estimateFreightCharges(
  mode: ShipmentMode,
  grossWeightKg: number,
  totalCbm: number
): {
  freightCharge: number;
  originCharges: number;
  destinationCharges: number;
  customsCharges: number;
  insuranceCharge: number;
  estimatedTransitDays: number;
  totalAmount: number;
} {
  let freightCharge = 0;
  let originCharges = 250;
  let destinationCharges = 350;
  let customsCharges = 200;
  let insuranceCharge = 75;
  let estimatedTransitDays = 25;

  switch (mode) {
    case 'OCEAN_FCL':
      freightCharge = Math.max(1800, Math.ceil(totalCbm / 30) * 2200);
      estimatedTransitDays = 28;
      break;
    case 'OCEAN_LCL':
      freightCharge = Math.max(350, totalCbm * 85);
      estimatedTransitDays = 32;
      break;
    case 'AIR':
      const chargeableWeight = Math.max(grossWeightKg, totalCbm * 167);
      freightCharge = Math.max(450, chargeableWeight * 4.5);
      estimatedTransitDays = 5;
      originCharges = 150;
      destinationCharges = 200;
      break;
    case 'ROAD':
      freightCharge = Math.max(300, grossWeightKg * 0.45 + totalCbm * 40);
      estimatedTransitDays = 3;
      originCharges = 80;
      destinationCharges = 100;
      break;
    case 'RAIL':
      freightCharge = Math.max(900, totalCbm * 65);
      estimatedTransitDays = 16;
      break;
  }

  const totalAmount =
    freightCharge + originCharges + destinationCharges + customsCharges + insuranceCharge;

  return {
    freightCharge: Math.round(freightCharge),
    originCharges,
    destinationCharges,
    customsCharges,
    insuranceCharge,
    estimatedTransitDays,
    totalAmount: Math.round(totalAmount),
  };
}
