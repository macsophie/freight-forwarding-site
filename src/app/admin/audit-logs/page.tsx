"use client";

import * as React from "react";
import { ShieldCheck, Search, Eye, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogClose } from "@/components/ui/dialog";
import { DataTable, Column } from "@/components/domain/data-table";
import { formatDateTime } from "@/lib/utils";
import { UserRole } from "@/types/database";

interface AuditLogRow {
  id: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  createdAt: string;
  changes: Record<string, any>;
}

const SAMPLE_AUDIT_LOGS: AuditLogRow[] = [
  {
    id: "aud-001",
    actorEmail: "marcus.vance@forwardflow.com",
    actorRole: "OPERATIONS_MANAGER",
    action: "MILESTONE_ADVANCED",
    entityType: "SHIPMENT",
    entityId: "SHP-2026-0892 (FWD-89210-US)",
    ipAddress: "192.0.2.45",
    createdAt: "2026-08-25T16:00:00Z",
    changes: {
      previousStatus: "DEPARTED_ORIGIN",
      newStatus: "IN_TRANSIT",
      location: "North Pacific Maritime Route",
      source: "CARRIER_API",
    },
  },
  {
    id: "aud-002",
    actorEmail: "david.chen@forwardflow.com",
    actorRole: "OPERATIONS_AGENT",
    action: "DOCUMENT_VERIFIED",
    entityType: "DOCUMENT",
    entityId: "DOC-101 (Master B/L)",
    ipAddress: "192.0.2.11",
    createdAt: "2026-08-16T14:45:00Z",
    changes: {
      documentId: "DOC-101",
      verificationStatus: "VERIFIED",
      sealVerified: true,
    },
  },
  {
    id: "aud-003",
    actorEmail: "marcus.vance@forwardflow.com",
    actorRole: "OPERATIONS_MANAGER",
    action: "QUOTE_ISSUED",
    entityType: "QUOTE",
    entityId: "QUO-2026-9104",
    ipAddress: "192.0.2.45",
    createdAt: "2026-08-24T14:00:00Z",
    changes: {
      quoteNumber: "QUO-2026-9104",
      quotedAmount: 3450,
      currency: "USD",
      validUntil: "2026-09-15",
    },
  },
  {
    id: "aud-004",
    actorEmail: "sarah.jenkins@forwardflow.com",
    actorRole: "SUPER_ADMIN",
    action: "CUSTOMER_KYC_VERIFIED",
    entityType: "COMPANY",
    entityId: "COMP-001 (Apex Global Imports)",
    ipAddress: "198.51.100.2",
    createdAt: "2026-01-15T09:30:00Z",
    changes: {
      status: "ACTIVE",
      creditLimit: 50000,
    },
  },
];

export default function AdminAuditLogsPage() {
  const [selectedLog, setSelectedLog] = React.useState<AuditLogRow | null>(null);

  const columns: Column<AuditLogRow>[] = [
    {
      header: "Timestamp",
      accessorKey: "createdAt",
      cell: (row) => (
        <span className="font-mono text-[11px] text-slate-300">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      header: "Actor",
      cell: (row) => (
        <div>
          <span className="font-semibold text-white text-xs block">{row.actorEmail}</span>
          <Badge variant="info" className="text-[9px] py-0 px-1 font-mono">
            {row.actorRole.replace(/_/g, " ")}
          </Badge>
        </div>
      ),
    },
    {
      header: "Action",
      accessorKey: "action",
      cell: (row) => (
        <Badge variant="default" className="text-[10px] font-mono font-semibold">
          {row.action}
        </Badge>
      ),
    },
    {
      header: "Target Entity",
      cell: (row) => (
        <div className="text-xs">
          <span className="text-slate-400 block text-[10px] uppercase">{row.entityType}</span>
          <span className="font-mono text-cyan-300 font-semibold">{row.entityId}</span>
        </div>
      ),
    },
    {
      header: "IP Address",
      accessorKey: "ipAddress",
      cell: (row) => (
        <span className="font-mono text-xs text-slate-400">{row.ipAddress}</span>
      ),
    },
    {
      header: "Details",
      cell: (row) => (
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs px-2.5 gap-1"
          onClick={() => setSelectedLog(row)}
        >
          <Eye className="h-3 w-3" />
          <span>Inspect</span>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-white">Compliance & Regulatory Audit Logs</h1>
          <Badge variant="success" className="text-[10px]">IMMUTABLE</Badge>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Cryptographically recorded timeline of administrative mutations, milestone dispatches, and KYC actions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Audit Trail</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={SAMPLE_AUDIT_LOGS}
            searchKey="actorEmail"
            searchPlaceholder="Search actor email or action..."
          />
        </CardContent>
      </Card>

      {/* Inspect Log Dialog */}
      {selectedLog && (
        <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
          <DialogClose onClick={() => setSelectedLog(null)} />
          <DialogHeader>
            <DialogTitle>Audit Record — {selectedLog.action}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div>
                <span className="text-slate-400 block">Actor:</span>
                <span className="font-bold text-white">{selectedLog.actorEmail}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Role:</span>
                <span className="text-cyan-400 font-mono font-bold">{selectedLog.actorRole}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Timestamp:</span>
                <span className="text-slate-200 font-mono">{formatDateTime(selectedLog.createdAt)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">IP Address:</span>
                <span className="text-slate-200 font-mono">{selectedLog.ipAddress}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">
                Payload Changes Diff (JSON)
              </span>
              <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                {JSON.stringify(selectedLog.changes, null, 2)}
              </pre>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
