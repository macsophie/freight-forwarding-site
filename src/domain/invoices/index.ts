import { z } from 'zod';
import { InvoiceStatus } from '@/types/database';

export const invoiceItemSchema = z.object({
  description: z.string().min(2, 'Item description is required'),
  charge_category: z.string().min(2, 'Category is required (e.g. Ocean Freight, Terminal Handling, Customs)'),
  quantity: z.number().min(0.1).default(1),
  unit_price: z.number().min(0, 'Unit price cannot be negative'),
  is_taxable: z.boolean().default(false),
});

export const invoiceSchema = z.object({
  company_id: z.string().uuid('Company ID is required'),
  shipment_id: z.string().uuid().optional().nullable(),
  quote_id: z.string().uuid().optional().nullable(),
  currency: z.string().min(3).max(3).default('USD'),
  issue_date: z.string().default(() => new Date().toISOString().split('T')[0]),
  due_date: z.string().min(1, 'Due date is required'),
  tax_rate_percent: z.number().min(0).max(100).default(0),
  notes: z.string().optional().nullable(),
  items: z.array(invoiceItemSchema).min(1, 'At least one invoice line item is required'),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;

export function calculateInvoiceTotals(
  items: Array<{ quantity: number; unit_price: number; is_taxable: boolean }>,
  taxRatePercent: number,
  paidAmount: number = 0
) {
  let subtotal = 0;
  let taxableSubtotal = 0;

  for (const item of items) {
    const itemTotal = item.quantity * item.unit_price;
    subtotal += itemTotal;
    if (item.is_taxable) {
      taxableSubtotal += itemTotal;
    }
  }

  const taxAmount = (taxableSubtotal * taxRatePercent) / 100;
  const totalAmount = subtotal + taxAmount;
  const balanceDue = Math.max(0, totalAmount - paidAmount);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    balanceDue: Math.round(balanceDue * 100) / 100,
  };
}

export function getInvoiceStatusBadgeColor(status: InvoiceStatus): string {
  switch (status) {
    case 'PAID':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    case 'PARTIALLY_PAID':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    case 'ISSUED':
      return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
    case 'OVERDUE':
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    case 'DRAFT':
      return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    case 'CANCELLED':
    case 'VOID':
      return 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20';
  }
}
