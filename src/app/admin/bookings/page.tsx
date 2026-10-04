"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarRange, Eye, Ship, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable, Column } from "@/components/domain/data-table";
import { BookingStatusBadge } from "@/components/domain/status-badge";
import { formatDate } from "@/lib/utils";
import { BookingStatus } from "@/types/database";

interface AdminBookingRow {
  id: string;
  bookingNumber: string;
  customerName: string;
  carrier: string;
  carrierReference: string;
  route: string;
  status: BookingStatus;
  cutoffDate: string;
}

const SAMPLE_ADMIN_BOOKINGS: AdminBookingRow[] = [
  {
    id: "BKG-2026-0819",
    bookingNumber: "BKG-2026-0819",
    customerName: "Apex Global Imports LLC",
    carrier: "Maersk Line",
    carrierReference: "MSK-BK-91823",
    route: "Shanghai (CNSHA) &rarr; Long Beach (USLGB)",
    status: "CONFIRMED",
    cutoffDate: "2026-08-16",
  },
  {
    id: "BKG-2026-0412",
    bookingNumber: "BKG-2026-0412",
    customerName: "Apex Global Imports LLC",
    carrier: "Lufthansa Cargo",
    carrierReference: "LH-BK-44019",
    route: "Frankfurt (FRA) &rarr; Chicago (ORD)",
    status: "PROCESSING",
    cutoffDate: "2026-08-27",
  },
];

export default function AdminBookingsPage() {
  const columns: Column<AdminBookingRow>[] = [
    {
      header: "Booking #",
      accessorKey: "bookingNumber",
      cell: (row) => (
        <span className="font-mono text-cyan-400 font-bold text-xs">
          {row.bookingNumber}
        </span>
      ),
    },
    {
      header: "Customer",
      accessorKey: "customerName",
      cell: (row) => <span className="font-semibold text-white text-xs">{row.customerName}</span>,
    },
    {
      header: "Carrier & Booking Ref",
      cell: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-200 block">{row.carrier}</span>
          <span className="font-mono text-slate-400 text-[11px]">{row.carrierReference}</span>
        </div>
      ),
    },
    {
      header: "Corridor",
      cell: (row) => (
        <div
          className="text-xs text-slate-300"
          dangerouslySetInnerHTML={{ __html: row.route }}
        />
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => <BookingStatusBadge status={row.status} />,
    },
    {
      header: "Cargo Cut-Off",
      accessorKey: "cutoffDate",
      cell: (row) => (
        <span className="font-mono text-xs text-amber-300">
          {formatDate(row.cutoffDate)}
        </span>
      ),
    },
    {
      header: "Action",
      cell: (row) => (
        <Link href={`/admin/shipments/${row.bookingNumber === "BKG-2026-0819" ? "FWD-89210-US" : "FWD-44102-EU"}`}>
          <Button variant="outline" size="sm" className="h-7 text-xs px-2.5">
            Console
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Carrier Bookings Queue</h1>
        <p className="text-xs text-slate-400 mt-1">
          Carrier vessel allocation, equipment dispatch orders, and cargo terminal check-in tracking.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bookings Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={SAMPLE_ADMIN_BOOKINGS}
            searchKey="bookingNumber"
            searchPlaceholder="Search booking number or customer..."
            statusKey="status"
            statusOptions={[
              { value: "CONFIRMED", label: "Confirmed" },
              { value: "PROCESSING", label: "Processing" },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
