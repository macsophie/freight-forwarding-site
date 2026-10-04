"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileCheck2,
  AlertTriangle,
  Shield,
  Clock,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Building2,
  Search,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { DataTable, Column } from "@/components/domain/data-table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { calculateCustomsDuties, generateCdsMrn } from "@/domain/customs";

interface AdminCustomsFiling {
  id: string;
  reference: string;
  shipmentId: string;
  companyName: string;
  authority: string;
  port: string;
  cifValue: number;
  dutyPayable: number;
  vatPayable: number;
  status: "CLEARANCE_GRANTED" | "PENDING_OFFICER_REVIEW" | "CUSTOMS_HOLD";
  holdReason?: string;
  actionRequired?: string;
}

const INITIAL_FILINGS: AdminCustomsFiling[] = [
  {
    id: "CUS-771",
    reference: "X20260828441029",
    shipmentId: "FWD-44102-EU",
    companyName: "Apex Global Imports LLC",
    authority: "US CBP (Chicago O'Hare ORD)",
    port: "USORD",
    cifValue: 84500,
    dutyPayable: 2535,
    vatPayable: 0,
    status: "CUSTOMS_HOLD",
    holdReason: "INTENSIVE_EXAM",
    actionRequired: "Submit Form 7501 Supplemental Invoices & Class 9 Lithium Cert",
  },
  {
    id: "CUS-772",
    reference: "26GB91028374819201",
    shipmentId: "FWD-89210-US",
    companyName: "Helios Energy Systems",
    authority: "HMRC CDS (Southampton)",
    port: "GBSOU",
    cifValue: 120400,
    dutyPayable: 5418,
    vatPayable: 25163,
    status: "CLEARANCE_GRANTED",
  },
  {
    id: "CUS-773",
    reference: "26NL00010048192011",
    shipmentId: "FWD-77312-AS",
    companyName: "Nordic Retail Partners",
    authority: "Dutch Douane (Rotterdam)",
    port: "NLRTM",
    cifValue: 45000,
    dutyPayable: 1800,
    vatPayable: 9828,
    status: "PENDING_OFFICER_REVIEW",
  },
];

export default function AdminCustomsConsolePage() {
  const [filings, setFilings] = React.useState<AdminCustomsFiling[]>(INITIAL_FILINGS);
  const [selectedFiling, setSelectedFiling] = React.useState<AdminCustomsFiling | null>(null);
  const [dutyAmount, setDutyAmount] = React.useState(2535);
  const [officerNotes, setOfficerNotes] = React.useState("Physical seal verified intact. Documents compliant.");

  const handleGrantClearance = (filingId: string) => {
    setFilings(
      filings.map((f) =>
        f.id === filingId
          ? {
              ...f,
              status: "CLEARANCE_GRANTED",
              holdReason: undefined,
              actionRequired: undefined,
            }
          : f
      )
    );
    setSelectedFiling(null);
  };

  const columns: Column<AdminCustomsFiling>[] = [
    {
      header: "Customs Entry / ITN / MRN",
      accessorKey: "reference",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-mono text-cyan-300 font-bold text-xs">{row.reference}</span>
          <span className="text-[10px] text-slate-400 font-mono">{row.shipmentId}</span>
        </div>
      ),
    },
    {
      header: "Customer Company",
      accessorKey: "companyName",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-white">{row.companyName}</span>
          <span className="text-[10px] text-slate-400">{row.authority}</span>
        </div>
      ),
    },
    {
      header: "CIF Goods Value",
      accessorKey: "cifValue",
      cell: (row) => (
        <span className="font-mono text-xs text-slate-200">
          {formatCurrency(row.cifValue)}
        </span>
      ),
    },
    {
      header: "Assessed Duty & Tax",
      cell: (row) => (
        <div className="flex flex-col font-mono text-xs">
          <span className="text-amber-300 font-bold">Duty: {formatCurrency(row.dutyPayable)}</span>
          {row.vatPayable > 0 && (
            <span className="text-[10px] text-slate-400">VAT: {formatCurrency(row.vatPayable)}</span>
          )}
        </div>
      ),
    },
    {
      header: "Customs Status",
      accessorKey: "status",
      cell: (row) => {
        if (row.status === "CLEARANCE_GRANTED") {
          return <Badge variant="success" className="text-[10px]">CLEARED</Badge>;
        }
        if (row.status === "CUSTOMS_HOLD") {
          return <Badge variant="destructive" className="text-[10px]">CUSTOMS HOLD</Badge>;
        }
        return <Badge variant="warning" className="text-[10px]">OFFICER REVIEW</Badge>;
      },
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          {row.status === "CUSTOMS_HOLD" ? (
            <Button
              variant="glow"
              size="sm"
              className="h-7 text-xs px-2.5 gap-1 bg-emerald-600 hover:bg-emerald-500"
              onClick={() => {
                setSelectedFiling(row);
                setDutyAmount(row.dutyPayable);
              }}
            >
              <CheckCircle2 className="h-3 w-3" />
              <span>Clear Hold</span>
            </Button>
          ) : (
            <Link href={`/admin/shipments/${row.shipmentId}`}>
              <Button variant="outline" size="sm" className="h-7 text-xs px-2.5">
                Inspect
              </Button>
            </Link>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white">Customs Compliance Control Center</h1>
            <Badge variant="info" className="text-[10px] font-bold">ACE & CDS ONLINE</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Operations oversight for CBP 7501 entries, HMRC CDS clearance, and statutory customs inspection holds.
          </p>
        </div>
      </div>

      {/* Immediate Attention Alert for Operations Staff */}
      <Card className="border-rose-500/30 bg-slate-900/90 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-rose-300">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            Active Customs Hold Queue (Immediate Forwarder Action Required)
          </CardTitle>
          <span className="text-[11px] font-mono text-slate-400">1 Critical Hold</span>
        </CardHeader>
        <CardContent className="space-y-3">
          {filings
            .filter((f) => f.status === "CUSTOMS_HOLD")
            .map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">{item.reference}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-xs font-semibold text-white">{item.companyName}</span>
                    <Badge variant="destructive" className="text-[9px]">
                      {item.holdReason}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Authority: <strong className="text-white">{item.authority}</strong> at Port{" "}
                    <strong className="text-white">{item.port}</strong>
                  </p>
                  <p className="text-[11px] text-amber-400 font-medium mt-0.5">
                    Directive: {item.actionRequired}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="glow"
                    size="sm"
                    className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-500"
                    onClick={() => {
                      setSelectedFiling(item);
                      setDutyAmount(item.dutyPayable);
                    }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Authorize Clearance Release</span>
                  </Button>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>

      {/* Declarations Ledger */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Active Corridor Declarations</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filings}
            searchKey="reference"
            searchPlaceholder="Search ITN, MRN or Shipment..."
          />
        </CardContent>
      </Card>

      {/* Clearance Resolution Modal */}
      {selectedFiling && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-lg w-full bg-slate-900 border-emerald-500/30 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-base text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Authorize Statutory Customs Release
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p className="text-slate-300">
                Grant clearance release for consignment <strong className="font-mono text-cyan-300">{selectedFiling.shipmentId}</strong> under entry <strong className="font-mono text-white">{selectedFiling.reference}</strong>.
              </p>
              <div>
                <Label>Assessed Customs Duty Liability ($)</Label>
                <Input
                  type="number"
                  value={dutyAmount}
                  onChange={(e) => setDutyAmount(parseFloat(e.target.value) || 0)}
                  className="mt-1 font-mono"
                />
              </div>
              <div>
                <Label>Customs Officer Verification Notes</Label>
                <Input
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/30 text-[11px] text-emerald-300">
                Authorizing clearance automatically advances shipment milestone to <strong>OUT_FOR_DELIVERY</strong>, logs an audit entry, and alerts the customer.
              </div>
            </CardContent>
            <div className="p-4 border-t border-slate-800 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedFiling(null)}>
                Cancel
              </Button>
              <Button
                variant="glow"
                size="sm"
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-500"
                onClick={() => handleGrantClearance(selectedFiling.id)}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirm & Release Consignment</span>
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
