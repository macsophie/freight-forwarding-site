"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, FileSpreadsheet, ArrowRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable, Column } from "@/components/domain/data-table";
import { QuoteStatusBadge } from "@/components/domain/status-badge";
import { formatDate, formatCurrency, formatWeight } from "@/lib/utils";
import { QuoteStatus, ShipmentMode, Incoterm } from "@/types/database";

interface QuoteRow {
  id: string;
  quoteNumber: string;
  mode: ShipmentMode;
  incoterm: Incoterm;
  origin: string;
  destination: string;
  totalAmount: number;
  currency: string;
  status: QuoteStatus;
  validUntil: string;
  weightKg: number;
}

const SAMPLE_QUOTES: QuoteRow[] = [
  {
    id: "QUO-2026-9104",
    quoteNumber: "QUO-2026-9104",
    mode: "OCEAN_FCL",
    incoterm: "FOB",
    origin: "Shanghai (CNSHA)",
    destination: "Long Beach (USLGB)",
    totalAmount: 3450,
    currency: "USD",
    status: "ISSUED",
    validUntil: "2026-09-15",
    weightKg: 18450,
  },
  {
    id: "QUO-2026-8841",
    quoteNumber: "QUO-2026-8841",
    mode: "AIR",
    incoterm: "CIF",
    origin: "Frankfurt (FRA)",
    destination: "Chicago (ORD)",
    totalAmount: 4890,
    currency: "USD",
    status: "ACCEPTED",
    validUntil: "2026-08-30",
    weightKg: 1250,
  },
  {
    id: "QUO-2026-7712",
    quoteNumber: "QUO-2026-7712",
    mode: "OCEAN_LCL",
    incoterm: "EXW",
    origin: "Shenzhen (CNSZX)",
    destination: "Rotterdam (NLRTM)",
    totalAmount: 1850,
    currency: "USD",
    status: "REVIEWING",
    validUntil: "2026-09-20",
    weightKg: 3200,
  },
  {
    id: "QUO-2026-6401",
    quoteNumber: "QUO-2026-6401",
    mode: "ROAD",
    incoterm: "DAP",
    origin: "Hamburg (DEHAM)",
    destination: "Warsaw (PLWAW)",
    totalAmount: 920,
    currency: "EUR",
    status: "DRAFT",
    validUntil: "2026-09-10",
    weightKg: 950,
  },
];

export default function CustomerQuotesPage() {
  const columns: Column<QuoteRow>[] = [
    {
      header: "Quote Reference",
      accessorKey: "quoteNumber",
      cell: (row) => (
        <Link
          href={`/portal/quotes/${row.quoteNumber}`}
          className="font-mono text-cyan-400 font-bold hover:underline"
        >
          {row.quoteNumber}
        </Link>
      ),
    },
    {
      header: "Mode & Incoterm",
      cell: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-200">{row.mode.replace("_", " ")}</span>
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
      header: "Total Rate",
      accessorKey: "totalAmount",
      cell: (row) => (
        <span className="font-mono font-bold text-white text-xs">
          {formatCurrency(row.totalAmount, row.currency)}
        </span>
      ),
    },
    {
      header: "Validity",
      accessorKey: "validUntil",
      cell: (row) => (
        <span className="text-xs text-slate-400 font-mono">
          {formatDate(row.validUntil)}
        </span>
      ),
    },
    {
      header: "Action",
      cell: (row) => (
        <Link href={`/portal/quotes/${row.quoteNumber}`}>
          <Button variant="outline" size="sm" className="h-7 text-xs px-2.5 gap-1">
            <Eye className="h-3 w-3" />
            <span>Inspect</span>
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Freight Quotes</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review custom rate breakdowns, accept issued quotes, or submit new requests.
          </p>
        </div>
        <Link href="/request-quote">
          <Button variant="glow" size="sm" className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            <span>Request New Quote</span>
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quotes Repository</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={SAMPLE_QUOTES}
            searchKey="quoteNumber"
            searchPlaceholder="Search quote number..."
            statusKey="status"
            statusOptions={[
              { value: "ISSUED", label: "Issued" },
              { value: "ACCEPTED", label: "Accepted" },
              { value: "REVIEWING", label: "Under Review" },
              { value: "DRAFT", label: "Draft" },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
