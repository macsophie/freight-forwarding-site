"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarCheck, Eye, Ship, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable, Column } from "@/components/domain/data-table";
import { BookingStatusBadge } from "@/components/domain/status-badge";
import { formatDate } from "@/lib/utils";
import { BookingStatus } from "@/types/database";

interface BookingRow {
  id: string;
  bookingNumber: string;
  carrier: string;
  carrierReference: string;
  route: string;
  status: BookingStatus;
  cargoCutoff: string;
  departureDate: string;
}

const SAMPLE_BOOKINGS: BookingRow[] = [
  {
    id: "BKG-2026-0819",
    bookingNumber: "BKG-2026-0819",
    carrier: "Maersk Line",
    carrierReference: "MSK-BK-91823",
    route: "Shanghai (CNSHA) &rarr; Long Beach (USLGB)",
    status: "CONFIRMED",
    cargoCutoff: "2026-08-16T17:00:00Z",
    departureDate: "2026-08-18",
  },
  {
    id: "BKG-2026-0412",
    bookingNumber: "BKG-2026-0412",
    carrier: "Lufthansa Cargo",
    carrierReference: "LH-BK-44019",
    route: "Frankfurt (FRA) &rarr; Chicago (ORD)",
    status: "PROCESSING",
    cargoCutoff: "2026-08-27T12:00:00Z",
    departureDate: "2026-08-28",
  },
  {
    id: "BKG-2026-0902",
    bookingNumber: "BKG-2026-0902",
    carrier: "Hapag-Lloyd",
    carrierReference: "HL-BK-11029",
    route: "Busan (KRPUS) &rarr; Rotterdam (NLRTM)",
    status: "CONFIRMED",
    cargoCutoff: "2026-09-02T18:00:00Z",
    departureDate: "2026-09-05",
  },
];

export default function CustomerBookingsPage() {
  const columns: Column<BookingRow>[] = [
    {
      header: "Booking Number",
      accessorKey: "bookingNumber",
      cell: (row) => (
        <Link
          href={`/portal/bookings/${row.bookingNumber}`}
          className="font-mono text-cyan-400 font-bold hover:underline"
        >
          {row.bookingNumber}
        </Link>
      ),
    },
    {
      header: "Carrier & Ref",
      cell: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-white block">{row.carrier}</span>
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
      accessorKey: "cargoCutoff",
      cell: (row) => (
        <span className="font-mono text-xs text-amber-300">
          {formatDate(row.cargoCutoff)}
        </span>
      ),
    },
    {
      header: "Est. Departure",
      accessorKey: "departureDate",
      cell: (row) => (
        <span className="font-mono text-xs text-slate-200">
          {formatDate(row.departureDate)}
        </span>
      ),
    },
    {
      header: "Action",
      cell: (row) => (
        <Link href={`/portal/bookings/${row.bookingNumber}`}>
          <Button variant="outline" size="sm" className="h-7 text-xs px-2.5 gap-1">
            <Eye className="h-3 w-3" />
            <span>View</span>
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Freight Bookings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Carrier space confirmations, container release orders, and terminal cutoff schedules.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={SAMPLE_BOOKINGS}
            searchKey="bookingNumber"
            searchPlaceholder="Search booking number..."
            statusKey="status"
            statusOptions={[
              { value: "CONFIRMED", label: "Confirmed" },
              { value: "PROCESSING", label: "Processing" },
              { value: "PENDING", label: "Pending" },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
