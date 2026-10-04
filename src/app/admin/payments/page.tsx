"use client";

import * as React from "react";
import { CreditCard, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable, Column } from "@/components/domain/data-table";
import { PaymentStatusBadge } from "@/components/domain/status-badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { PaymentStatus } from "@/types/database";

interface PaymentRow {
  id: string;
  reference: string;
  customerName: string;
  invoiceNumber: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  processedAt: string;
}

const SAMPLE_PAYMENTS: PaymentRow[] = [
  {
    id: "pay-1",
    reference: "PAY-2026-9018",
    customerName: "Apex Global Imports LLC",
    invoiceNumber: "INV-2026-0844",
    amount: 4890,
    method: "WIRE_TRANSFER",
    status: "SUCCEEDED",
    processedAt: "2026-08-27",
  },
  {
    id: "pay-2",
    reference: "PAY-2026-8812",
    customerName: "Helios Energy Systems",
    invoiceNumber: "INV-2026-0712",
    amount: 1850,
    method: "ACH_DIRECT_DEBIT",
    status: "SUCCEEDED",
    processedAt: "2026-08-10",
  },
];

export default function AdminPaymentsPage() {
  const columns: Column<PaymentRow>[] = [
    {
      header: "Payment Ref",
      accessorKey: "reference",
      cell: (row) => (
        <span className="font-mono text-cyan-400 font-bold text-xs">{row.reference}</span>
      ),
    },
    {
      header: "Customer",
      accessorKey: "customerName",
      cell: (row) => <span className="text-xs text-white font-semibold">{row.customerName}</span>,
    },
    {
      header: "Invoice #",
      accessorKey: "invoiceNumber",
      cell: (row) => <span className="font-mono text-xs text-slate-300">{row.invoiceNumber}</span>,
    },
    {
      header: "Amount Settled",
      accessorKey: "amount",
      cell: (row) => (
        <span className="font-mono text-emerald-400 font-bold text-xs">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      header: "Method",
      accessorKey: "method",
      cell: (row) => (
        <span className="text-xs text-slate-300 font-mono">
          {row.method.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => <PaymentStatusBadge status={row.status} />,
    },
    {
      header: "Processed Date",
      accessorKey: "processedAt",
      cell: (row) => (
        <span className="font-mono text-xs text-slate-400">{formatDate(row.processedAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Payment Transactions & Settlement</h1>
        <p className="text-xs text-slate-400 mt-1">
          B2B wire transfer confirmations, ACH gateway captures, and merchant accounts reconciliation.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Settled Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={SAMPLE_PAYMENTS}
            searchKey="customerName"
            searchPlaceholder="Search customer or payment ref..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
