import { describe, it, expect } from "vitest";
import {
  calculateDepositSchedule,
  validateEscrowTransition,
  escrowScheduleSchema,
  EscrowStatus,
} from "@/domain/payments/escrow";

describe("Phase 2 — Container Escrow & Deposit Scheduling", () => {
  describe("Deposit Schedule Calculator", () => {
    it("calculates standard 30% deposit and 70% balance", () => {
      const schedule = calculateDepositSchedule({
        totalAmount: 10000,
        tier: "STANDARD_30_70",
      });

      expect(schedule.depositPercentage).toBe(30);
      expect(schedule.depositAmount).toBe(3000);
      expect(schedule.balancePercentage).toBe(70);
      expect(schedule.balanceAmount).toBe(7000);
      expect(schedule.totalAmount).toBe(10000);
    });

    it("calculates high-value 40% deposit and 60% balance", () => {
      const schedule = calculateDepositSchedule({
        totalAmount: 25000,
        tier: "HIGH_VALUE_40_60",
      });

      expect(schedule.depositPercentage).toBe(40);
      expect(schedule.depositAmount).toBe(10000);
      expect(schedule.balanceAmount).toBe(15000);
    });

    it("calculates hazardous cargo 50% deposit and 50% balance", () => {
      const schedule = calculateDepositSchedule({
        totalAmount: 12500,
        tier: "HAZARDOUS_50_50",
      });

      expect(schedule.depositPercentage).toBe(50);
      expect(schedule.depositAmount).toBe(6250);
      expect(schedule.balanceAmount).toBe(6250);
    });

    it("handles full 100% prepayment schedule", () => {
      const schedule = calculateDepositSchedule({
        totalAmount: 8400,
        tier: "FULL_PREPAYMENT",
      });

      expect(schedule.depositPercentage).toBe(100);
      expect(schedule.depositAmount).toBe(8400);
      expect(schedule.balanceAmount).toBe(0);
    });
  });

  describe("Escrow State Machine Transitions", () => {
    it("permits legitimate lifecycle progression", () => {
      expect(validateEscrowTransition("PENDING_DEPOSIT", "DEPOSIT_HELD")).toBe(true);
      expect(validateEscrowTransition("DEPOSIT_HELD", "RELEASE_AUTHORIZED")).toBe(true);
      expect(validateEscrowTransition("RELEASE_AUTHORIZED", "SETTLED")).toBe(true);
    });

    it("permits refund transitions from any active state", () => {
      expect(validateEscrowTransition("PENDING_DEPOSIT", "REFUNDED")).toBe(true);
      expect(validateEscrowTransition("DEPOSIT_HELD", "REFUNDED")).toBe(true);
      expect(validateEscrowTransition("RELEASE_AUTHORIZED", "REFUNDED")).toBe(true);
    });

    it("blocks illegal state skips and backward transitions", () => {
      expect(validateEscrowTransition("PENDING_DEPOSIT", "SETTLED")).toBe(false);
      expect(validateEscrowTransition("SETTLED", "PENDING_DEPOSIT")).toBe(false);
      expect(validateEscrowTransition("DEPOSIT_HELD", "PENDING_DEPOSIT")).toBe(false);
    });
  });

  describe("Escrow Zod Schema Validation", () => {
    it("validates compliant escrow agreement parameters", () => {
      const payload = {
        booking_id: "123e4567-e89b-12d3-a456-426614174000",
        company_id: "123e4567-e89b-12d3-a456-426614174001",
        total_freight_amount: 4500,
        currency: "USD",
        deposit_tier: "STANDARD_30_70" as const,
      };

      const result = escrowScheduleSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("rejects amounts below minimum freight threshold", () => {
      const payload = {
        booking_id: "123e4567-e89b-12d3-a456-426614174000",
        company_id: "123e4567-e89b-12d3-a456-426614174001",
        total_freight_amount: 50, // Minimum is 100
        currency: "USD",
        deposit_tier: "STANDARD_30_70" as const,
      };

      const result = escrowScheduleSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });
});
