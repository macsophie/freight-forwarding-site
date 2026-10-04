"use client";

import * as React from "react";
import { Users, Shield, Plus, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/domain/data-table";
import { UserRole } from "@/types/database";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company: string;
  isActive: boolean;
}

const SAMPLE_USERS: UserRow[] = [
  {
    id: "usr-1",
    name: "Capt. Marcus Vance",
    email: "marcus.vance@forwardflow.com",
    role: "OPERATIONS_MANAGER",
    company: "ForwardFlow Global Logistics HQ",
    isActive: true,
  },
  {
    id: "usr-2",
    name: "Sarah Jenkins",
    email: "sarah.jenkins@forwardflow.com",
    role: "SUPER_ADMIN",
    company: "ForwardFlow Global Logistics HQ",
    isActive: true,
  },
  {
    id: "usr-3",
    name: "David Chen",
    email: "david.chen@forwardflow.com",
    role: "OPERATIONS_AGENT",
    company: "ForwardFlow Global Logistics HQ",
    isActive: true,
  },
  {
    id: "usr-4",
    name: "Alex Rivera",
    email: "alex@apeximports.com",
    role: "CUSTOMER_ADMIN",
    company: "Apex Global Imports LLC",
    isActive: true,
  },
];

export default function AdminUsersPage() {
  const columns: Column<UserRow>[] = [
    {
      header: "Full Name",
      accessorKey: "name",
      cell: (row) => <span className="font-bold text-white text-xs">{row.name}</span>,
    },
    {
      header: "Email",
      accessorKey: "email",
      cell: (row) => <span className="font-mono text-slate-400 text-xs">{row.email}</span>,
    },
    {
      header: "Assigned Role",
      accessorKey: "role",
      cell: (row) => (
        <Badge
          variant={row.role.includes("ADMIN") || row.role.includes("MANAGER") ? "info" : "default"}
          className="text-[10px]"
        >
          {row.role.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      header: "Organization",
      accessorKey: "company",
      cell: (row) => <span className="text-xs text-slate-300">{row.company}</span>,
    },
    {
      header: "Status",
      accessorKey: "isActive",
      cell: (row) => (
        <Badge variant={row.isActive ? "success" : "destructive"} className="text-[10px]">
          {row.isActive ? "Active" : "Disabled"}
        </Badge>
      ),
    },
    {
      header: "Action",
      cell: (row) => (
        <Button variant="outline" size="sm" className="h-7 text-xs px-2.5">
          Permissions
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Users & Role-Based Access Control</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage internal operations personnel roles, permissions, and customer account access.
          </p>
        </div>
        <Button variant="glow" size="sm" className="gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          <span>Invite Staff Member</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={SAMPLE_USERS}
            searchKey="name"
            searchPlaceholder="Search by name or email..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
