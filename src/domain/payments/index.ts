import { z } from 'zod';
import { PaymentStatus } from '@/types/database';

export const recordPaymentSchema = z.object({
  invoice_id: z.string().uuid('Invoice ID is required'),
  company_id: z.string().uuid('Company ID is required'),
  amount: z.number().min(0.01, 'Payment amount must be greater than zero'),
  currency: z.string().min(3).max(3).default('USD'),
  payment_method: z.enum(['BANK_TRANSFER', 'CREDIT_CARD', 'ACH_DIRECT_DEBIT', 'CHECK', 'WIRE'] as const),
  transaction_id: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;

export interface PaymentGatewayAdapter {
  providerName: string;
  createPaymentIntent(invoiceId: string, amount: number, currency: string): Promise<{ clientSecret: string; paymentIntentId: string }>;
  confirmPayment(paymentIntentId: string): Promise<{ status: PaymentStatus; transactionId: string }>;
}
