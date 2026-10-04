import { z } from 'zod';
import { DocumentType } from '@/types/database';

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const ALLOWED_DOCUMENT_MIME_TYPES = ALLOWED_MIME_TYPES;

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
export const MAX_DOCUMENT_FILE_SIZE = MAX_FILE_SIZE_BYTES;

export const documentUploadSchema = z.object({
  company_id: z.string().uuid(),
  shipment_id: z.string().uuid().optional().nullable(),
  quote_id: z.string().uuid().optional().nullable(),
  document_type: z.enum([
    'BILL_OF_LADING',
    'AIR_WAYBILL',
    'COMMERCIAL_INVOICE',
    'PACKING_LIST',
    'CERTIFICATE_OF_ORIGIN',
    'CUSTOMS_DECLARATION',
    'INSURANCE_CERTIFICATE',
    'DELIVERY_ORDER',
    'OTHER',
  ] as const),
  title: z.string().min(2, 'Document title is required'),
  file_name: z.string().min(1, 'File name is required'),
  file_size_bytes: z.number().max(MAX_FILE_SIZE_BYTES, 'File size cannot exceed 50MB'),
  mime_type: z.string().refine((val) => ALLOWED_MIME_TYPES.includes(val), {
    message: 'Unsupported document format. Allowed: PDF, JPG, PNG, DOCX, XLSX',
  }),
});

export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;

/**
 * Builds secure company-isolated file path for Supabase Storage
 */
export function buildDocumentStoragePath(
  companyId: string,
  shipmentId: string | null | undefined,
  fileName: string
): string {
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const folder = shipmentId || 'general';
  return `${companyId}/${folder}/${timestamp}-${sanitizedName}`;
}

export function getDocumentTypeLabel(type: DocumentType): string {
  const labels: Record<DocumentType, string> = {
    BILL_OF_LADING: 'Ocean Bill of Lading (B/L)',
    AIR_WAYBILL: 'Air Waybill (AWB)',
    COMMERCIAL_INVOICE: 'Commercial Invoice',
    PACKING_LIST: 'Packing List',
    CERTIFICATE_OF_ORIGIN: 'Certificate of Origin',
    CUSTOMS_DECLARATION: 'Customs Declaration / C88',
    INSURANCE_CERTIFICATE: 'Marine / Cargo Insurance Certificate',
    DELIVERY_ORDER: 'Delivery Order (D/O)',
    OTHER: 'Supporting Document',
  };
  return labels[type] || type;
}
