"use client";

import * as React from "react";
import Link from "next/link";
import { Ship, Eye, Plus, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable, Column } from "@/components/domain/data-table";
import { ShipmentStatusBadge } from "@/components/domain/status-badge";
import { formatDate, formatWeight } from "@/lib/utils";
import { ShipmentStatus, ShipmentMode } from "@/types/database";

interface ShipmentListItem {
  id: string;
  trackingNumber: string;
  mode: ShipmentMode;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  carrier: string;
  vessel: string;
  eta: string;
  weightKg: number;
}

const SHIPMENTS_DATA: ShipmentListItem[] = [
  {
    id: "SHP-2026-0892",
    trackingNumber: "FWD-89210-US",
    mode: "OCEAN_FCL",
    origin: "Shanghai (CNSHA)",
    destination: "Long Beach (USLGB)",
    status: "IN_TRANSIT",
    carrier: "Maersk Line",
    vessel: "Maersk Mc-Kinney Moller",
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
    vessel: "LH 8402 (Boeing 777F)",
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
    vessel: "Berlin Express",
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
    vessel: "EK 9912",
    eta: "2026-09-04",
    weightKg: 850,
  },
  {
    id: "SHP-2026-0120",
    trackingNumber: "FWD-11045-US",
    mode: "OCEAN_FCL",
    origin: "Ningbo (CNNGB)",
    destination: "Oakland (USOAK)",
    status: "DELIVERED",
    carrier: "COSCO Shipping",
    vessel: "COSCO Development",
    eta: "2026-08-14",
    weightKg: 22100,
  },
];

export default function CustomerShipmentsPage() {
  const columns: Column<ShipmentListItem>[] = [
    {
      header: "Tracking #",
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
      header: "Routing",
      cell: (row) => (
        <div className="text-xs text-slate-200">
          {row.origin} &rarr; {row.destination}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => <ShipmentStatusBadge status={row.status} />,
    },
    {
      header: "Carrier / Vessel",
      cell: (row) => (
        <div className="text-xs">
          <span className="text-slate-200 block font-medium">{row.carrier}</span>
          <span className="text-slate-400 text-[11px]">{row.vessel}</span>
        </div>
      ),
    },
    {
      header: "Est. Arrival",
      accessorKey: "eta",
      cell: (row) => (
        <span className="font-mono text-xs text-cyan-300">
          {formatDate(row.eta)}
        </span>
      ),
    },
    {
      header: "Action",
      cell: (row) => (
        <Link href={`/portal/shipments/${row.trackingNumber}`}>
          <Button variant="outline" size="sm" className="h-7 text-xs px-2.5 gap-1">
            <Eye className="h-3 w-3" />
            <span>Track</span>
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Active Cargo Shipments</h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor container locations, international milestone events, and customs clearance releases.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/track">
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <Compass className="h-3.5 w-3.5 text-cyan-400" />
              <span>Public Tracking</span>
            </Button>
          </Link>
          <Link href="/request-quote">
            <Button variant="glow" size="sm" className="text-xs gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              <span>Book New Cargo</span>
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipment Registry</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={SHIPMENTS_DATA}
            searchKey="trackingNumber"
            searchPlaceholder="Search tracking number or vessel..."
            statusKey="status"
            statusOptions={[
              { value: "IN_TRANSIT", label: "In Transit" },
              { value: "CUSTOMS_CLEARANCE", label: "Customs Clearance" },
              { value: "DEPARTED_ORIGIN", label: "Departed Origin" },
              { value: "BOOKED", label: "Booked" },
              { value: "DELIVERED", label: "Delivered" },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
