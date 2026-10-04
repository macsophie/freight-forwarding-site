"use client";

import * as React from "react";
import { Receipt, DollarSign, Download, CreditCard, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable, Column } from "@/components/domain/data-table";
import { InvoiceStatusBadge } from "@/components/domain/status-badge";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { formatDate, formatCurrency } from "@/lib/utils";
import { InvoiceStatus } from "@/types/database";

interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  shipmentNumber: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  currency: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
}

const SAMPLE_INVOICES: InvoiceRow[] = [
  {
    id: "INV-2026-901",
    invoiceNumber: "INV-2026-0901",
    shipmentNumber: "FWD-89210-US",
    totalAmount: 3450,
    paidAmount: 0,
    balanceDue: 3450,
    currency: "USD",
    status: "ISSUED",
    issueDate: "2026-08-20",
    dueDate: "2026-09-19",
  },
  {
    id: "INV-2026-844",
    invoiceNumber: "INV-2026-0844",
    shipmentNumber: "FWD-44102-EU",
    totalAmount: 4890,
    paidAmount: 4890,
    balanceDue: 0,
    currency: "USD",
    status: "PAID",
    issueDate: "2026-08-27",
    dueDate: "2026-09-26",
  },
  {
    id: "INV-2026-712",
    invoiceNumber: "INV-2026-0712",
    shipmentNumber: "FWD-77312-AS",
    totalAmount: 1850,
    paidAmount: 1850,
    balanceDue: 0,
    currency: "USD",
    status: "PAID",
    issueDate: "2026-08-10",
    dueDate: "2026-09-09",
  },
];

export default function CustomerInvoicesPage() {
  const [selectedInvoice, setSelectedInvoice] = React.useState<InvoiceRow | null>(null);
  const [showPayModal, setShowPayModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowPayModal(false);
    }, 500);
  };

  const columns: Column<InvoiceRow>[] = [
    {
      header: "Invoice #",
      accessorKey: "invoiceNumber",
      cell: (row) => (
        <span className="font-mono text-cyan-400 font-bold text-xs">
          {row.invoiceNumber}
        </span>
      ),
    },
    {
      header: "Shipment #",
      accessorKey: "shipmentNumber",
      cell: (row) => (
        <span className="font-mono text-slate-300 text-xs">
          {row.shipmentNumber}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => <InvoiceStatusBadge status={row.status} />,
    },
    {
      header: "Invoice Amount",
      accessorKey: "totalAmount",
      cell: (row) => (
        <span className="font-mono text-white text-xs font-semibold">
          {formatCurrency(row.totalAmount, row.currency)}
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
          {formatCurrency(row.balanceDue, row.currency)}
        </span>
      ),
    },
    {
      header: "Due Date",
      accessorKey: "dueDate",
      cell: (row) => (
        <span className="font-mono text-slate-400 text-xs">
          {formatDate(row.dueDate)}
        </span>
      ),
    },
    {
      header: "Action",
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.balanceDue > 0 ? (
            <Button
              variant="glow"
              size="sm"
              className="h-7 text-xs px-2.5 gap-1"
              onClick={() => {
                setSelectedInvoice(row);
                setShowPayModal(true);
              }}
            >
              <CreditCard className="h-3 w-3" />
              <span>Pay Now</span>
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="h-7 text-xs px-2.5 gap-1 text-slate-300">
              <Download className="h-3 w-3" />
              <span>PDF</span>
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Commercial Invoices & Billing</h1>
        <p className="text-xs text-slate-400 mt-1">
          Settlement statements, line item freight charges, VAT/tax breakdowns, and electronic payment records.
        </p>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-900/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Outstanding Balance
          </span>
          <div className="text-2xl font-black text-amber-400 font-mono mt-2">
            {formatCurrency(3450)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">1 Invoice Due in 18 Days</p>
        </Card>

        <Card className="p-4 bg-slate-900/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Settled YTD (2026)
          </span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-2">
            {formatCurrency(6740)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">2 Completed Payments</p>
        </Card>

        <Card className="p-4 bg-slate-900/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Approved Credit Line
          </span>
          <div className="text-2xl font-black text-cyan-300 font-mono mt-2">
            {formatCurrency(50000)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Net 30 Payment Terms</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoices Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={SAMPLE_INVOICES}
            searchKey="invoiceNumber"
            searchPlaceholder="Search invoice number..."
            statusKey="status"
            statusOptions={[
              { value: "ISSUED", label: "Issued / Due" },
              { value: "PAID", label: "Paid" },
              { value: "OVERDUE", label: "Overdue" },
            ]}
          />
        </CardContent>
      </Card>

      {/* Pay Confirmation Modal */}
      {selectedInvoice && (
        <ConfirmDialog
          open={showPayModal}
          onOpenChange={setShowPayModal}
          title={`Initiate B2B Payment — ${selectedInvoice.invoiceNumber}`}
          description={`Authorize wire transfer / direct debit settlement of ${formatCurrency(
            selectedInvoice.balanceDue,
            selectedInvoice.currency
          )} to ForwardFlow Logistics escrow.`}
          confirmLabel="Authorize Payment Settlement"
          variant="default"
          loading={loading}
          onConfirm={handlePay}
        />
      )}
    </div>
  );
}
