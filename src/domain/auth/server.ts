import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Database, UserRole } from '@/types/database';
import { isStaffRole } from './index';

export type AuthProfile = Database['public']['Tables']['profiles']['Row'] & {
  company?: Database['public']['Tables']['companies']['Row'] | null;
};

/**
 * Get current authenticated Supabase user (or null)
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Get current authenticated user's profile and company details
 */
export async function getCurrentProfile(): Promise<AuthProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      *,
      company:companies(*)
    `)
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    return null;
  }

  return profile as AuthProfile;
}

/**
 * Enforce authentication on a Server Component or Server Action.
 * Redirects unauthenticated requests to login page.
 */
export async function requireAuth(redirectTo?: string) {
  const user = await getCurrentUser();
  if (!user) {
    const loginUrl = redirectTo
      ? `/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`
      : '/auth/login';
    redirect(loginUrl);
  }
  return user;
}

/**
 * Enforce staff authorization (`SUPER_ADMIN`, `OPERATIONS_MANAGER`, `OPERATIONS_AGENT`, `FINANCE`, `SUPPORT`).
 * Throws or redirects if user is not authorized staff.
 */
export async function requireStaff() {
  await requireAuth();
  const profile = await getCurrentProfile();

  if (!profile || !isStaffRole(profile.role)) {
    redirect('/portal/dashboard');
  }

  return profile;
}

/**
 * Enforce specific role requirement.
 */
export async function requireRole(allowedRoles: UserRole[]) {
  await requireAuth();
  const profile = await getCurrentProfile();

  if (!profile || !allowedRoles.includes(profile.role)) {
    redirect(isStaffRole(profile?.role) ? '/admin/dashboard' : '/portal/dashboard');
  }

  return profile;
}

/**
 * Enforce valid corporate tenant association for customer shippers.
 */
export async function requireCompany() {
  await requireAuth();
  const profile = await getCurrentProfile();

  if (!profile?.company_id) {
    redirect('/portal/settings');
  }

  return {
    profile,
    companyId: profile.company_id,
  };
}
