"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/utils/supabase/service-role";
import { getCurrentProfile } from "@/domain/auth/server";
import {
  invoiceSchema,
  InvoiceInput,
  calculateInvoiceTotals,
} from "./index";
import { recordPaymentSchema, RecordPaymentInput } from "@/domain/payments";

export interface InvoiceActionResult<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Creates a commercial invoice with itemized line items and tax calculations.
 */
export async function createInvoiceAction(
  rawInput: InvoiceInput
): Promise<InvoiceActionResult<{ invoiceId: string; invoiceNumber: string }>> {
  const profile = await getCurrentProfile();
  if (!profile) return { success: false, error: "Unauthorized." };

  const parsed = invoiceSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid invoice parameters",
    };
  }

  const data = parsed.data;
  const serviceClient = createServiceRoleClient();

  const totals = calculateInvoiceTotals(
    data.items.map((i) => ({
      quantity: i.quantity,
      unit_price: i.unit_price,
      is_taxable: i.is_taxable,
    })),
    data.tax_rate_percent,
    0
  );

  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const invoiceNumber = `INV-${new Date().getFullYear()}-${randomDigits}`;

  // 1. Insert Invoice
  const { data: newInvoice, error: invErr } = await serviceClient
    .from("invoices")
    .insert({
      invoice_number: invoiceNumber,
      company_id: data.company_id,
      shipment_id: data.shipment_id || null,
      quote_id: data.quote_id || null,
      status: "ISSUED",
      currency: data.currency,
      subtotal: totals.subtotal,
      tax_rate_percent: data.tax_rate_percent,
      tax_amount: totals.taxAmount,
      total_amount: totals.totalAmount,
      paid_amount: 0,
      balance_due: totals.balanceDue,
      issue_date: data.issue_date,
      due_date: data.due_date,
      notes: data.notes || null,
    })
    .select("id")
    .single();

  if (invErr || !newInvoice) {
    return { success: false, error: "Failed to create invoice record." };
  }

  // 2. Insert Invoice Items
  const itemsToInsert = data.items.map((item) => ({
    invoice_id: newInvoice.id,
    description: item.description,
    charge_category: item.charge_category,
    quantity: item.quantity,
    unit_price: item.unit_price,
    amount: Math.round(item.quantity * item.unit_price * 100) / 100,
    is_taxable: item.is_taxable,
  }));

  await serviceClient.from("invoice_items").insert(itemsToInsert);

  // 3. Customer Notification
  try {
    const { data: companyUsers } = await serviceClient
      .from("company_users")
      .select("user_id")
      .eq("company_id", data.company_id);

    if (companyUsers && companyUsers.length > 0) {
      const notes = companyUsers.map((u) => ({
        user_id: u.user_id,
        company_id: data.company_id,
        title: `Invoice Generated: ${invoiceNumber}`,
        message: `Commercial invoice for $${totals.totalAmount.toFixed(2)} ${data.currency} issued. Due date: ${data.due_date}.`,
        category: "INVOICE" as const,
        reference_id: newInvoice.id,
        reference_type: "invoice",
      }));
      await serviceClient.from("notifications").insert(notes);
    }
  } catch (notifyErr) {
    console.warn("Non-fatal invoice notification error:", notifyErr);
  }

  // 4. Audit Log
  try {
    await serviceClient.from("audit_logs").insert({
      actor_id: profile.id,
      actor_email: profile.email,
      actor_role: profile.role,
      company_id: data.company_id,
      action: "INVOICE_GENERATED",
      entity_type: "invoices",
      entity_id: newInvoice.id,
      changes: {
        invoiceNumber,
        totalAmount: totals.totalAmount,
        dueDate: data.due_date,
      },
    });
  } catch (auditErr) {
    console.warn("Non-fatal audit error:", auditErr);
  }

  revalidatePath("/admin/invoices");
  revalidatePath("/portal/invoices");

  return {
    success: true,
    data: {
      invoiceId: newInvoice.id,
      invoiceNumber,
    },
  };
}

/**
 * Record a manual or direct debit payment settlement against an outstanding invoice.
 */
export async function recordInvoicePaymentAction(
  rawInput: RecordPaymentInput
): Promise<InvoiceActionResult> {
  const profile = await getCurrentProfile();
  if (!profile) return { success: false, error: "Unauthorized." };

  const parsed = recordPaymentSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid payment record",
    };
  }

  const data = parsed.data;
  const serviceClient = createServiceRoleClient();

  // Fetch invoice
  const { data: invoice, error: getErr } = await serviceClient
    .from("invoices")
    .select("id, invoice_number, total_amount, paid_amount")
    .eq("id", data.invoice_id)
    .single();

  if (getErr || !invoice) {
    return { success: false, error: "Invoice not found." };
  }

  const currentPaid = Number(invoice.paid_amount || 0);
  const updatedPaid = Math.round((currentPaid + data.amount) * 100) / 100;
  const updatedBalance = Math.max(0, Math.round((Number(invoice.total_amount) - updatedPaid) * 100) / 100);
  const newStatus = updatedBalance <= 0.01 ? "PAID" : "PARTIALLY_PAID";

  const paymentReference = `PAY-${Date.now().toString().slice(-6)}`;

  // Insert payment
  await serviceClient.from("payments").insert({
    payment_reference: paymentReference,
    company_id: data.company_id,
    invoice_id: data.invoice_id,
    amount: data.amount,
    currency: data.currency,
    payment_method: data.payment_method,
    status: "SUCCEEDED",
    transaction_id: data.transaction_id || null,
    recorded_by: profile.id,
    notes: data.notes || null,
  });

  // Update invoice
  await serviceClient
    .from("invoices")
    .update({
      status: newStatus,
      paid_amount: updatedPaid,
      balance_due: updatedBalance,
      paid_at: newStatus === "PAID" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.invoice_id);

  // Audit Log
  try {
    await serviceClient.from("audit_logs").insert({
      actor_id: profile.id,
      actor_email: profile.email,
      actor_role: profile.role,
      company_id: data.company_id,
      action: "MANUAL_PAYMENT_RECORDED",
      entity_type: "invoices",
      entity_id: data.invoice_id,
      changes: {
        amount: data.amount,
        paymentReference,
        newStatus,
        remainingBalance: updatedBalance,
      },
    });
  } catch (auditErr) {
    console.warn("Non-fatal audit error:", auditErr);
  }

  revalidatePath("/admin/invoices");
  revalidatePath("/admin/payments");
  revalidatePath("/portal/invoices");

  return { success: true };
}
