"use client";

import * as React from "react";
import Link from "next/link";
import {
  Gauge,
  Ship,
  FileText,
  AlertTriangle,
  Clock,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  Building2,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/domain/data-table";
import { ShipmentStatusBadge } from "@/components/domain/status-badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ShipmentStatus } from "@/types/database";

interface UrgentActionItem {
  id: string;
  reference: string;
  customer: string;
  issue: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  actionRequired: string;
  link: string;
}

const URGENT_ITEMS: UrgentActionItem[] = [
  {
    id: "act-1",
    reference: "FWD-44102-EU",
    customer: "Apex Global Imports LLC",
    issue: "US CBP Inspection Request at Chicago O'Hare (ORD)",
    severity: "HIGH",
    actionRequired: "Submit Form 7501 Supplemental Invoices",
    link: "/admin/shipments/FWD-44102-EU",
  },
  {
    id: "act-2",
    reference: "QUO-2026-7712",
    customer: "Helios Energy Systems",
    issue: "Quote Request Awaiting Hazardous Cargo Surcharge Review",
    severity: "MEDIUM",
    actionRequired: "Assign Class 9 Lithium Rate Card",
    link: "/admin/quotes/QUO-2026-7712",
  },
  {
    id: "act-3",
    reference: "BKG-2026-0412",
    customer: "Apex Global Imports LLC",
    issue: "Lufthansa Cargo Air Booking Pending Space Confirmation",
    severity: "MEDIUM",
    actionRequired: "Confirm Master AWB Allocation",
    link: "/admin/bookings",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white">
              Operations Control Tower
            </h1>
            <Badge variant="info" className="text-[10px] font-bold">
              HQ LIVE DISPATCH
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time global freight throughput, customs exception monitoring, and carrier EDI sync.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/shipments">
            <Button variant="glow" size="sm" className="gap-1.5 text-xs">
              <Ship className="h-3.5 w-3.5" />
              <span>Shipments Console</span>
            </Button>
          </Link>
          <Link href="/admin/quotes">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <FileText className="h-3.5 w-3.5" />
              <span>Quotes Queue (3)</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900/60 border-sky-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active In-Transit Cargo
            </span>
            <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Ship className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-white font-mono">142</div>
            <p className="text-[11px] text-cyan-400 mt-0.5">88 Ocean FCL • 34 Air • 20 Truck/Rail</p>
          </div>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Unassigned Quotes
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-amber-300 font-mono">3</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Avg. Response Time: 14 mins</p>
          </div>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-rose-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Customs Holds / Blocks
            </span>
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-rose-400 font-mono">1</div>
            <p className="text-[11px] text-slate-400 mt-0.5">CBP Inspection (Chicago ORD)</p>
          </div>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Net Freight Revenue (MTD)
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-emerald-300 font-mono">
              {formatCurrency(284500)}
            </div>
            <p className="text-[11px] text-emerald-400 mt-0.5">+14.2% vs previous month</p>
          </div>
        </Card>
      </div>

      {/* Operational Attention Queue */}
      <Card className="border-amber-500/30 bg-slate-900/80">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 text-amber-300">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            Immediate Operations Action Required
          </CardTitle>
          <span className="text-[11px] font-mono text-slate-400">3 Priority Items</span>
        </CardHeader>
        <CardContent className="space-y-3">
          {URGENT_ITEMS.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    {item.reference}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs font-semibold text-slate-200">
                    {item.customer}
                  </span>
                  <Badge
                    variant={item.severity === "HIGH" ? "destructive" : "warning"}
                    className="text-[9px] py-0"
                  >
                    {item.severity} PRIORITY
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 mt-1">{item.issue}</p>
                <p className="text-[11px] text-amber-400/90 font-medium mt-0.5">
                  Action: {item.actionRequired}
                </p>
              </div>

              <Link href={item.link}>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1 border-slate-700">
                  <span>Resolve in Console</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Global EDI Connectivity & Carrier Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Ocean Carrier EDI Feed</span>
            <Badge variant="success" className="text-[10px]">CONNECTED</Badge>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Maersk, MSC, Hapag-Lloyd, COSCO live milestone webhooks online.
          </p>
        </Card>

        <Card className="p-4 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Air Cargo SITA / AWB Feed</span>
            <Badge variant="success" className="text-[10px]">CONNECTED</Badge>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Lufthansa, Emirates, Qatar Airways flight status polling active.
          </p>
        </Card>

        <Card className="p-4 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Customs Automated Gateway</span>
            <Badge variant="success" className="text-[10px]">ACTIVE</Badge>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            US CBP ACE EDI & EU NCTS clearance interfaces operating normally.
          </p>
        </Card>
      </div>
    </div>
  );
}
