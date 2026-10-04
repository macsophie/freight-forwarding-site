"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createServiceRoleClient } from "@/utils/supabase/service-role";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  isStaffRole,
} from "./index";
import { UserRole } from "@/types/database";

export interface AuthActionResult<T = any> {
  success: boolean;
  error?: string;
  data?: T;
  redirectUrl?: string;
}

/**
 * Register a new corporate customer account with automated company onboarding.
 */
export async function signUpCustomerAction(
  rawInput: RegisterInput
): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid registration input",
    };
  }

  const { email, password, firstName, lastName, companyName } = parsed.data;
  const supabase = await createClient();

  // 1. Sign up auth user with metadata
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        company_name: companyName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (authError || !authData.user) {
    return {
      success: false,
      error: authError?.message || "Failed to create account. Please try again.",
    };
  }

  const userId = authData.user.id;

  // 2. Perform fallback onboarding via service role if database trigger didn't run automatically
  try {
    const serviceClient = createServiceRoleClient();
    
    // Check if profile already exists (e.g. from trigger)
    const { data: existingProfile } = await serviceClient
      .from("profiles")
      .select("id, company_id")
      .eq("id", userId)
      .maybeSingle();

    if (!existingProfile || !existingProfile.company_id) {
      // Create Company
      const { data: newCompany, error: compErr } = await serviceClient
        .from("companies")
        .insert({
          name: companyName,
          legal_name: companyName,
          email: email,
          status: "ACTIVE",
        })
        .select("id")
        .single();

      if (!compErr && newCompany) {
        // Upsert Profile
        await serviceClient.from("profiles").upsert({
          id: userId,
          company_id: newCompany.id,
          role: "CUSTOMER_ADMIN",
          first_name: firstName,
          last_name: lastName,
          email: email,
          is_active: true,
        });

        // Insert company_users
        await serviceClient.from("company_users").upsert({
          company_id: newCompany.id,
          user_id: userId,
          role: "CUSTOMER_ADMIN",
          is_primary_contact: true,
        });
      }
    }
  } catch (err) {
    // Non-blocking fallback log
    console.error("Onboarding service role fallback note:", err);
  }

  return {
    success: true,
    redirectUrl: "/portal/dashboard",
  };
}

/**
 * Sign in existing user with role-aware redirection.
 */
export async function signInAction(
  rawInput: LoginInput,
  redirectTo?: string
): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid login credentials",
    };
  }

  const { email, password } = parsed.data;
  const supabase = await createClient();

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError || !authData.user) {
    return {
      success: false,
      error: authError?.message || "Invalid email or password",
    };
  }

  // Lookup profile to check role for redirection
  const { data: profile } = (await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", authData.user.id)
    .single()) as { data: { role: UserRole; is_active: boolean } | null };

  if (profile && !profile.is_active) {
    await supabase.auth.signOut();
    return {
      success: false,
      error: "This account has been deactivated. Please contact support.",
    };
  }

  let destination = redirectTo || "/portal/dashboard";
  if (!redirectTo && profile && isStaffRole(profile.role)) {
    destination = "/admin/dashboard";
  }

  return {
    success: true,
    redirectUrl: destination,
  };
}

/**
 * Sign out current authenticated session.
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

/**
 * Request password recovery email.
 */
export async function requestPasswordResetAction(
  rawInput: ForgotPasswordInput
): Promise<AuthActionResult> {
  const parsed = forgotPasswordSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid email address",
    };
  }

  const { email } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/reset-password`,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
  };
}

/**
 * Update user password after reset token verification.
 */
export async function updatePasswordAction(
  rawInput: ResetPasswordInput
): Promise<AuthActionResult> {
  const parsed = resetPasswordSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid password input",
    };
  }

  const { password } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    redirectUrl: "/portal/dashboard",
  };
}
