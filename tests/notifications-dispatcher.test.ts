import { describe, it, expect } from "vitest";
import {
  renderBookingConfirmationEmail,
  renderMilestoneUpdateEmail,
  renderCustomsHoldNoticeEmail,
  formatUrgentSmsAlert,
} from "@/domain/notifications/templates";
import { dispatchNotification } from "@/domain/notifications/service";

describe("Phase 2 — Multi-Channel Notification Dispatcher", () => {
  describe("HTML Email Template Rendering", () => {
    it("renders booking confirmation email with freight specs and references", () => {
      const html = renderBookingConfirmationEmail({
        bookingRef: "BKG-2026-9901",
        shipperName: "Apex Global Imports",
        originPort: "CNSHA",
        destinationPort: "USLGB",
        carrierName: "Maersk Line",
        vesselOrFlight: "Maersk Mc-Kinney Moller 2608W",
        cargoDescription: "Commercial Solar Power Inverters",
      });

      expect(html).toContain("BKG-2026-9901");
      expect(html).toContain("Apex Global Imports");
      expect(html).toContain("CNSHA");
      expect(html).toContain("Maersk Line");
    });

    it("renders milestone update email with chain of custody details", () => {
      const html = renderMilestoneUpdateEmail({
        trackingNumber: "FWD-89210-US",
        shipperName: "Apex Global",
        milestoneTitle: "Vessel Departed Origin Port",
        status: "DEPARTED_ORIGIN",
        location: "Shanghai Harbor",
        description: "Vessel cleared harbor pilotage.",
        occurredAt: "2026-08-18T09:15:00Z",
      });

      expect(html).toContain("FWD-89210-US");
      expect(html).toContain("Vessel Departed Origin Port");
      expect(html).toContain("Shanghai Harbor");
    });

    it("renders high-contrast urgent customs hold notification", () => {
      const html = renderCustomsHoldNoticeEmail({
        trackingNumber: "FWD-44102-EU",
        shipperName: "Helios Energy",
        authority: "US CBP (Chicago ORD)",
        location: "Chicago O'Hare Terminal",
        holdReason: "INTENSIVE_EXAM",
        actionRequired: "Submit Supplemental Form 7501",
      });

      expect(html).toContain("FWD-44102-EU");
      expect(html).toContain("US CBP (Chicago ORD)");
      expect(html).toContain("Submit Supplemental Form 7501");
      expect(html).toContain("INTENSIVE EXAM");
    });
  });

  describe("Urgent SMS & WhatsApp Alert Formatter", () => {
    it("formats high-urgency customs hold alert within standard SMS lengths", () => {
      const alert = formatUrgentSmsAlert({
        trackingNumber: "FWD-44102-EU",
        alertType: "CUSTOMS_HOLD",
        message: "CBP Intensive Exam hold flagged at Chicago ORD. Action required immediately.",
      });

      expect(alert).toContain("[URGENT CUSTOMS HOLD]");
      expect(alert).toContain("FWD-44102-EU");
      expect(alert).toContain("https://forwardflow.example/track?number=FWD-44102-EU");
    });

    it("formats vessel transit delay alert", () => {
      const alert = formatUrgentSmsAlert({
        trackingNumber: "FWD-89210-US",
        alertType: "VESSEL_DELAY",
        message: "Severe weather in trans-Pacific corridor. ETA updated by +24h.",
      });

      expect(alert).toContain("[FORWARD-FLOW ALERT]");
      expect(alert).toContain("FWD-89210-US");
    });
  });

  describe("Notification Dispatcher Service", () => {
    it("dispatches notification with email and SMS payloads successfully", async () => {
      const result = await dispatchNotification({
        title: "Consignment Clearance Notification",
        message: "Customs clearance completed at destination port.",
        category: "SHIPMENT",
        emailPayload: {
          to: "operations@apexglobal.example",
          subject: "Customs Clearance Complete",
          html: "<p>Clearance Granted</p>",
        },
        smsAlert: "[ALERT] Customs cleared for FWD-89210-US.",
      });

      expect(result.success).toBe(true);
      expect(result.emailSent).toBe(true);
      expect(result.smsFormatted).toBe(true);
    });
  });
});
