import { z } from 'zod';
import { UserRole } from '@/types/database';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  companyName: z.string().min(2, 'Company name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export function isStaffRole(role: UserRole | null | undefined): boolean {
  if (!role) return false;
  return ['SUPER_ADMIN', 'OPERATIONS_MANAGER', 'OPERATIONS_AGENT', 'FINANCE', 'SUPPORT'].includes(role);
}

export function isCustomerAdmin(role: UserRole | null | undefined): boolean {
  return role === 'CUSTOMER_ADMIN';
}

export function canManageShipments(role: UserRole | null | undefined): boolean {
  if (!role) return false;
  return ['SUPER_ADMIN', 'OPERATIONS_MANAGER', 'OPERATIONS_AGENT'].includes(role);
}

export function canManageBilling(role: UserRole | null | undefined): boolean {
  if (!role) return false;
  return ['SUPER_ADMIN', 'FINANCE', 'CUSTOMER_ADMIN'].includes(role);
}
