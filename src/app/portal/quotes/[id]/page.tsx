"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileCheck,
  Calculator,
  Download,
  Calendar,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuoteStatusBadge } from "@/components/domain/status-badge";
import { RouteDisplay } from "@/components/domain/address-display";
import { CargoCard } from "@/components/domain/cargo-card";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CustomerQuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quoteId = (params?.id as string) || "QUO-2026-9104";

  const [status, setStatus] = React.useState<"ISSUED" | "ACCEPTED" | "REJECTED">("ISSUED");
  const [showAcceptDialog, setShowAcceptDialog] = React.useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleAccept = () => {
    setLoading(true);
    setTimeout(() => {
      setStatus("ACCEPTED");
      setLoading(false);
      setShowAcceptDialog(false);
    }, 400);
  };

  const handleDecline = () => {
    setLoading(true);
    setTimeout(() => {
      setStatus("REJECTED");
      setLoading(false);
      setShowDeclineDialog(false);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/portal/quotes">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-white font-mono">{quoteId}</h1>
              <QuoteStatusBadge status={status} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Issued on Aug 24, 2026 • Valid until Sep 15, 2026
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status === "ISSUED" && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="border-rose-800/40 text-rose-300 hover:bg-rose-950/30 text-xs"
                onClick={() => setShowDeclineDialog(true)}
              >
                <XCircle className="h-3.5 w-3.5 mr-1" />
                Decline
              </Button>
              <Button
                variant="glow"
                size="sm"
                className="text-xs font-semibold"
                onClick={() => setShowAcceptDialog(true)}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Accept & Book Cargo
              </Button>
            </>
          )}

          {status === "ACCEPTED" && (
            <Link href="/portal/bookings">
              <Button variant="glow" size="sm" className="text-xs">
                View Generated Booking &rarr;
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Trade Route Corridor */}
      <RouteDisplay
        originName="Shanghai Port CY"
        originPort="CNSHA"
        originCountry="CN"
        destinationName="Port of Long Beach Terminal"
        destinationPort="USLGB"
        destinationCountry="US"
        mode="OCEAN_FCL"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Fee Breakdown */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Calculator className="h-4 w-4 text-cyan-400" />
                Itemized Freight Charge Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-2 divide-y divide-slate-800/60">
                <div className="flex justify-between pt-2">
                  <div>
                    <span className="text-slate-200 font-medium block">Ocean Freight Base Rate (FCL)</span>
                    <span className="text-[11px] text-slate-400">1x 40ft High Cube Container (Shanghai &rarr; Long Beach)</span>
                  </div>
                  <span className="font-mono font-bold text-white text-sm">{formatCurrency(2200)}</span>
                </div>

                <div className="flex justify-between pt-2">
                  <div>
                    <span className="text-slate-200 font-medium block">Origin Terminal Handling Charges (THC)</span>
                    <span className="text-[11px] text-slate-400">Export port documentation, wharfage & seal fees</span>
                  </div>
                  <span className="font-mono text-slate-200">{formatCurrency(380)}</span>
                </div>

                <div className="flex justify-between pt-2">
                  <div>
                    <span className="text-slate-200 font-medium block">Destination Port Handling & Security</span>
                    <span className="text-[11px] text-slate-400">US terminal security, pier pass & clean truck fee</span>
                  </div>
                  <span className="font-mono text-slate-200">{formatCurrency(420)}</span>
                </div>

                <div className="flex justify-between pt-2">
                  <div>
                    <span className="text-slate-200 font-medium block">Customs Brokerage & ISF Filing</span>
                    <span className="text-[11px] text-slate-400">Importer Security Filing 10+2 & CBP entry 7501</span>
                  </div>
                  <span className="font-mono text-slate-200">{formatCurrency(250)}</span>
                </div>

                <div className="flex justify-between pt-2">
                  <div>
                    <span className="text-slate-200 font-medium block">Marine Cargo Insurance</span>
                    <span className="text-[11px] text-slate-400">Institute Cargo Clauses (A) All-Risk 110% CIF valuation</span>
                  </div>
                  <span className="font-mono text-slate-200">{formatCurrency(200)}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-sm">
                <span className="font-bold text-white">Total Guaranteed Freight Rate:</span>
                <span className="text-xl font-extrabold text-cyan-300 font-mono">
                  {formatCurrency(3450)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Cargo Specs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Cargo Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <CargoCard
                item={{
                  package_type: "Pallets",
                  quantity: 10,
                  gross_weight_kg: 18450,
                  total_volume_cbm: 68.5,
                  commodity_description: "Commercial Solar Power Inverters & Inverter Sub-assemblies",
                  hs_code: "8504.40",
                  is_hazardous: false,
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Terms & Operations Desk */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Contract Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Incoterm:</span>
                <span className="font-bold text-white">FOB — Free on Board</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Transit:</span>
                <span className="font-mono text-cyan-300">18 - 22 Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Detention Free Days:</span>
                <span className="font-mono text-slate-200">14 Days at Destination</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Terms:</span>
                <span className="text-slate-200">Net 30 from B/L Date</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-sky-500/20 bg-sky-950/10">
            <CardHeader>
              <CardTitle className="text-sm text-sky-400">Assigned Routing Officer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <p className="font-bold text-white">Marcus Vance</p>
              <p className="text-slate-400">Trans-Pacific Ocean Desk</p>
              <p className="text-cyan-400 font-mono">marcus.vance@forwardflow.example</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={showAcceptDialog}
        onOpenChange={setShowAcceptDialog}
        title="Accept Freight Quote & Book Space?"
        description={`By confirming, you accept the quote of ${formatCurrency(3450)} and instruct ForwardFlow to confirm carrier equipment allocation.`}
        confirmLabel="Accept & Generate Booking"
        variant="default"
        loading={loading}
        onConfirm={handleAccept}
      />

      <ConfirmDialog
        open={showDeclineDialog}
        onOpenChange={setShowDeclineDialog}
        title="Decline this Freight Quote?"
        description="Are you sure you want to decline this quote? You will be able to request a new quote at any time."
        confirmLabel="Decline Quote"
        variant="destructive"
        loading={loading}
        onConfirm={handleDecline}
      />
    </div>
  );
}
