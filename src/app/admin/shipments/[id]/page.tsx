"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Ship,
  Plus,
  CheckCircle2,
  MapPin,
  Clock,
  FileCheck2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrackingTimeline } from "@/components/domain/tracking-timeline";
import { ShipmentStatusBadge } from "@/components/domain/status-badge";
import { RouteDisplay } from "@/components/domain/address-display";
import { CargoCard } from "@/components/domain/cargo-card";
import { SHIPMENT_MILESTONES } from "@/lib/constants";
import { ShipmentStatus } from "@/types/database";

export default function AdminShipmentConsolePage() {
  const params = useParams();
  const id = (params?.id as string) || "FWD-89210-US";

  const [currentStatus, setCurrentStatus] = React.useState<ShipmentStatus>("IN_TRANSIT");
  const [events, setEvents] = React.useState([
    {
      id: "evt-1",
      status: "BOOKED" as ShipmentStatus,
      event_title: "Booking Confirmed by Carrier",
      event_description: "Carrier vessel allocation confirmed on voyage 2608W.",
      location_name: "Shanghai Port, China",
      occurred_at: "2026-08-12T04:20:00Z",
      source: "CARRIER_API",
    },
    {
      id: "evt-2",
      status: "DOCUMENTS_PENDING" as ShipmentStatus,
      event_title: "Customs Declaration & Commercial Invoices Verified",
      event_description: "Export clearance documentation approved by Chinese Customs Authority.",
      location_name: "Shanghai Customs Hub, China",
      occurred_at: "2026-08-14T11:00:00Z",
      source: "MANUAL",
    },
    {
      id: "evt-3",
      status: "CARGO_RECEIVED" as ShipmentStatus,
      event_title: "Containers Gated In at Port Terminal",
      event_description: "2x 40ft High Cube containers received at Yangshan Deepwater Terminal.",
      location_name: "Yangshan Deepwater Port, China",
      occurred_at: "2026-08-16T14:30:00Z",
      source: "CARRIER_EDI",
    },
    {
      id: "evt-4",
      status: "DEPARTED_ORIGIN" as ShipmentStatus,
      event_title: "Vessel Departed Origin Gateway",
      event_description: "Vessel cleared harbor pilotage and commenced trans-Pacific transit.",
      location_name: "Shanghai Harbor (CNSHA)",
      occurred_at: "2026-08-18T09:15:00Z",
      source: "CARRIER_API",
    },
    {
      id: "evt-5",
      status: "IN_TRANSIT" as ShipmentStatus,
      event_title: "Trans-Pacific Ocean Corridor Transit",
      event_description: "Vessel operating on schedule at 19.4 knots under standard sea conditions.",
      location_name: "North Pacific Maritime Route",
      occurred_at: "2026-08-25T16:00:00Z",
      source: "CARRIER_API",
    },
  ]);

  // Form for new event
  const [newEventStatus, setNewEventStatus] = React.useState<ShipmentStatus>("ARRIVED_DESTINATION");
  const [newEventTitle, setNewEventTitle] = React.useState("Vessel Arrived at Destination Port");
  const [newLocation, setNewLocation] = React.useState("Port of Long Beach (USLGB), USA");
  const [newDescription, setNewDescription] = React.useState("Vessel safely berthed at Pier G terminal. Unloading underway.");

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvt = {
      id: `evt-${Date.now()}`,
      status: newEventStatus,
      event_title: newEventTitle,
      event_description: newDescription,
      location_name: newLocation,
      occurred_at: new Date().toISOString(),
      source: "MANUAL",
    };
    setEvents([...events, newEvt]);
    setCurrentStatus(newEventStatus);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/shipments">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-white font-mono">{id}</h1>
              <ShipmentStatusBadge status={currentStatus} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Customer: <strong className="text-slate-200">Apex Global Imports LLC</strong> • Carrier: <strong className="text-slate-200">Maersk Line</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/track?number=${id}`} target="_blank">
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <span>View Public Tracking</span>
            </Button>
          </Link>
        </div>
      </div>

      <RouteDisplay
        originName="Shanghai Port CY"
        originPort="CNSHA"
        originCountry="CN"
        destinationName="Port of Long Beach Terminal"
        destinationPort="USLGB"
        destinationCountry="US"
        mode="OCEAN_FCL"
      />

      {/* Staff Event Dispatch & Milestone Control */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Milestone Progress & Verified Event Log</CardTitle>
          </CardHeader>
          <CardContent>
            <TrackingTimeline
              currentStatus={currentStatus}
              events={events}
            />
          </CardContent>
        </Card>

        {/* Dispatch New Milestone Form */}
        <div className="space-y-6">
          <Card className="border-sky-500/30 bg-slate-900/90 shadow-xl">
            <form onSubmit={handleAddEvent}>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 text-cyan-300">
                  <Plus className="h-4 w-4 text-cyan-400" />
                  Dispatch Milestone Event
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div>
                  <Label required>Target Milestone</Label>
                  <Select
                    value={newEventStatus}
                    onChange={(e) => {
                      const st = e.target.value as ShipmentStatus;
                      setNewEventStatus(st);
                      const m = SHIPMENT_MILESTONES.find((item) => item.status === st);
                      if (m) setNewEventTitle(m.label);
                    }}
                    className="mt-1"
                  >
                    {SHIPMENT_MILESTONES.map((m) => (
                      <option key={m.status} value={m.status} className="bg-slate-900">
                        Step {m.step}: {m.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label required>Event Title</Label>
                  <Input
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label required>Current Location</Label>
                  <Input
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Operational Description / Notes</Label>
                  <Input
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <Button type="submit" variant="glow" size="sm" className="w-full mt-2 text-xs font-semibold gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Record Event to Chain of Custody</span>
                </Button>
              </CardContent>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Cargo Specification</CardTitle>
            </CardHeader>
            <CardContent>
              <CargoCard
                item={{
                  package_type: "Commercial Packages",
                  quantity: 840,
                  gross_weight_kg: 18450,
                  total_volume_cbm: 68.5,
                  commodity_description: "Commercial Solar Power Inverters & Inverter Sub-assemblies",
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
