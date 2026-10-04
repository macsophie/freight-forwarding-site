import { describe, it, expect } from 'vitest';
import {
  buildDocumentStoragePath,
  ALLOWED_DOCUMENT_MIME_TYPES,
  MAX_DOCUMENT_FILE_SIZE,
} from '@/domain/documents';
import { isStaffRole } from '@/domain/auth';

describe('Multi-Tenant Data Isolation & Security Boundaries', () => {
  const companyAId = 'a0000000-0000-0000-0000-000000000001';
  const companyBId = 'b0000000-0000-0000-0000-000000000002';
  const shipmentId = 's0000000-0000-0000-0000-000000000001';
  const fileName = 'Bill_of_Lading_2608.pdf';

  describe('Storage Bucket Path Isolation', () => {
    it('enforces tenant company ID as the root storage folder prefix', () => {
      const storagePathA = buildDocumentStoragePath(companyAId, shipmentId, fileName);
      const storagePathB = buildDocumentStoragePath(companyBId, shipmentId, fileName);

      expect(storagePathA).toMatch(new RegExp(`^${companyAId}/`));
      expect(storagePathB).toMatch(new RegExp(`^${companyBId}/`));
      expect(storagePathA).not.toEqual(storagePathB);
    });

    it('creates consistent 3-tier isolated hierarchy: {company_id}/{shipment_id}/{timestamp}-{file_name}', () => {
      const storagePath = buildDocumentStoragePath(companyAId, shipmentId, fileName);
      const segments = storagePath.split('/');

      expect(segments).toHaveLength(3);
      expect(segments[0]).toBe(companyAId);
      expect(segments[1]).toBe(shipmentId);
      expect(segments[2]).toMatch(new RegExp(`\\d+-${fileName}`));
    });

    it('falls back cleanly to generic folder when shipmentId is omitted', () => {
      const storagePath = buildDocumentStoragePath(companyAId, undefined, fileName);
      const segments = storagePath.split('/');

      expect(segments[0]).toBe(companyAId);
      expect(segments[1]).toBe('general');
      expect(segments[2]).toMatch(new RegExp(`\\d+-${fileName}`));
    });
  });

  describe('Storage File Constraints & Security', () => {
    it('restricts document MIME types to safe compliance formats', () => {
      expect(ALLOWED_DOCUMENT_MIME_TYPES).toContain('application/pdf');
      expect(ALLOWED_DOCUMENT_MIME_TYPES).toContain('image/jpeg');
      expect(ALLOWED_DOCUMENT_MIME_TYPES).toContain('image/png');
      expect(ALLOWED_DOCUMENT_MIME_TYPES).not.toContain('application/x-executable');
      expect(ALLOWED_DOCUMENT_MIME_TYPES).not.toContain('text/javascript');
    });

    it('enforces safe file size limit (50MB)', () => {
      expect(MAX_DOCUMENT_FILE_SIZE).toBe(50 * 1024 * 1024);
    });
  });

  describe('Row-Level Tenant Isolation Logic', () => {
    interface MockTenantRecord {
      id: string;
      company_id: string;
      title: string;
    }

    const databaseRecords: MockTenantRecord[] = [
      { id: 'rec-1', company_id: companyAId, title: 'Company A Ocean Shipment' },
      { id: 'rec-2', company_id: companyAId, title: 'Company A Invoice' },
      { id: 'rec-3', company_id: companyBId, title: 'Company B Air Consignment' },
    ];

    function evaluateRlsSelect(
      userCompanyId: string | null,
      userRole: string,
      record: MockTenantRecord
    ): boolean {
      // 1. Staff have global view access
      if (isStaffRole(userRole as any)) {
        return true;
      }
      // 2. Customers can ONLY read records matching their auth company_id
      return record.company_id === userCompanyId;
    }

    it('allows Company A user to view Company A records only', () => {
      const visibleRecords = databaseRecords.filter((rec) =>
        evaluateRlsSelect(companyAId, 'CUSTOMER_USER', rec)
      );

      expect(visibleRecords).toHaveLength(2);
      expect(visibleRecords.map((r) => r.id)).toEqual(['rec-1', 'rec-2']);
      expect(visibleRecords.some((r) => r.company_id === companyBId)).toBe(false);
    });

    it('strictly forbids Company A user from reading Company B records', () => {
      const canReadB = evaluateRlsSelect(companyAId, 'CUSTOMER_USER', databaseRecords[2]);
      expect(canReadB).toBe(false);
    });

    it('allows staff operations managers to view all cross-company records', () => {
      const visibleRecords = databaseRecords.filter((rec) =>
        evaluateRlsSelect(null, 'OPERATIONS_MANAGER', rec)
      );

      expect(visibleRecords).toHaveLength(3);
    });
  });
});
