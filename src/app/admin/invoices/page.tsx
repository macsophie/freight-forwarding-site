"use client";

import * as React from "react";
import { DollarSign, Receipt, Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable, Column } from "@/components/domain/data-table";
import { InvoiceStatusBadge } from "@/components/domain/status-badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { InvoiceStatus } from "@/types/database";

interface AdminInvoiceRow {
  id: string;
  invoiceNumber: string;
  customerName: string;
  shipmentNumber: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: InvoiceStatus;
  dueDate: string;
}

const SAMPLE_ADMIN_INVOICES: AdminInvoiceRow[] = [
  {
    id: "inv-1",
    invoiceNumber: "INV-2026-0901",
    customerName: "Apex Global Imports LLC",
    shipmentNumber: "FWD-89210-US",
    totalAmount: 3450,
    paidAmount: 0,
    balanceDue: 3450,
    status: "ISSUED",
    dueDate: "2026-09-19",
  },
  {
    id: "inv-2",
    invoiceNumber: "INV-2026-0844",
    customerName: "Apex Global Imports LLC",
    shipmentNumber: "FWD-44102-EU",
    totalAmount: 4890,
    paidAmount: 4890,
    balanceDue: 0,
    status: "PAID",
    dueDate: "2026-09-26",
  },
  {
    id: "inv-3",
    invoiceNumber: "INV-2026-0712",
    customerName: "Helios Energy Systems",
    shipmentNumber: "FWD-77312-AS",
    totalAmount: 1850,
    paidAmount: 1850,
    balanceDue: 0,
    status: "PAID",
    dueDate: "2026-09-09",
  },
];

export default function AdminInvoicesPage() {
  const columns: Column<AdminInvoiceRow>[] = [
    {
      header: "Invoice #",
      accessorKey: "invoiceNumber",
      cell: (row) => (
        <span className="font-mono text-cyan-400 font-bold text-xs">{row.invoiceNumber}</span>
      ),
    },
    {
      header: "Customer",
      accessorKey: "customerName",
      cell: (row) => <span className="text-xs font-semibold text-white">{row.customerName}</span>,
    },
    {
      header: "Shipment Ref",
      accessorKey: "shipmentNumber",
      cell: (row) => <span className="font-mono text-xs text-slate-300">{row.shipmentNumber}</span>,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => <InvoiceStatusBadge status={row.status} />,
    },
    {
      header: "Total Amount",
      accessorKey: "totalAmount",
      cell: (row) => (
        <span className="font-mono text-xs text-white font-semibold">
          {formatCurrency(row.totalAmount)}
        </span>
      ),
    },
    {
      header: "Balance Due",
      accessorKey: "balanceDue",
      cell: (row) => (
        <span
          className={`font-mono text-xs font-bold ${
            row.balanceDue > 0 ? "text-amber-300" : "text-emerald-400"
          }`}
        >
          {formatCurrency(row.balanceDue)}
        </span>
      ),
    },
    {
      header: "Due Date",
      accessorKey: "dueDate",
      cell: (row) => (
        <span className="font-mono text-xs text-slate-400">{formatDate(row.dueDate)}</span>
      ),
    },
    {
      header: "Action",
      cell: (row) => (
        <Button variant="outline" size="sm" className="h-7 text-xs px-2.5 text-slate-300 gap-1">
          <Download className="h-3 w-3" />
          <span>Statement</span>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Commercial Invoicing & AR</h1>
          <p className="text-xs text-slate-400 mt-1">
            Accounts receivable ledger, credit term tracking, and tax invoice generation.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accounts Receivable Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={SAMPLE_ADMIN_INVOICES}
            searchKey="customerName"
            searchPlaceholder="Search customer or invoice #..."
            statusKey="status"
            statusOptions={[
              { value: "ISSUED", label: "Issued" },
              { value: "PAID", label: "Paid" },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
