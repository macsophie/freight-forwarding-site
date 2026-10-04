import { z } from 'zod';
import { BookingStatus } from '@/types/database';

export const createBookingSchema = z.object({
  quote_id: z.string().uuid().optional().nullable(),
  company_id: z.string().uuid('Company ID is required'),
  carrier_name: z.string().optional().nullable(),
  carrier_booking_reference: z.string().optional().nullable(),
  cargo_cutoff_date: z.string().optional().nullable(),
  document_cutoff_date: z.string().optional().nullable(),
  estimated_departure_date: z.string().optional().nullable(),
  estimated_arrival_date: z.string().optional().nullable(),
  special_requirements: z.string().optional().nullable(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'CANCELLED', 'COMPLETED'] as const),
  notes: z.string().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;

export function getBookingStatusBadgeColor(status: BookingStatus): string {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    case 'PROCESSING':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    case 'PENDING':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    case 'CANCELLED':
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    case 'COMPLETED':
      return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
  }
}
