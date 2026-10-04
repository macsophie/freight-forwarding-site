import { z } from 'zod';
import { CompanyStatus } from '@/types/database';

export const companySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Company name is required'),
  legal_name: z.string().optional().nullable(),
  tax_id: z.string().optional().nullable(),
  eori_number: z.string().optional().nullable(),
  registration_number: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  website: z.string().url('Invalid website URL').optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  email: z.string().email('Valid company email is required'),
  status: z.enum(['ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED', 'INACTIVE'] as const).default('ACTIVE'),
  credit_limit: z.number().min(0).default(0),
  currency: z.string().min(3).max(3).default('USD'),
  notes: z.string().optional().nullable(),
});

export type CompanyFormData = z.infer<typeof companySchema>;

export interface CompanySummary {
  id: string;
  name: string;
  legal_name: string | null;
  tax_id: string | null;
  email: string;
  phone: string | null;
  status: CompanyStatus;
  credit_limit: number;
  currency: string;
  total_active_shipments?: number;
  total_spend_usd?: number;
  created_at: string;
}
