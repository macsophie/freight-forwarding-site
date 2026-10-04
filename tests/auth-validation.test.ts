import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  isStaffRole,
  isCustomerAdmin,
  canManageShipments,
  canManageBilling,
} from '@/domain/auth';

describe('Auth Schemas & Input Validation', () => {
  describe('loginSchema', () => {
    it('accepts valid corporate credentials', () => {
      const result = loginSchema.safeParse({
        email: 'ops@forwardflow.com',
        password: 'SecurePassword2026!',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email formats', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email-string',
        password: 'SecurePassword2026!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/valid email/i);
      }
    });

    it('rejects short passwords (< 8 chars)', () => {
      const result = loginSchema.safeParse({
        email: 'ops@forwardflow.com',
        password: 'short',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/at least 8 characters/i);
      }
    });
  });

  describe('registerSchema', () => {
    it('accepts valid company registration input', () => {
      const result = registerSchema.safeParse({
        firstName: 'Sarah',
        lastName: 'Connor',
        companyName: 'Cyberdyne Logistics Corp',
        email: 'sarah@cyberdyne.com',
        password: 'StrongSecret2026!',
        confirmPassword: 'StrongSecret2026!',
      });
      expect(result.success).toBe(true);
    });

    it('rejects registration when passwords mismatch', () => {
      const result = registerSchema.safeParse({
        firstName: 'Sarah',
        lastName: 'Connor',
        companyName: 'Cyberdyne Logistics Corp',
        email: 'sarah@cyberdyne.com',
        password: 'StrongSecret2026!',
        confirmPassword: 'DifferentSecret2026!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('confirmPassword');
      }
    });

    it('rejects registration with missing company name', () => {
      const result = registerSchema.safeParse({
        firstName: 'Sarah',
        lastName: 'Connor',
        companyName: '',
        email: 'sarah@cyberdyne.com',
        password: 'StrongSecret2026!',
        confirmPassword: 'StrongSecret2026!',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('forgotPasswordSchema & resetPasswordSchema', () => {
    it('validates recovery email', () => {
      expect(forgotPasswordSchema.safeParse({ email: 'user@shipper.com' }).success).toBe(true);
      expect(forgotPasswordSchema.safeParse({ email: 'not-an-email' }).success).toBe(false);
    });

    it('validates password reset with confirmation', () => {
      const valid = resetPasswordSchema.safeParse({
        password: 'BrandNewPassword123!',
        confirmPassword: 'BrandNewPassword123!',
      });
      expect(valid.success).toBe(true);

      const invalid = resetPasswordSchema.safeParse({
        password: 'BrandNewPassword123!',
        confirmPassword: 'MismatchedPassword123!',
      });
      expect(invalid.success).toBe(false);
    });
  });
});
