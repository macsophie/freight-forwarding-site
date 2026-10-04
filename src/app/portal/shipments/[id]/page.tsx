"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Ship,
  Compass,
  FileCheck2,
  Download,
  ShieldCheck,
  Layers,
  MapPin,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrackingTimeline } from "@/components/domain/tracking-timeline";
import { ShipmentStatusBadge } from "@/components/domain/status-badge";
import { RouteDisplay } from "@/components/domain/address-display";
import { CargoCard } from "@/components/domain/cargo-card";
import { formatDate, formatWeight, formatCBM } from "@/lib/utils";

export default function CustomerShipmentDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || "FWD-89210-US";

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/portal/shipments">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-white font-mono">{id}</h1>
              <ShipmentStatusBadge status="IN_TRANSIT" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Carrier: <strong className="text-slate-200">Maersk Line</strong> • Vessel: <span className="text-slate-200">Maersk Mc-Kinney Moller (Voy 2608W)</span> • Master B/L: <span className="font-mono text-cyan-300">MSKU982103841</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/track?number=${id}`} target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Compass className="h-3.5 w-3.5 text-cyan-400" />
              <span>Public Tracking URL</span>
            </Button>
          </Link>
          <Link href="/portal/documents">
            <Button variant="glow" size="sm" className="gap-1.5 text-xs">
              <FileCheck2 className="h-3.5 w-3.5" />
              <span>Download Documents</span>
            </Button>
          </Link>
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

      {/* Live Milestone Stepper & Events */}
      <Card>
        <CardHeader>
          <CardTitle>Milestone Progress & Verified Chain of Custody</CardTitle>
        </CardHeader>
        <CardContent>
          <TrackingTimeline
            currentStatus="IN_TRANSIT"
            events={[
              {
                id: "evt-1",
                status: "BOOKED",
                event_title: "Booking Confirmed by Carrier",
                event_description: "Carrier vessel allocation confirmed on voyage 2608W.",
                location_name: "Shanghai Port, China",
                occurred_at: "2026-08-12T04:20:00Z",
                source: "CARRIER_API",
              },
              {
                id: "evt-2",
                status: "DOCUMENTS_PENDING",
                event_title: "Customs Declaration & Commercial Invoices Verified",
                event_description: "Export clearance documentation approved by Chinese Customs Authority.",
                location_name: "Shanghai Customs Hub, China",
                occurred_at: "2026-08-14T11:00:00Z",
                source: "MANUAL",
              },
              {
                id: "evt-3",
                status: "CARGO_RECEIVED",
                event_title: "Containers Gated In at Port Terminal",
                event_description: "2x 40ft High Cube containers received at Yangshan Deepwater Terminal.",
                location_name: "Yangshan Deepwater Port, China",
                occurred_at: "2026-08-16T14:30:00Z",
                source: "CARRIER_EDI",
              },
              {
                id: "evt-4",
                status: "DEPARTED_ORIGIN",
                event_title: "Vessel Departed Origin Gateway",
                event_description: "Vessel cleared harbor pilotage and commenced trans-Pacific transit.",
                location_name: "Shanghai Harbor (CNSHA)",
                occurred_at: "2026-08-18T09:15:00Z",
                source: "CARRIER_API",
              },
              {
                id: "evt-5",
                status: "IN_TRANSIT",
                event_title: "Trans-Pacific Ocean Corridor Transit",
                event_description: "Vessel operating on schedule at 19.4 knots under standard sea conditions.",
                location_name: "North Pacific Maritime Route",
                occurred_at: "2026-08-25T16:00:00Z",
                source: "CARRIER_API",
              },
            ]}
          />
        </CardContent>
      </Card>

      {/* Cargo & Equipment Specs + Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Cargo & Container Identifiers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <CargoCard
              item={{
                package_type: "Pallets",
                quantity: 840,
                gross_weight_kg: 18450,
                total_volume_cbm: 68.5,
                commodity_description: "Commercial Solar Power Inverters & Inverter Sub-assemblies",
                hs_code: "8504.40",
              }}
            />

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Container Seals
              </span>
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 flex items-center justify-between font-mono text-cyan-300">
                <span>MSKU7891234 (40&apos; HC)</span>
                <span className="text-[10px] text-slate-400">Seal: ML-991024</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 flex items-center justify-between font-mono text-cyan-300">
                <span>MSKU7891235 (40&apos; HC)</span>
                <span className="text-[10px] text-slate-400">Seal: ML-991025</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Verified Shipment Documents</span>
              <Badge variant="success" className="text-[10px]">3 Verified</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {[
              {
                title: "Ocean Bill of Lading (B/L)",
                file: "MSKU982103841_Original_BL.pdf",
                size: "1.4 MB",
                type: "BILL_OF_LADING",
              },
              {
                title: "Commercial Invoice",
                file: "Apex_Solar_INV_2026_091.pdf",
                size: "420 KB",
                type: "COMMERCIAL_INVOICE",
              },
              {
                title: "Customs Declaration (C88 / Entry 7501)",
                file: "CBP_Entry_7501_Summary.pdf",
                size: "890 KB",
                type: "CUSTOMS_DECLARATION",
              },
            ].map((doc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/60"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <FileCheck2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-white">{doc.title}</h5>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {doc.file} ({doc.size})
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1">
                  <Download className="h-3 w-3" />
                  <span>Get</span>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
