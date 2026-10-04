import { z } from 'zod';
import { UserRole } from '@/types/database';

export const auditLogSchema = z.object({
  actor_id: z.string().uuid().optional().nullable(),
  actor_email: z.string().email(),
  actor_role: z.enum([
    'SUPER_ADMIN',
    'OPERATIONS_MANAGER',
    'OPERATIONS_AGENT',
    'FINANCE',
    'SUPPORT',
    'CUSTOMER_ADMIN',
    'CUSTOMER_USER',
  ] as const),
  company_id: z.string().uuid().optional().nullable(),
  action: z.string().min(2),
  entity_type: z.string().min(2),
  entity_id: z.string().uuid(),
  changes: z.record(z.any()).optional().nullable(),
  ip_address: z.string().optional().nullable(),
  user_agent: z.string().optional().nullable(),
});

export type AuditLogInput = z.infer<typeof auditLogSchema>;

export interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  actor_email: string;
  actor_role: UserRole;
  company_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  changes: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}
