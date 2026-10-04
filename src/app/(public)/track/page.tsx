"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Ship,
  Plane,
  Truck,
  Anchor,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Calendar,
  Layers,
  ArrowLeft,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrackingTimeline } from "@/components/domain/tracking-timeline";
import { ShipmentStatusBadge } from "@/components/domain/status-badge";
import { RouteDisplay } from "@/components/domain/address-display";
import { CargoCard } from "@/components/domain/cargo-card";
import { ShipmentStatus, ShipmentMode } from "@/types/database";
import { formatDate, formatWeight, formatCBM } from "@/lib/utils";

// Sample shipment records for demo tracking
const SAMPLE_SHIPMENTS: Record<
  string,
  {
    trackingNumber: string;
    shipmentNumber: string;
    mode: ShipmentMode;
    incoterm: "FOB" | "CIF" | "DDP" | "EXW";
    status: ShipmentStatus;
    carrierName: string;
    vesselFlightNumber: string;
    voyageNumber: string;
    masterBillOfLading: string;
    originName: string;
    originPort: string;
    originCountry: string;
    destinationName: string;
    destinationPort: string;
    destinationCountry: string;
    etd: string;
    eta: string;
    containerNumbers: string[];
    totalPackages: number;
    totalGrossWeightKg: number;
    totalVolumeCbm: number;
    commoditySummary: string;
    currentLocation: string;
    events: Array<{
      id: string;
      status: ShipmentStatus;
      event_title: string;
      event_description?: string;
      location_name: string;
      occurred_at: string;
      source: string;
    }>;
  }
> = {
  "FWD-89210-US": {
    trackingNumber: "FWD-89210-US",
    shipmentNumber: "SHP-2026-0892",
    mode: "OCEAN_FCL",
    incoterm: "FOB",
    status: "IN_TRANSIT",
    carrierName: "Maersk Line (MSK)",
    vesselFlightNumber: "Maersk Mc-Kinney Moller",
    voyageNumber: "2608W",
    masterBillOfLading: "MSKU982103841",
    originName: "Shanghai Port CY",
    originPort: "CNSHA",
    originCountry: "CN",
    destinationName: "Port of Long Beach Terminal",
    destinationPort: "USLGB",
    destinationCountry: "US",
    etd: "2026-08-18T08:00:00Z",
    eta: "2026-09-06T18:00:00Z",
    containerNumbers: ["MSKU7891234 (40' HC)", "MSKU7891235 (40' HC)"],
    totalPackages: 840,
    totalGrossWeightKg: 18450,
    totalVolumeCbm: 68.5,
    commoditySummary: "Commercial Solar Power Inverters & Precision Control Units",
    currentLocation: "North Pacific Ocean (Coordinates: 34.21N, 168.42W)",
    events: [
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
    ],
  },
  "FWD-44102-EU": {
    trackingNumber: "FWD-44102-EU",
    shipmentNumber: "SHP-2026-0441",
    mode: "AIR",
    incoterm: "CIF",
    status: "CUSTOMS_CLEARANCE",
    carrierName: "Lufthansa Cargo (LH)",
    vesselFlightNumber: "LH Cargo 8402",
    voyageNumber: "LH8402",
    masterBillOfLading: "020-94812301",
    originName: "Frankfurt Airport Hub",
    originPort: "FRA",
    originCountry: "DE",
    destinationName: "Chicago O'Hare International",
    destinationPort: "ORD",
    destinationCountry: "US",
    etd: "2026-08-28T06:00:00Z",
    eta: "2026-08-29T14:00:00Z",
    containerNumbers: ["PAG-49120-LH (Air Cargo Pallet)"],
    totalPackages: 14,
    totalGrossWeightKg: 1250,
    totalVolumeCbm: 4.8,
    commoditySummary: "High Precision CNC Machine Tooling & Spares",
    currentLocation: "US CBP Customs Inspection Facility, Chicago O'Hare",
    events: [
      {
        id: "evt-a1",
        status: "BOOKED",
        event_title: "Air Waybill Issued & Cargo Reserved",
        event_description: "Expedited air cargo capacity secured on flight LH8402.",
        location_name: "Frankfurt Cargo City, Germany",
        occurred_at: "2026-08-26T09:00:00Z",
        source: "CARRIER_API",
      },
      {
        id: "evt-a2",
        status: "CARGO_RECEIVED",
        event_title: "Air Freight Pallet Assembled & Weighed",
        event_description: "Cargo passed airport security screening and dimensional verification.",
        location_name: "FRA Terminal 1 Cargo Hub",
        occurred_at: "2026-08-27T18:00:00Z",
        source: "SYSTEM",
      },
      {
        id: "evt-a3",
        status: "DEPARTED_ORIGIN",
        event_title: "Flight Departed Frankfurt",
        event_description: "Boeing 777F departed runway 18 for transatlantic corridor.",
        location_name: "Frankfurt Airport (FRA)",
        occurred_at: "2026-08-28T06:30:00Z",
        source: "CARRIER_API",
      },
      {
        id: "evt-a4",
        status: "ARRIVED_DESTINATION",
        event_title: "Flight Arrived at Chicago O'Hare",
        event_description: "Aircraft touched down and cargo unloaded into bonded warehouse.",
        location_name: "Chicago O'Hare (ORD)",
        occurred_at: "2026-08-28T15:45:00Z",
        source: "CARRIER_API",
      },
      {
        id: "evt-a5",
        status: "CUSTOMS_CLEARANCE",
        event_title: "Formal Customs Entry 7501 Filed",
        event_description: "Import duty calculated; awaiting CBP electronic release stamp.",
        location_name: "CBP Port Office Chicago, USA",
        occurred_at: "2026-08-29T10:00:00Z",
        source: "MANUAL",
      },
    ],
  },
};

function TrackContent() {
  const searchParams = useSearchParams();
  const initialNumber = searchParams.get("number") || "FWD-89210-US";

  const [searchQuery, setSearchQuery] = React.useState(initialNumber);
  const [activeShipment, setActiveShipment] = React.useState(
    SAMPLE_SHIPMENTS[initialNumber] || SAMPLE_SHIPMENTS["FWD-89210-US"]
  );
  const [notFound, setNotFound] = React.useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    if (SAMPLE_SHIPMENTS[query]) {
      setActiveShipment(SAMPLE_SHIPMENTS[query]);
      setNotFound(false);
    } else {
      setNotFound(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/portal/dashboard">
              <Button variant="outline" size="sm" className="text-xs">
                Shipper Portal
              </Button>
            </Link>
            <Link href="/request-quote">
              <Button variant="glow" size="sm" className="text-xs">
                Request Quote
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl flex-1">
        {/* Search Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20 mb-3">
            <Ship className="h-3.5 w-3.5" />
            <span>Public Tracking & Milestone Explorer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Global Cargo Milestone Tracker
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status updates, ocean & air milestones, container check-ins, and verified custody events.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2 mt-6 max-w-md mx-auto">
            <Input
              icon={<Search className="h-4 w-4 text-cyan-400" />}
              placeholder="Enter Tracking # (e.g. FWD-89210-US)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setNotFound(false);
              }}
              className="h-11 bg-slate-900 border-slate-700"
            />
            <Button type="submit" variant="glow" className="h-11 px-6">
              Track
            </Button>
          </form>

          {notFound && (
            <div className="flex items-center justify-center gap-2 text-rose-400 text-xs mt-3 bg-rose-950/30 p-2 rounded-lg border border-rose-900/50">
              <AlertCircle className="h-4 w-4" />
              <span>
                Tracking number not found. Try <strong>FWD-89210-US</strong> or <strong>FWD-44102-EU</strong>.
              </span>
            </div>
          )}
        </div>

        {activeShipment && !notFound && (
          <div className="space-y-6">
            {/* Top Summary Banner */}
            <Card className="border-sky-500/30 bg-slate-900/80 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-extrabold text-white font-mono">
                        {activeShipment.trackingNumber}
                      </h2>
                      <ShipmentStatusBadge status={activeShipment.status} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Carrier: <strong className="text-slate-200">{activeShipment.carrierName}</strong> • Master B/L: <span className="font-mono text-cyan-300">{activeShipment.masterBillOfLading}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <span className="text-slate-500 uppercase text-[10px] font-bold block">Estimated Departure</span>
                      <span className="font-semibold text-slate-200">{formatDate(activeShipment.etd)}</span>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-800" />
                    <div className="text-right">
                      <span className="text-cyan-400 uppercase text-[10px] font-bold block">Estimated Arrival</span>
                      <span className="font-semibold text-cyan-300 font-mono text-sm">{formatDate(activeShipment.eta)}</span>
                    </div>
                  </div>
                </div>

                {/* Corridor Route */}
                <div className="pt-6">
                  <RouteDisplay
                    originName={activeShipment.originName}
                    originPort={activeShipment.originPort}
                    originCountry={activeShipment.originCountry}
                    destinationName={activeShipment.destinationName}
                    destinationPort={activeShipment.destinationPort}
                    destinationCountry={activeShipment.destinationCountry}
                    mode={activeShipment.mode}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Live Milestone Stepper */}
            <Card>
              <CardHeader>
                <CardTitle>Milestone Progress & Tracking History</CardTitle>
              </CardHeader>
              <CardContent>
                <TrackingTimeline
                  currentStatus={activeShipment.status}
                  events={activeShipment.events}
                />
              </CardContent>
            </Card>

            {/* Cargo & Container Specs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Cargo Specifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <CargoCard
                    item={{
                      package_type: "Commercial Packages",
                      quantity: activeShipment.totalPackages,
                      gross_weight_kg: activeShipment.totalGrossWeightKg,
                      total_volume_cbm: activeShipment.totalVolumeCbm,
                      commodity_description: activeShipment.commoditySummary,
                    }}
                  />
                  <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Vessel / Flight Reference</span>
                    <span className="text-slate-200 font-medium">{activeShipment.vesselFlightNumber} (Voyage {activeShipment.voyageNumber})</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Container & Equipment Identifiers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  {activeShipment.containerNumbers.map((cntr, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/60 font-mono text-cyan-300"
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-sky-400" />
                        <span>{cntr}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-sans">Verified Seal</Badge>
                    </div>
                  ))}

                  <div className="mt-4 p-3 rounded-xl border border-emerald-500/20 bg-emerald-950/10 text-emerald-400 flex items-center gap-2.5">
                    <ShieldCheck className="h-5 w-5 shrink-0" />
                    <span>All customs filings and safety declarations verified for this consignment.</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function PublicTrackPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">Loading tracking data...</div>}>
      <TrackContent />
    </React.Suspense>
  );
}
