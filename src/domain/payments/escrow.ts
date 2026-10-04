"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/utils/supabase/service-role";
import { getCurrentProfile } from "@/domain/auth/server";

export type EscrowStatus =
  | "PENDING_DEPOSIT"
  | "DEPOSIT_HELD"
  | "RELEASE_AUTHORIZED"
  | "SETTLED"
  | "REFUNDED";

export type DepositTier =
  | "STANDARD_30_70"
  | "HIGH_VALUE_40_60"
  | "HAZARDOUS_50_50"
  | "FULL_PREPAYMENT";

export const escrowScheduleSchema = z.object({
  booking_id: z.string().min(1, "Booking ID is required"),
  company_id: z.string().min(1, "Company ID is required"),
  total_freight_amount: z.number().min(100, "Minimum freight value for escrow is $100"),
  currency: z.string().length(3).default("USD"),
  deposit_tier: z
    .enum(["STANDARD_30_70", "HIGH_VALUE_40_60", "HAZARDOUS_50_50", "FULL_PREPAYMENT"] as const)
    .default("STANDARD_30_70"),
  carrier_booking_ref: z.string().optional(),
});

export type EscrowScheduleInput = z.infer<typeof escrowScheduleSchema>;

/**
 * Calculates itemized deposit vs final balance according to commercial risk tier.
 */
export function calculateDepositSchedule({
  totalAmount,
  tier = "STANDARD_30_70",
  currency = "USD",
}: {
  totalAmount: number;
  tier?: DepositTier;
  currency?: string;
}): {
  depositPercentage: number;
  depositAmount: number;
  balancePercentage: number;
  balanceAmount: number;
  totalAmount: number;
  currency: string;
} {
  let depositPercentage = 30;

  switch (tier) {
    case "HIGH_VALUE_40_60":
      depositPercentage = 40;
      break;
    case "HAZARDOUS_50_50":
      depositPercentage = 50;
      break;
    case "FULL_PREPAYMENT":
      depositPercentage = 100;
      break;
    case "STANDARD_30_70":
    default:
      depositPercentage = 30;
      break;
  }

  const depositAmount = Math.round((totalAmount * (depositPercentage / 100)) * 100) / 100;
  const balancePercentage = 100 - depositPercentage;
  const balanceAmount = Math.round((totalAmount - depositAmount) * 100) / 100;

  return {
    depositPercentage,
    depositAmount,
    balancePercentage,
    balanceAmount,
    totalAmount,
    currency,
  };
}

/**
 * Validates allowable state machine transitions for freight escrow.
 */
export function validateEscrowTransition(
  current: EscrowStatus,
  target: EscrowStatus
): boolean {
  if (target === "REFUNDED") return true;

  const validTransitions: Record<EscrowStatus, EscrowStatus[]> = {
    PENDING_DEPOSIT: ["DEPOSIT_HELD", "REFUNDED"],
    DEPOSIT_HELD: ["RELEASE_AUTHORIZED", "SETTLED", "REFUNDED"],
    RELEASE_AUTHORIZED: ["SETTLED", "REFUNDED"],
    SETTLED: [],
    REFUNDED: [],
  };

  return validTransitions[current]?.includes(target) ?? false;
}

/**
 * Registers an escrow deposit agreement for high-value container bookings.
 */
export async function createEscrowScheduleAction(
  rawInput: EscrowScheduleInput
): Promise<{
  success: boolean;
  error?: string;
  data?: {
    escrowId: string;
    depositAmount: number;
    balanceAmount: number;
    depositPercentage: number;
  };
}> {
  const profile = await getCurrentProfile();
  if (!profile) return { success: false, error: "Unauthorized." };

  const parsed = escrowScheduleSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid escrow schedule input",
    };
  }

  const data = parsed.data;
  const schedule = calculateDepositSchedule({
    totalAmount: data.total_freight_amount,
    tier: data.deposit_tier,
    currency: data.currency,
  });

  const serviceClient = createServiceRoleClient();
  const escrowId = `ESC-${Date.now().toString().slice(-8)}`;

  try {
    // 1. Audit log the escrow creation
    await serviceClient.from("audit_logs").insert({
      actor_id: profile.id,
      actor_email: profile.email,
      actor_role: profile.role,
      company_id: data.company_id,
      action: "ESCROW_SCHEDULE_CREATED",
      entity_type: "bookings",
      entity_id: data.booking_id,
      changes: {
        escrow_id: escrowId,
        deposit_tier: data.deposit_tier,
        deposit_amount: schedule.depositAmount,
        balance_amount: schedule.balanceAmount,
        total_amount: data.total_freight_amount,
        currency: data.currency,
      },
    });

    revalidatePath(`/admin/bookings`);
    revalidatePath(`/portal/bookings/${data.booking_id}`);

    return {
      success: true,
      data: {
        escrowId,
        depositAmount: schedule.depositAmount,
        balanceAmount: schedule.balanceAmount,
        depositPercentage: schedule.depositPercentage,
      },
    };
  } catch (err: any) {
    console.error("Create escrow schedule error:", err);
    return {
      success: false,
      error: err.message || "Failed to create escrow schedule",
    };
  }
}

/**
 * Authorizes container equipment release once the escrow deposit is secured.
 */
export async function authorizeContainerReleaseAction({
  bookingId,
  companyId,
  escrowId,
}: {
  bookingId: string;
  companyId: string;
  escrowId: string;
}): Promise<{ success: boolean; error?: string }> {
  const profile = await getCurrentProfile();
  if (!profile) return { success: false, error: "Unauthorized." };

  const serviceClient = createServiceRoleClient();

  try {
    await serviceClient.from("audit_logs").insert({
      actor_id: profile.id,
      actor_email: profile.email,
      actor_role: profile.role,
      company_id: companyId,
      action: "CONTAINER_RELEASE_AUTHORIZED",
      entity_type: "bookings",
      entity_id: bookingId,
      changes: {
        escrow_id: escrowId,
        authorization_timestamp: new Date().toISOString(),
      },
    });

    revalidatePath(`/admin/bookings`);
    revalidatePath(`/portal/bookings/${bookingId}`);

    return { success: true };
  } catch (err: any) {
    console.error("Authorize container release error:", err);
    return { success: false, error: err.message || "Failed to authorize release" };
  }
}
