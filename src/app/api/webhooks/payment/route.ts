import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { createServiceRoleClient } from "@/utils/supabase/service-role";

const paymentWebhookSchema = z.object({
  event_type: z.enum([
    "payment_intent.succeeded",
    "invoice.payment_succeeded",
    "charge.succeeded",
    "b2b_transfer.settled",
  ]),
  payment_id: z.string().min(1),
  invoice_id: z.string().min(1),
  amount: z.number().min(0.01),
  currency: z.string().default("USD"),
  payment_method: z
    .enum(["BANK_TRANSFER", "CREDIT_CARD", "ACH_DIRECT_DEBIT", "CHECK", "WIRE"])
    .default("CREDIT_CARD"),
  settled_at: z.string().default(() => new Date().toISOString()),
  notes: z.string().optional().nullable(),
});

/**
 * Verifies webhook signature for payment gateway
 */
export function verifyPaymentSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader || !secret) {
    return false;
  }

  try {
    // If Stripe signature header format: "t=12345,v1=abcde..."
    if (signatureHeader.includes("t=") && signatureHeader.includes("v1=")) {
      const parts = signatureHeader.split(",");
      const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
      const v1 = parts.find((p) => p.startsWith("v1="))?.slice(3);

      if (!timestamp || !v1) return false;

      const signedPayload = `${timestamp}.${rawBody}`;
      const expected = crypto
        .createHmac("sha256", secret)
        .update(signedPayload, "utf8")
        .digest("hex");

      const sigBuf = Buffer.from(v1, "hex");
      const expBuf = Buffer.from(expected, "hex");
      if (sigBuf.length !== expBuf.length) return false;
      return crypto.timingSafeEqual(sigBuf, expBuf);
    }

    // Generic HMAC signature
    const cleanSignature = signatureHeader.startsWith("sha256=")
      ? signatureHeader.slice(7)
      : signatureHeader;

    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody, "utf8")
      .digest("hex");

    const sigBuf = Buffer.from(cleanSignature, "hex");
    const expBuf = Buffer.from(expected, "hex");
    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const secret =
    process.env.PAYMENT_WEBHOOK_SECRET ||
    process.env.STRIPE_WEBHOOK_SECRET ||
    "forwardflow_default_payment_webhook_secret_2026";

  const signature =
    req.headers.get("stripe-signature") ||
    req.headers.get("x-payment-signature") ||
    req.headers.get("x-signature-256");

  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json(
      { error: "Unable to read request payload" },
      { status: 400 }
    );
  }

  const isAuthorized = verifyPaymentSignature(rawBody, signature, secret);
  if (!isAuthorized) {
    return NextResponse.json(
      { error: "Invalid payment webhook signature" },
      { status: 401 }
    );
  }

  let jsonPayload: any;
  try {
    jsonPayload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Handle standard Stripe webhook payload nesting if present
  let normalizedData = jsonPayload;
  if (jsonPayload?.type && jsonPayload?.data?.object) {
    const obj = jsonPayload.data.object;
    normalizedData = {
      event_type: jsonPayload.type,
      payment_id: obj.id || `PAY-${Date.now()}`,
      invoice_id: obj.metadata?.invoice_id || obj.invoice || obj.id,
      amount: obj.amount ? obj.amount / 100 : obj.total || 0,
      currency: (obj.currency || "USD").toUpperCase(),
      payment_method: "CREDIT_CARD",
      settled_at: new Date().toISOString(),
      notes: "Stripe Automated Payment Intent Settlement",
    };
  }

  const parseResult = paymentWebhookSchema.safeParse(normalizedData);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid schema", details: parseResult.error.issues },
      { status: 422 }
    );
  }

  const data = parseResult.data;
  const serviceClient = createServiceRoleClient();

  // Find invoice by ID or invoice number
  const { data: invoice, error: findErr } = await serviceClient
    .from("invoices")
    .select("id, invoice_number, company_id, total_amount, paid_amount, balance_due, status")
    .or(`id.eq.${data.invoice_id},invoice_number.eq.${data.invoice_id}`)
    .maybeSingle();

  if (findErr) {
    console.error("Payment webhook database query error:", findErr);
    return NextResponse.json(
      { error: "Database error querying invoice" },
      { status: 500 }
    );
  }

  if (!invoice) {
    return NextResponse.json(
      {
        received: true,
        matched: false,
        message: `No active invoice found matching identifier ${data.invoice_id}`,
      },
      { status: 200 }
    );
  }

  // Calculate updated balances
  const previousPaid = Number(invoice.paid_amount || 0);
  const newPaymentAmount = Number(data.amount);
  const updatedPaidAmount = Math.round((previousPaid + newPaymentAmount) * 100) / 100;
  const updatedBalanceDue = Math.max(0, Math.round((Number(invoice.total_amount) - updatedPaidAmount) * 100) / 100);
  const isFullySettled = updatedBalanceDue <= 0.01;
  const newStatus = isFullySettled ? "PAID" : "PARTIALLY_PAID";

  // 1. Record payment in payments table
  const paymentReference = `PAY-${Date.now().toString().slice(-6)}`;
  const { error: payErr } = await serviceClient.from("payments").insert({
    payment_reference: paymentReference,
    company_id: invoice.company_id,
    invoice_id: invoice.id,
    amount: newPaymentAmount,
    currency: data.currency,
    payment_method: data.payment_method,
    status: "SUCCEEDED",
    transaction_id: data.payment_id,
    processed_at: data.settled_at,
    notes: data.notes || "Automated payment settlement",
  });

  if (payErr) {
    console.error("Failed to insert payment record:", payErr);
  }

  // 2. Update invoice status & balances
  const { error: updateErr } = await serviceClient
    .from("invoices")
    .update({
      status: newStatus,
      paid_amount: updatedPaidAmount,
      balance_due: updatedBalanceDue,
      paid_at: isFullySettled ? data.settled_at : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", invoice.id);

  if (updateErr) {
    console.error("Failed to update invoice balances:", updateErr);
    return NextResponse.json(
      { error: "Failed to update invoice balances" },
      { status: 500 }
    );
  }

  // 3. Dispatch customer notification
  try {
    const { data: companyUsers } = await serviceClient
      .from("company_users")
      .select("user_id")
      .eq("company_id", invoice.company_id);

    if (companyUsers && companyUsers.length > 0) {
      const notifications = companyUsers.map((cu) => ({
        user_id: cu.user_id,
        company_id: invoice.company_id,
        title: `Payment Received — Invoice ${invoice.invoice_number}`,
        message: `Payment of $${newPaymentAmount.toFixed(2)} ${data.currency} successfully received. Current balance: $${updatedBalanceDue.toFixed(2)}.`,
        category: "INVOICE" as const,
        reference_id: invoice.id,
        reference_type: "invoice",
      }));
      await serviceClient.from("notifications").insert(notifications);
    }
  } catch (notifyErr) {
    console.warn("Non-fatal notification error:", notifyErr);
  }

  // 4. Audit Log
  try {
    await serviceClient.from("audit_logs").insert({
      actor_email: "gateway-webhook@payments.forwardflow.com",
      actor_role: "FINANCE",
      company_id: invoice.company_id,
      action: "PAYMENT_SETTLED",
      entity_type: "invoices",
      entity_id: invoice.id,
      changes: {
        paymentId: data.payment_id,
        amount: newPaymentAmount,
        currency: data.currency,
        newStatus,
        remainingBalance: updatedBalanceDue,
      },
    });
  } catch (auditErr) {
    console.warn("Non-fatal audit log error:", auditErr);
  }

  return NextResponse.json({
    success: true,
    matched: true,
    invoice_id: invoice.id,
    invoice_number: invoice.invoice_number,
    new_status: newStatus,
    balance_due: updatedBalanceDue,
    message: "Payment successfully reconciled and applied to invoice",
  });
}
