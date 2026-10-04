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
  Upload,
  Download,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { DataTable, Column } from "@/components/domain/data-table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { generateAceItn, generateCdsMrn } from "@/domain/customs";

interface CustomsDeclarationRow {
  id: string;
  referenceNumber: string; // ITN or MRN
  shipmentNumber: string;
  type: "US_ACE_EXPORT" | "US_CBP_IMPORT" | "UK_CDS_IMPORT" | "EU_NCTS_TRANSIT";
  authority: string;
  customsOffice: string;
  declaredValueUsd: number;
  assessedDutyUsd: number;
  status: "CLEARED" | "SUBMITTED" | "CUSTOMS_HOLD";
  filedAt: string;
}

const SAMPLE_DECLARATIONS: CustomsDeclarationRow[] = [
  {
    id: "DEC-2026-001",
    referenceNumber: "X20260815982103",
    shipmentNumber: "FWD-89210-US",
    type: "US_ACE_EXPORT",
    authority: "US CBP / AES Direct",
    customsOffice: "Shanghai / Long Beach (2704)",
    declaredValueUsd: 148500,
    assessedDutyUsd: 0,
    status: "CLEARED",
    filedAt: "2026-08-15",
  },
  {
    id: "DEC-2026-002",
    referenceNumber: "26GB91028374819201",
    shipmentNumber: "FWD-44102-EU",
    type: "UK_CDS_IMPORT",
    authority: "HMRC Customs Declaration Service",
    customsOffice: "Dover Port (GB000060)",
    declaredValueUsd: 62400,
    assessedDutyUsd: 2808,
    status: "CUSTOMS_HOLD",
    filedAt: "2026-08-28",
  },
  {
    id: "DEC-2026-003",
    referenceNumber: "26NL00010048192011",
    shipmentNumber: "FWD-77312-AS",
    type: "EU_NCTS_TRANSIT",
    authority: "Dutch Customs (Douane)",
    customsOffice: "Rotterdam Maasvlakte (NL000100)",
    declaredValueUsd: 94000,
    assessedDutyUsd: 4230,
    status: "CLEARED",
    filedAt: "2026-08-10",
  },
];

export default function CustomerCustomsPage() {
  const [declarations, setDeclarations] = React.useState(SAMPLE_DECLARATIONS);
  const [showFilingModal, setShowFilingModal] = React.useState(false);

  // Quick filing form state
  const [shipmentRef, setShipmentRef] = React.useState("FWD-NEW-CARGO");
  const [einNumber, setEinNumber] = React.useState("12-3456789");
  const [consignee, setConsignee] = React.useState("Apex Commercial Europe BV");
  const [declaredVal, setDeclaredVal] = React.useState(75000);

  const handleCreateFiling = (e: React.FormEvent) => {
    e.preventDefault();
    const newItn = generateAceItn();
    const newRecord: CustomsDeclarationRow = {
      id: `DEC-${Date.now().toString().slice(-4)}`,
      referenceNumber: newItn,
      shipmentNumber: shipmentRef,
      type: "US_ACE_EXPORT",
      authority: "US CBP / AES Direct",
      customsOffice: "Long Beach (2704)",
      declaredValueUsd: declaredVal,
      assessedDutyUsd: 0,
      status: "SUBMITTED",
      filedAt: new Date().toISOString().split("T")[0],
    };
    setDeclarations([newRecord, ...declarations]);
    setShowFilingModal(false);
  };

  const columns: Column<CustomsDeclarationRow>[] = [
    {
      header: "Filing Reference (ITN / MRN)",
      accessorKey: "referenceNumber",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-mono text-cyan-300 font-bold text-xs">{row.referenceNumber}</span>
          <span className="text-[10px] text-slate-400">{row.type.replace(/_/g, " ")}</span>
        </div>
      ),
    },
    {
      header: "Shipment #",
      accessorKey: "shipmentNumber",
      cell: (row) => (
        <Link href={`/portal/shipments/${row.shipmentNumber}`} className="font-mono text-xs text-sky-400 hover:underline">
          {row.shipmentNumber}
        </Link>
      ),
    },
    {
      header: "Authority & Port",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-white">{row.authority}</span>
          <span className="text-[10px] text-slate-400">{row.customsOffice}</span>
        </div>
      ),
    },
    {
      header: "Declared CIF Value",
      accessorKey: "declaredValueUsd",
      cell: (row) => (
        <span className="font-mono text-xs text-slate-200">
          {formatCurrency(row.declaredValueUsd)}
        </span>
      ),
    },
    {
      header: "Customs Duty / VAT",
      accessorKey: "assessedDutyUsd",
      cell: (row) => (
        <span className="font-mono text-xs text-amber-300 font-semibold">
          {row.assessedDutyUsd > 0 ? formatCurrency(row.assessedDutyUsd) : "Exempt / Export"}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => {
        if (row.status === "CLEARED") {
          return <Badge variant="success" className="text-[10px]">CLEARED</Badge>;
        }
        if (row.status === "CUSTOMS_HOLD") {
          return <Badge variant="destructive" className="text-[10px]">INSPECTION HOLD</Badge>;
        }
        return <Badge variant="info" className="text-[10px]">LODGED</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Customs Clearances & Declarations</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated US ACE / AES Direct filings, European CDS / NCTS declarations, and inspection compliance.
          </p>
        </div>

        <Button
          variant="glow"
          size="sm"
          className="gap-1.5 text-xs font-semibold"
          onClick={() => setShowFilingModal(true)}
        >
          <Plus className="h-4 w-4" />
          <span>Lodge Electronic Export Declaration</span>
        </Button>
      </div>

      {/* Urgent Customs Exception Banner */}
      <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wide">
                Customs Hold Alert — Shipment FWD-44102-EU
              </h4>
              <Badge variant="destructive" className="text-[9px]">ACTION REQUIRED</Badge>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              HMRC at Dover has requested supplemental proof of commercial invoice valuation and EUR.1 preferential origin documentation.
            </p>
          </div>
        </div>

        <Link href="/portal/documents">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-rose-700 text-rose-200 hover:bg-rose-900/30">
            <Upload className="h-3.5 w-3.5" />
            <span>Upload Form EUR.1</span>
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Filings YTD</span>
          <div className="text-2xl font-black text-white font-mono mt-1">28</div>
          <p className="text-[11px] text-cyan-400 mt-0.5">ACE, CDS & NCTS entries</p>
        </Card>
        <Card className="p-4 bg-slate-900/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clearance Rate</span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">96.4%</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Avg. clearance: 4.2 hours</p>
        </Card>
        <Card className="p-4 bg-slate-900/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Holds</span>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">1</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Under HMRC review</p>
        </Card>
        <Card className="p-4 bg-slate-900/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Duties Paid</span>
          <div className="text-2xl font-black text-amber-300 font-mono mt-1">{formatCurrency(18420)}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Direct to customs authorities</p>
        </Card>
      </div>

      {/* Declarations Ledger */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Verified Customs Declarations & ITN Registry</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={declarations}
            searchKey="referenceNumber"
            searchPlaceholder="Search ITN or MRN reference..."
          />
        </CardContent>
      </Card>

      {/* Quick Filing Modal */}
      {showFilingModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-lg w-full bg-slate-900 border-sky-500/30 shadow-2xl">
            <form onSubmit={handleCreateFiling}>
              <CardHeader>
                <CardTitle className="text-base text-cyan-300 flex items-center gap-2">
                  <FileCheck2 className="h-5 w-5 text-cyan-400" />
                  Lodge ACE Export Declaration (AES Direct)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div>
                  <Label required>Associated Consignment Reference</Label>
                  <Input
                    value={shipmentRef}
                    onChange={(e) => setShipmentRef(e.target.value)}
                    className="mt-1 font-mono"
                    required
                  />
                </div>
                <div>
                  <Label required>USPPI Employer Identification Number (EIN)</Label>
                  <Input
                    value={einNumber}
                    onChange={(e) => setEinNumber(e.target.value)}
                    className="mt-1 font-mono"
                    placeholder="XX-XXXXXXX"
                    required
                  />
                </div>
                <div>
                  <Label required>Foreign Consignee Legal Entity</Label>
                  <Input
                    value={consignee}
                    onChange={(e) => setConsignee(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label required>Commercial Goods Valuation ($)</Label>
                  <Input
                    type="number"
                    value={declaredVal}
                    onChange={(e) => setDeclaredVal(parseFloat(e.target.value) || 0)}
                    className="mt-1 font-mono"
                    required
                  />
                </div>
                <div className="p-3 rounded-lg bg-sky-950/30 border border-sky-800/40 text-[11px] text-sky-200">
                  Submitting will electronically transmit the Electronic Export Information (EEI) to US Customs & Border Protection and allocate an internal ITN.
                </div>
              </CardContent>
              <div className="p-4 border-t border-slate-800 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilingModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="glow" size="sm" className="gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Transmit to ACE</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
