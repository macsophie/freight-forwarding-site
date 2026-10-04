"use client";

import * as React from "react";
import Link from "next/link";
import { Building2, Eye, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/domain/data-table";
import { formatDate, formatCurrency } from "@/lib/utils";
import { CompanyStatus } from "@/types/database";

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  taxId: string;
  creditLimit: number;
  activeShipments: number;
  status: CompanyStatus;
  joinedAt: string;
}

const SAMPLE_CUSTOMERS: CustomerRow[] = [
  {
    id: "COMP-001",
    name: "Apex Global Imports LLC",
    email: "operations@apeximports.com",
    taxId: "XX-XXXXXXX",
    creditLimit: 50000,
    activeShipments: 4,
    status: "ACTIVE",
    joinedAt: "2026-01-15",
  },
  {
    id: "COMP-002",
    name: "Helios Energy Systems",
    email: "logistics@heliosenergy.com",
    taxId: "YY-YYYYYYY",
    creditLimit: 75000,
    activeShipments: 2,
    status: "ACTIVE",
    joinedAt: "2026-03-20",
  },
  {
    id: "COMP-003",
    name: "Nordic Machinery GmbH",
    email: "freight@nordicmach.de",
    taxId: "DE987654321",
    creditLimit: 30000,
    activeShipments: 1,
    status: "PENDING_VERIFICATION",
    joinedAt: "2026-08-28",
  },
];

export default function AdminCustomersPage() {
  const columns: Column<CustomerRow>[] = [
    {
      header: "Company Name",
      accessorKey: "name",
      cell: (row) => (
        <Link
          href={`/admin/customers/${row.id}`}
          className="font-bold text-white text-xs hover:text-cyan-400 hover:underline"
        >
          {row.name}
        </Link>
      ),
    },
    {
      header: "Corporate Email",
      accessorKey: "email",
      cell: (row) => <span className="font-mono text-xs text-slate-400">{row.email}</span>,
    },
    {
      header: "Tax / EIN ID",
      accessorKey: "taxId",
      cell: (row) => <span className="font-mono text-xs text-slate-300">{row.taxId}</span>,
    },
    {
      header: "Credit Line",
      accessorKey: "creditLimit",
      cell: (row) => (
        <span className="font-mono text-xs text-slate-200">
          {formatCurrency(row.creditLimit)}
        </span>
      ),
    },
    {
      header: "Active Consignments",
      accessorKey: "activeShipments",
      cell: (row) => (
        <Badge variant="default" className="text-[10px] font-mono font-bold">
          {row.activeShipments} Active
        </Badge>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => (
        <Badge
          variant={row.status === "ACTIVE" ? "success" : "warning"}
          className="text-[10px]"
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Action",
      cell: (row) => (
        <Link href={`/admin/customers/${row.id}`}>
          <Button variant="outline" size="sm" className="h-7 text-xs px-2.5 gap-1">
            <Eye className="h-3 w-3" />
            <span>Manage</span>
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Customer Shipper Directory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Corporate multi-tenant accounts, KYC business verifications, and credit line underwriting.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shippers & Importers Registry</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={SAMPLE_CUSTOMERS}
            searchKey="name"
            searchPlaceholder="Search shipper name or email..."
            statusKey="status"
            statusOptions={[
              { value: "ACTIVE", label: "Active" },
              { value: "PENDING_VERIFICATION", label: "Pending Verification" },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
