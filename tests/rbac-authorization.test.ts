import { describe, it, expect } from 'vitest';
import {
  isStaffRole,
  isCustomerAdmin,
  canManageShipments,
  canManageBilling,
} from '@/domain/auth';
import { UserRole } from '@/types/database';

describe('Role-Based Access Control (RBAC) & Hierarchy', () => {
  const staffRoles: UserRole[] = [
    'SUPER_ADMIN',
    'OPERATIONS_MANAGER',
    'OPERATIONS_AGENT',
    'FINANCE',
    'SUPPORT',
  ];

  const customerRoles: UserRole[] = ['CUSTOMER_ADMIN', 'CUSTOMER_USER'];

  describe('isStaffRole', () => {
    it('correctly identifies all staff roles', () => {
      staffRoles.forEach((role) => {
        expect(isStaffRole(role)).toBe(true);
      });
    });

    it('rejects customer roles as staff', () => {
      customerRoles.forEach((role) => {
        expect(isStaffRole(role)).toBe(false);
      });
    });

    it('handles null and undefined safely', () => {
      expect(isStaffRole(null)).toBe(false);
      expect(isStaffRole(undefined)).toBe(false);
    });
  });

  describe('isCustomerAdmin', () => {
    it('returns true only for CUSTOMER_ADMIN', () => {
      expect(isCustomerAdmin('CUSTOMER_ADMIN')).toBe(true);
      expect(isCustomerAdmin('CUSTOMER_USER')).toBe(false);
      expect(isCustomerAdmin('SUPER_ADMIN')).toBe(false);
    });
  });

  describe('Operational Shipment Dispatch Permissions', () => {
    it('allows SUPER_ADMIN, OPERATIONS_MANAGER, and OPERATIONS_AGENT to manage shipments', () => {
      expect(canManageShipments('SUPER_ADMIN')).toBe(true);
      expect(canManageShipments('OPERATIONS_MANAGER')).toBe(true);
      expect(canManageShipments('OPERATIONS_AGENT')).toBe(true);
    });

    it('denies shipment management to FINANCE, SUPPORT, and CUSTOMER roles', () => {
      expect(canManageShipments('FINANCE')).toBe(false);
      expect(canManageShipments('SUPPORT')).toBe(false);
      expect(canManageShipments('CUSTOMER_ADMIN')).toBe(false);
      expect(canManageShipments('CUSTOMER_USER')).toBe(false);
    });
  });

  describe('Billing & Invoicing Authority', () => {
    it('allows SUPER_ADMIN, FINANCE, and CUSTOMER_ADMIN to manage billing', () => {
      expect(canManageBilling('SUPER_ADMIN')).toBe(true);
      expect(canManageBilling('FINANCE')).toBe(true);
      expect(canManageBilling('CUSTOMER_ADMIN')).toBe(true);
    });

    it('denies billing management to operational agents and customer users', () => {
      expect(canManageBilling('OPERATIONS_AGENT')).toBe(false);
      expect(canManageBilling('CUSTOMER_USER')).toBe(false);
      expect(canManageBilling('SUPPORT')).toBe(false);
    });
  });
});
