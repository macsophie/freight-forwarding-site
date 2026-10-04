"use client";

import * as React from "react";
import { FolderLock, Download, Upload, FileText, CheckCircle2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/domain/data-table";
import { formatDate } from "@/lib/utils";
import { DocumentType } from "@/types/database";

interface DocumentRow {
  id: string;
  title: string;
  fileName: string;
  documentType: DocumentType;
  shipmentNumber: string;
  size: string;
  isVerified: boolean;
  uploadedAt: string;
}

const SAMPLE_DOCS: DocumentRow[] = [
  {
    id: "DOC-101",
    title: "Master Ocean Bill of Lading",
    fileName: "MSKU982103841_BL.pdf",
    documentType: "BILL_OF_LADING",
    shipmentNumber: "FWD-89210-US",
    size: "1.4 MB",
    isVerified: true,
    uploadedAt: "2026-08-16",
  },
  {
    id: "DOC-102",
    title: "Air Waybill (AWB)",
    fileName: "020-94812301_AWB.pdf",
    documentType: "AIR_WAYBILL",
    shipmentNumber: "FWD-44102-EU",
    size: "820 KB",
    isVerified: true,
    uploadedAt: "2026-08-27",
  },
  {
    id: "DOC-103",
    title: "Commercial Invoice",
    fileName: "Apex_Solar_INV_2026.pdf",
    documentType: "COMMERCIAL_INVOICE",
    shipmentNumber: "FWD-89210-US",
    size: "420 KB",
    isVerified: true,
    uploadedAt: "2026-08-14",
  },
  {
    id: "DOC-104",
    title: "Customs Entry Summary (CBP 7501)",
    fileName: "Entry_7501_Release.pdf",
    documentType: "CUSTOMS_DECLARATION",
    shipmentNumber: "FWD-44102-EU",
    size: "890 KB",
    isVerified: true,
    uploadedAt: "2026-08-29",
  },
  {
    id: "DOC-105",
    title: "Certificate of Origin",
    fileName: "CO_Chamber_Of_Commerce.pdf",
    documentType: "CERTIFICATE_OF_ORIGIN",
    shipmentNumber: "FWD-77312-AS",
    size: "610 KB",
    isVerified: true,
    uploadedAt: "2026-08-20",
  },
];

export default function CustomerDocumentsPage() {
  const columns: Column<DocumentRow>[] = [
    {
      header: "Document Title",
      accessorKey: "title",
      cell: (row) => (
        <div>
          <span className="font-semibold text-white block text-xs">{row.title}</span>
          <span className="text-[11px] font-mono text-slate-400">{row.fileName}</span>
        </div>
      ),
    },
    {
      header: "Category",
      accessorKey: "documentType",
      cell: (row) => (
        <span className="text-xs text-slate-300">
          {row.documentType.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      header: "Shipment #",
      accessorKey: "shipmentNumber",
      cell: (row) => (
        <span className="font-mono text-xs text-cyan-400 font-bold">
          {row.shipmentNumber}
        </span>
      ),
    },
    {
      header: "Verification",
      accessorKey: "isVerified",
      cell: (row) =>
        row.isVerified ? (
          <Badge variant="success" className="text-[10px] gap-1">
            <CheckCircle2 className="h-3 w-3" /> Verified
          </Badge>
        ) : (
          <Badge variant="warning" className="text-[10px]">Pending</Badge>
        ),
    },
    {
      header: "Uploaded",
      accessorKey: "uploadedAt",
      cell: (row) => (
        <span className="text-xs font-mono text-slate-400">
          {formatDate(row.uploadedAt)}
        </span>
      ),
    },
    {
      header: "Action",
      cell: (row) => (
        <Button variant="outline" size="sm" className="h-7 text-xs px-2.5 gap-1">
          <Download className="h-3 w-3" />
          <span>Download</span>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Document Vault</h1>
          <p className="text-xs text-slate-400 mt-1">
            Encrypted repository for Bills of Lading, Air Waybills, Customs Declarations, and Packing Lists.
          </p>
        </div>
        <Button variant="glow" size="sm" className="gap-1.5 text-xs">
          <Upload className="h-3.5 w-3.5" />
          <span>Upload Supporting Document</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Document Archive</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={SAMPLE_DOCS}
            searchKey="title"
            searchPlaceholder="Search document name or B/L..."
            statusKey="documentType"
            statusOptions={[
              { value: "BILL_OF_LADING", label: "Bill of Lading" },
              { value: "AIR_WAYBILL", label: "Air Waybill" },
              { value: "COMMERCIAL_INVOICE", label: "Commercial Invoice" },
              { value: "CUSTOMS_DECLARATION", label: "Customs Declaration" },
              { value: "CERTIFICATE_OF_ORIGIN", label: "Certificate of Origin" },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
