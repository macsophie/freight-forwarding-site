import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { calculateInvoiceTotals } from "@/domain/invoices";
import { verifyPaymentSignature } from "@/app/api/webhooks/payment/route";

describe("Invoice Calculations & Tax Assessment", () => {
  it("calculates accurate subtotal, taxes, and balance due for mixed taxable items", () => {
    const items = [
      { quantity: 1, unit_price: 2400, is_taxable: false }, // Ocean Freight (typically 0% or duty-exempt international carriage)
      { quantity: 1, unit_price: 350, is_taxable: true },   // Destination Handling (local VAT taxable)
      { quantity: 1, unit_price: 150, is_taxable: true },   // Customs Documentation (taxable)
    ];

    const taxRatePercent = 20; // 20% VAT
    const totals = calculateInvoiceTotals(items, taxRatePercent, 0);

    expect(totals.subtotal).toBe(2900); // 2400 + 350 + 150
    expect(totals.taxAmount).toBe(100); // 20% of (350 + 150 = 500)
    expect(totals.totalAmount).toBe(3000);
    expect(totals.balanceDue).toBe(3000);
  });

  it("calculates balance due correctly after partial payment", () => {
    const items = [{ quantity: 1, unit_price: 5000, is_taxable: false }];
    const totals = calculateInvoiceTotals(items, 0, 2000); // Paid $2,000 deposit

    expect(totals.totalAmount).toBe(5000);
    expect(totals.balanceDue).toBe(3000);
  });

  it("prevents negative balance due if payment exceeds total amount", () => {
    const items = [{ quantity: 1, unit_price: 1000, is_taxable: false }];
    const totals = calculateInvoiceTotals(items, 0, 1500);

    expect(totals.balanceDue).toBe(0);
  });
});

describe("Payment Gateway Webhook Signature Verification", () => {
  const secret = "whsec_test_stripe_secret_key_89234";

  it("authenticates Stripe-formatted signatures: 't=timestamp,v1=hash'", () => {
    const rawPayload = JSON.stringify({
      type: "payment_intent.succeeded",
      id: "evt_test123",
      data: {
        object: {
          id: "pi_98231",
          amount: 300000,
          currency: "usd",
        },
      },
    });

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signedPayload = `${timestamp}.${rawPayload}`;
    const v1Signature = crypto
      .createHmac("sha256", secret)
      .update(signedPayload, "utf8")
      .digest("hex");

    const header = `t=${timestamp},v1=${v1Signature}`;

    const isValid = verifyPaymentSignature(rawPayload, header, secret);
    expect(isValid).toBe(true);
  });

  it("authenticates generic hex HMAC signatures", () => {
    const rawPayload = JSON.stringify({
      event_type: "b2b_transfer.settled",
      payment_id: "wire_00291",
      amount: 4500,
    });

    const signature = crypto
      .createHmac("sha256", secret)
      .update(rawPayload, "utf8")
      .digest("hex");

    const isValid = verifyPaymentSignature(rawPayload, signature, secret);
    expect(isValid).toBe(true);
  });

  it("rejects forged or modified signatures", () => {
    const rawPayload = JSON.stringify({ amount: 1000 });
    const forgedHeader = "t=1700000000,v1=badbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbad";

    const isValid = verifyPaymentSignature(rawPayload, forgedHeader, secret);
    expect(isValid).toBe(false);
  });
});
