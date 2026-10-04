import { z } from 'zod';
import { ShipmentStatus, ShipmentMode, Incoterm } from '@/types/database';
import { SHIPMENT_MILESTONES } from '@/lib/constants';

export const shipmentEventSchema = z.object({
  shipment_id: z.string().uuid(),
  status: z.enum([
    'BOOKED',
    'DOCUMENTS_PENDING',
    'CARGO_RECEIVED',
    'DEPARTED_ORIGIN',
    'IN_TRANSIT',
    'ARRIVED_DESTINATION',
    'CUSTOMS_CLEARANCE',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'ON_HOLD',
    'CANCELLED',
  ] as const),
  event_title: z.string().min(2, 'Event title is required'),
  event_description: z.string().optional().nullable(),
  location_name: z.string().min(2, 'Location name is required'),
  location_country: z.string().max(2).optional().nullable(),
  occurred_at: z.string().min(1, 'Timestamp is required'),
  source: z.enum(['MANUAL', 'CARRIER_EDI', 'CARRIER_API', 'SYSTEM'] as const).default('MANUAL'),
  is_milestone: z.boolean().default(true),
  metadata: z.record(z.any()).optional().nullable(),
});

export const updateShipmentMilestoneSchema = z.object({
  shipment_id: z.string().uuid(),
  status: z.enum([
    'BOOKED',
    'DOCUMENTS_PENDING',
    'CARGO_RECEIVED',
    'DEPARTED_ORIGIN',
    'IN_TRANSIT',
    'ARRIVED_DESTINATION',
    'CUSTOMS_CLEARANCE',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'ON_HOLD',
    'CANCELLED',
  ] as const),
  location: z.string().min(2, 'Current location is required'),
  eventDescription: z.string().optional(),
  occurredAt: z.string().default(() => new Date().toISOString()),
});

export type ShipmentEventInput = z.infer<typeof shipmentEventSchema>;
export type UpdateShipmentMilestoneInput = z.infer<typeof updateShipmentMilestoneSchema>;

/**
 * Standard Carrier Tracking Adapter Interface
 * Enables integration with external carrier EDI/API networks (Maersk, MSC, Hapag-Lloyd, FlightAware, project44)
 */
export interface CarrierTrackingAdapter {
  carrierCode: string;
  carrierName: string;
  fetchTrackingEvents(trackingNumber: string): Promise<CarrierTrackingResult>;
  parseWebhookPayload(payload: unknown, headers: Record<string, string>): Promise<CarrierTrackingResult>;
}

export interface CarrierTrackingResult {
  trackingNumber: string;
  carrierReference?: string;
  status: ShipmentStatus;
  currentLocation?: string;
  estimatedArrival?: string;
  actualArrival?: string;
  events: Array<{
    status: ShipmentStatus;
    title: string;
    description?: string;
    location: string;
    countryCode?: string;
    occurredAt: string;
    rawCode?: string;
  }>;
}

export function getNextMilestone(currentStatus: ShipmentStatus): ShipmentStatus | null {
  const currentIndex = SHIPMENT_MILESTONES.findIndex((m) => m.status === currentStatus);
  if (currentIndex === -1 || currentIndex >= SHIPMENT_MILESTONES.length - 1) {
    return null;
  }
  return SHIPMENT_MILESTONES[currentIndex + 1].status;
}

export function getMilestoneProgressPercent(status: ShipmentStatus): number {
  const milestone = SHIPMENT_MILESTONES.find((m) => m.status === status);
  if (!milestone) return 0;
  return Math.round((milestone.step / SHIPMENT_MILESTONES.length) * 100);
}
