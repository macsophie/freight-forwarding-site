"use client";

import * as React from "react";
import Link from "next/link";
import {
  Ship,
  FileSpreadsheet,
  Receipt,
  ShieldCheck,
  Plus,
  ArrowRight,
  Clock,
  MapPin,
  Anchor,
  Plane,
  AlertTriangle,
  FolderLock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/domain/data-table";
import { ShipmentStatusBadge } from "@/components/domain/status-badge";
import { formatDate, formatWeight, formatCurrency } from "@/lib/utils";
import { ShipmentStatus, ShipmentMode } from "@/types/database";

interface ShipmentRow {
  id: string;
  trackingNumber: string;
  mode: ShipmentMode;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  carrier: string;
  eta: string;
  weightKg: number;
}

const SAMPLE_PORTAL_SHIPMENTS: ShipmentRow[] = [
  {
    id: "SHP-2026-0892",
    trackingNumber: "FWD-89210-US",
    mode: "OCEAN_FCL",
    origin: "Shanghai (CNSHA)",
    destination: "Long Beach (USLGB)",
    status: "IN_TRANSIT",
    carrier: "Maersk Line",
    eta: "2026-09-06",
    weightKg: 18450,
  },
  {
    id: "SHP-2026-0441",
    trackingNumber: "FWD-44102-EU",
    mode: "AIR",
    origin: "Frankfurt (FRA)",
    destination: "Chicago (ORD)",
    status: "CUSTOMS_CLEARANCE",
    carrier: "Lufthansa Cargo",
    eta: "2026-08-29",
    weightKg: 1250,
  },
  {
    id: "SHP-2026-0715",
    trackingNumber: "FWD-77312-AS",
    mode: "OCEAN_LCL",
    origin: "Busan (KRPUS)",
    destination: "Rotterdam (NLRTM)",
    status: "DEPARTED_ORIGIN",
    carrier: "Hapag-Lloyd",
    eta: "2026-09-22",
    weightKg: 4200,
  },
  {
    id: "SHP-2026-0901",
    trackingNumber: "FWD-99014-ME",
    mode: "AIR",
    origin: "Dubai (DXB)",
    destination: "London Heathrow (LHR)",
    status: "BOOKED",
    carrier: "Emirates SkyCargo",
    eta: "2026-09-04",
    weightKg: 850,
  },
];

export default function CustomerDashboardPage() {
  const columns: Column<ShipmentRow>[] = [
    {
      header: "Tracking / B/L",
      accessorKey: "trackingNumber",
      cell: (row) => (
        <Link
          href={`/portal/shipments/${row.trackingNumber}`}
          className="font-mono text-cyan-400 font-bold hover:underline"
        >
          {row.trackingNumber}
        </Link>
      ),
    },
    {
      header: "Mode",
      accessorKey: "mode",
      cell: (row) => (
        <span className="text-xs text-slate-300 font-medium">
          {row.mode.replace("_", " ")}
        </span>
      ),
    },
    {
      header: "Origin & Destination",
      cell: (row) => (
        <div className="text-xs">
          <span className="text-slate-200">{row.origin}</span>
          <span className="text-slate-500 mx-1.5">&rarr;</span>
          <span className="text-slate-200">{row.destination}</span>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => <ShipmentStatusBadge status={row.status} />,
    },
    {
      header: "Carrier",
      accessorKey: "carrier",
      cell: (row) => <span className="text-xs text-slate-300">{row.carrier}</span>,
    },
    {
      header: "Est. Arrival",
      accessorKey: "eta",
      cell: (row) => (
        <span className="font-mono text-xs text-cyan-300">{formatDate(row.eta)}</span>
      ),
    },
    {
      header: "Action",
      cell: (row) => (
        <Link href={`/portal/shipments/${row.trackingNumber}`}>
          <Button variant="outline" size="sm" className="h-7 text-xs px-2.5">
            Details
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white">
              Shipper Control Center
            </h1>
            <Badge variant="success" className="text-[10px] font-bold">
              Account Verified
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Apex Global Imports LLC • Real-time freight pipeline & customs clearance monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/request-quote">
            <Button variant="glow" size="sm" className="gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              <span>New Quote Request</span>
            </Button>
          </Link>
          <Link href="/portal/documents">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <FolderLock className="h-3.5 w-3.5 text-sky-400" />
              <span>Document Vault</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-sky-500/20 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Shipments
            </span>
            <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Ship className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono">4</div>
            <p className="text-[11px] text-cyan-400 mt-1 font-medium">
              2 Ocean FCL, 2 Air Freight
            </p>
          </div>
        </Card>

        <Card className="p-5 border-amber-500/20 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Customs Pending
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-300 font-mono">1</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Chicago O&apos;Hare Entry Filing
            </p>
          </div>
        </Card>

        <Card className="p-5 border-cyan-500/20 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pending Quotes
            </span>
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono">2</div>
            <p className="text-[11px] text-cyan-400 mt-1 font-medium">
              1 Quote Ready for Approval
            </p>
          </div>
        </Card>

        <Card className="p-5 border-emerald-500/20 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Open Invoices
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-300 font-mono">
              {formatCurrency(2850)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Net 30 Due in 12 Days
            </p>
          </div>
        </Card>
      </div>

      {/* Active Shipments Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Active Consignments in Transit</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Live tracking events, vessel coordinates, and estimated discharge dates.
            </p>
          </div>
          <Link href="/portal/shipments">
            <Button variant="ghost" size="sm" className="text-xs gap-1">
              <span>View All Shipments</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={SAMPLE_PORTAL_SHIPMENTS}
            searchKey="trackingNumber"
            searchPlaceholder="Filter active shipments..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
