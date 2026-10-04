import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { verifyCarrierSignature } from "@/app/api/webhooks/carrier/route";

describe("Carrier Tracking Webhook HMAC Verification", () => {
  const secret = "test_carrier_webhook_secret_key_12345";

  it("successfully authenticates a valid HMAC SHA-256 signature", () => {
    const rawPayload = JSON.stringify({
      tracking_number: "FWD-89210-US",
      carrier_name: "Maersk Line",
      status: "IN_TRANSIT",
      event_title: "Vessel underway across Pacific",
      location_name: "Mid-Pacific Transit Corridor",
    });

    const validSignature = crypto
      .createHmac("sha256", secret)
      .update(rawPayload, "utf8")
      .digest("hex");

    const result = verifyCarrierSignature(rawPayload, validSignature, secret);
    expect(result).toBe(true);
  });

  it("accepts signatures prefixed with 'sha256='", () => {
    const rawPayload = JSON.stringify({
      tracking_number: "FWD-44102-EU",
      carrier_name: "Lufthansa Cargo",
      status: "CUSTOMS_CLEARANCE",
      event_title: "Import customs clearance started",
      location_name: "Frankfurt Airport (FRA)",
    });

    const signature = crypto
      .createHmac("sha256", secret)
      .update(rawPayload, "utf8")
      .digest("hex");

    const prefixedSignature = `sha256=${signature}`;

    const result = verifyCarrierSignature(rawPayload, prefixedSignature, secret);
    expect(result).toBe(true);
  });

  it("rejects an invalid or tampered signature", () => {
    const rawPayload = JSON.stringify({
      tracking_number: "FWD-89210-US",
      carrier_name: "Maersk Line",
      status: "IN_TRANSIT",
      event_title: "Vessel underway across Pacific",
      location_name: "Mid-Pacific",
    });

    const invalidSignature = "deadbeef1234567890abcdefdeadbeef1234567890abcdefdeadbeef12345678";

    const result = verifyCarrierSignature(rawPayload, invalidSignature, secret);
    expect(result).toBe(false);
  });

  it("rejects when the payload body has been altered after signing", () => {
    const originalPayload = JSON.stringify({
      tracking_number: "FWD-89210-US",
      carrier_name: "Maersk Line",
      status: "IN_TRANSIT",
    });

    const signature = crypto
      .createHmac("sha256", secret)
      .update(originalPayload, "utf8")
      .digest("hex");

    const tamperedPayload = JSON.stringify({
      tracking_number: "FWD-89210-US",
      carrier_name: "Maersk Line",
      status: "DELIVERED", // Tampered status
    });

    const result = verifyCarrierSignature(tamperedPayload, signature, secret);
    expect(result).toBe(false);
  });

  it("rejects missing signature or secret", () => {
    expect(verifyCarrierSignature("{}", null, secret)).toBe(false);
    expect(verifyCarrierSignature("{}", "", secret)).toBe(false);
    expect(verifyCarrierSignature("{}", "some-sig", "")).toBe(false);
  });
});
