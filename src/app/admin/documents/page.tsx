"use client";

import * as React from "react";
import { Files, Download, CheckCircle2, ShieldCheck, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/domain/data-table";
import { formatDate } from "@/lib/utils";
import { DocumentType } from "@/types/database";

interface AdminDocRow {
  id: string;
  title: string;
  customerName: string;
  shipmentNumber: string;
  documentType: DocumentType;
  fileName: string;
  isVerified: boolean;
  uploadedAt: string;
}

const SAMPLE_ADMIN_DOCS: AdminDocRow[] = [
  {
    id: "doc-1",
    title: "Master Ocean Bill of Lading",
    customerName: "Apex Global Imports LLC",
    shipmentNumber: "FWD-89210-US",
    documentType: "BILL_OF_LADING",
    fileName: "MSKU982103841_BL.pdf",
    isVerified: true,
    uploadedAt: "2026-08-16",
  },
  {
    id: "doc-2",
    title: "Customs Entry 7501",
    customerName: "Apex Global Imports LLC",
    shipmentNumber: "FWD-44102-EU",
    documentType: "CUSTOMS_DECLARATION",
    fileName: "Entry_7501_CBP.pdf",
    isVerified: false,
    uploadedAt: "2026-08-29",
  },
  {
    id: "doc-3",
    title: "Commercial Invoice",
    customerName: "Helios Energy Systems",
    shipmentNumber: "FWD-77312-AS",
    documentType: "COMMERCIAL_INVOICE",
    fileName: "Helios_INV_9901.pdf",
    isVerified: true,
    uploadedAt: "2026-08-20",
  },
];

export default function AdminDocumentsPage() {
  const columns: Column<AdminDocRow>[] = [
    {
      header: "Document",
      accessorKey: "title",
      cell: (row) => (
        <div>
          <span className="font-bold text-white text-xs block">{row.title}</span>
          <span className="font-mono text-[11px] text-slate-400">{row.fileName}</span>
        </div>
      ),
    },
    {
      header: "Customer",
      accessorKey: "customerName",
      cell: (row) => <span className="text-xs text-slate-200 font-semibold">{row.customerName}</span>,
    },
    {
      header: "Shipment Ref",
      accessorKey: "shipmentNumber",
      cell: (row) => (
        <span className="font-mono text-xs text-cyan-400 font-bold">{row.shipmentNumber}</span>
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
      header: "Status",
      accessorKey: "isVerified",
      cell: (row) =>
        row.isVerified ? (
          <Badge variant="success" className="text-[10px]">Verified</Badge>
        ) : (
          <Badge variant="warning" className="text-[10px]">Pending Verification</Badge>
        ),
    },
    {
      header: "Action",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          {!row.isVerified && (
            <Button variant="glow" size="sm" className="h-7 text-xs px-2">
              Verify
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-7 text-xs px-2 text-slate-300">
            <Download className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Global Document Vault</h1>
        <p className="text-xs text-slate-400 mt-1">
          Customs declarations, verified ocean bills of lading, airway bills, and export certifications.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documents Verification Console</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={SAMPLE_ADMIN_DOCS}
            searchKey="title"
            searchPlaceholder="Search document or customer..."
            statusKey="documentType"
            statusOptions={[
              { value: "BILL_OF_LADING", label: "Bill of Lading" },
              { value: "CUSTOMS_DECLARATION", label: "Customs Declaration" },
              { value: "COMMERCIAL_INVOICE", label: "Commercial Invoice" },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
