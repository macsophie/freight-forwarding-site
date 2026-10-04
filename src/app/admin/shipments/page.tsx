"use client";

import * as React from "react";
import Link from "next/link";
import { Ship, Eye, Plus, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable, Column } from "@/components/domain/data-table";
import { ShipmentStatusBadge } from "@/components/domain/status-badge";
import { formatDate } from "@/lib/utils";
import { ShipmentStatus, ShipmentMode } from "@/types/database";

interface AdminShipmentRow {
  id: string;
  trackingNumber: string;
  customerName: string;
  mode: ShipmentMode;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  carrier: string;
  eta: string;
}

const SAMPLE_ADMIN_SHIPMENTS: AdminShipmentRow[] = [
  {
    id: "SHP-2026-0892",
    trackingNumber: "FWD-89210-US",
    customerName: "Apex Global Imports LLC",
    mode: "OCEAN_FCL",
    origin: "Shanghai (CNSHA)",
    destination: "Long Beach (USLGB)",
    status: "IN_TRANSIT",
    carrier: "Maersk Line",
    eta: "2026-09-06",
  },
  {
    id: "SHP-2026-0441",
    trackingNumber: "FWD-44102-EU",
    customerName: "Apex Global Imports LLC",
    mode: "AIR",
    origin: "Frankfurt (FRA)",
    destination: "Chicago (ORD)",
    status: "CUSTOMS_CLEARANCE",
    carrier: "Lufthansa Cargo",
    eta: "2026-08-29",
  },
  {
    id: "SHP-2026-0715",
    trackingNumber: "FWD-77312-AS",
    customerName: "Helios Energy Systems",
    mode: "OCEAN_LCL",
    origin: "Busan (KRPUS)",
    destination: "Rotterdam (NLRTM)",
    status: "DEPARTED_ORIGIN",
    carrier: "Hapag-Lloyd",
    eta: "2026-09-22",
  },
];

export default function AdminShipmentsPage() {
  const columns: Column<AdminShipmentRow>[] = [
    {
      header: "Tracking / B/L",
      accessorKey: "trackingNumber",
      cell: (row) => (
        <Link
          href={`/admin/shipments/${row.trackingNumber}`}
          className="font-mono text-cyan-400 font-bold hover:underline"
        >
          {row.trackingNumber}
        </Link>
      ),
    },
    {
      header: "Customer",
      accessorKey: "customerName",
      cell: (row) => <span className="font-semibold text-white text-xs">{row.customerName}</span>,
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
      header: "Corridor",
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
      header: "Carrier",
      accessorKey: "carrier",
      cell: (row) => <span className="text-xs text-slate-300">{row.carrier}</span>,
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
        <Link href={`/admin/shipments/${row.trackingNumber}`}>
          <Button variant="outline" size="sm" className="h-7 text-xs px-2.5 gap-1">
            <Eye className="h-3 w-3" />
            <span>Console</span>
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Shipments Operations Console</h1>
          <p className="text-xs text-slate-400 mt-1">
            Live container positions, carrier milestone dispatch, and customs inspection handling.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Freight Consignments</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={SAMPLE_ADMIN_SHIPMENTS}
            searchKey="trackingNumber"
            searchPlaceholder="Search tracking or customer..."
            statusKey="status"
            statusOptions={[
              { value: "IN_TRANSIT", label: "In Transit" },
              { value: "CUSTOMS_CLEARANCE", label: "Customs Clearance" },
              { value: "DEPARTED_ORIGIN", label: "Departed Origin" },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
