import { z } from 'zod';

export const notificationSchema = z.object({
  user_id: z.string().uuid(),
  company_id: z.string().uuid().optional().nullable(),
  title: z.string().min(2),
  message: z.string().min(2),
  category: z.enum(['SHIPMENT', 'QUOTE', 'INVOICE', 'DOCUMENT', 'SYSTEM'] as const),
  reference_id: z.string().uuid().optional().nullable(),
  reference_type: z.string().optional().nullable(),
});

export type NotificationInput = z.infer<typeof notificationSchema>;

export interface EmailNotificationPayload {
  to: string;
  subject: string;
  html: string;
  category: 'SHIPMENT_UPDATE' | 'QUOTE_ISSUED' | 'INVOICE_GENERATED' | 'DOCUMENT_UPLOADED' | 'ACCOUNT_ALERT';
}
