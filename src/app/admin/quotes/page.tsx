"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, Eye, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable, Column } from "@/components/domain/data-table";
import { QuoteStatusBadge } from "@/components/domain/status-badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { QuoteStatus, ShipmentMode, Incoterm } from "@/types/database";

interface AdminQuoteRow {
  id: string;
  quoteNumber: string;
  companyName: string;
  mode: ShipmentMode;
  incoterm: Incoterm;
  origin: string;
  destination: string;
  totalAmount: number;
  status: QuoteStatus;
  createdAt: string;
}

const SAMPLE_ADMIN_QUOTES: AdminQuoteRow[] = [
  {
    id: "QUO-2026-9104",
    quoteNumber: "QUO-2026-9104",
    companyName: "Apex Global Imports LLC",
    mode: "OCEAN_FCL",
    incoterm: "FOB",
    origin: "Shanghai (CNSHA)",
    destination: "Long Beach (USLGB)",
    totalAmount: 3450,
    status: "ISSUED",
    createdAt: "2026-08-24",
  },
  {
    id: "QUO-2026-8841",
    quoteNumber: "QUO-2026-8841",
    companyName: "Apex Global Imports LLC",
    mode: "AIR",
    incoterm: "CIF",
    origin: "Frankfurt (FRA)",
    destination: "Chicago (ORD)",
    totalAmount: 4890,
    status: "ACCEPTED",
    createdAt: "2026-08-22",
  },
  {
    id: "QUO-2026-7712",
    quoteNumber: "QUO-2026-7712",
    companyName: "Helios Energy Systems",
    mode: "OCEAN_LCL",
    incoterm: "EXW",
    origin: "Shenzhen (CNSZX)",
    destination: "Rotterdam (NLRTM)",
    totalAmount: 1850,
    status: "REVIEWING",
    createdAt: "2026-08-29",
  },
];

export default function AdminQuotesPage() {
  const columns: Column<AdminQuoteRow>[] = [
    {
      header: "Quote #",
      accessorKey: "quoteNumber",
      cell: (row) => (
        <Link
          href={`/admin/quotes/${row.quoteNumber}`}
          className="font-mono text-cyan-400 font-bold hover:underline"
        >
          {row.quoteNumber}
        </Link>
      ),
    },
    {
      header: "Customer",
      accessorKey: "companyName",
      cell: (row) => <span className="font-semibold text-white text-xs">{row.companyName}</span>,
    },
    {
      header: "Mode & Incoterm",
      cell: (row) => (
        <div className="text-xs">
          <span className="text-slate-200">{row.mode.replace("_", " ")}</span>
          <span className="text-slate-500 mx-1">•</span>
          <span className="font-mono text-cyan-300 font-bold">{row.incoterm}</span>
        </div>
      ),
    },
    {
      header: "Routing",
      cell: (row) => (
        <div className="text-xs text-slate-300">
          {row.origin} &rarr; {row.destination}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => <QuoteStatusBadge status={row.status} />,
    },
    {
      header: "Quoted Amount",
      accessorKey: "totalAmount",
      cell: (row) => (
        <span className="font-mono font-bold text-white text-xs">
          {formatCurrency(row.totalAmount)}
        </span>
      ),
    },
    {
      header: "Action",
      cell: (row) => (
        <Link href={`/admin/quotes/${row.quoteNumber}`}>
          <Button variant="outline" size="sm" className="h-7 text-xs px-2.5 gap-1">
            <Eye className="h-3 w-3" />
            <span>Process</span>
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Freight Quotes Queue</h1>
          <p className="text-xs text-slate-400 mt-1">
            Pricing desk, rate adjustment, fuel surcharge calculation, and quote issuance console.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quotes Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={SAMPLE_ADMIN_QUOTES}
            searchKey="quoteNumber"
            searchPlaceholder="Search quote or customer..."
            statusKey="status"
            statusOptions={[
              { value: "REVIEWING", label: "Reviewing" },
              { value: "ISSUED", label: "Issued" },
              { value: "ACCEPTED", label: "Accepted" },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
