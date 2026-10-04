"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Ship, Calendar, Clock, FileCheck, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookingStatusBadge } from "@/components/domain/status-badge";
import { formatDate } from "@/lib/utils";

export default function CustomerBookingDetailPage() {
  const params = useParams();
  const bookingId = (params?.id as string) || "BKG-2026-0819";

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/portal/bookings">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-white font-mono">{bookingId}</h1>
            <BookingStatusBadge status="CONFIRMED" />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Confirmed with Maersk Line (MSK) • Reference: <span className="font-mono text-cyan-300">MSK-BK-91823</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Carrier & Cut-Off Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Carrier:</span>
              <span className="font-bold text-white">Maersk Line</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Vessel & Voyage:</span>
              <span className="text-slate-200">Maersk Mc-Kinney Moller (Voy 2608W)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cargo Terminal Cut-Off:</span>
              <span className="font-mono text-amber-400 font-bold">Aug 16, 2026 17:00 CST</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">VGM & Document Cut-Off:</span>
              <span className="font-mono text-slate-200">Aug 15, 2026 12:00 CST</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Estimated Departure (ETD):</span>
              <span className="font-mono text-cyan-300">Aug 18, 2026</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Allocated Equipment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-cyan-300">
                <Layers className="h-4 w-4 text-sky-400" />
                <span>2x 40ft High Cube (40HC)</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Released
              </span>
            </div>
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 text-slate-400 text-xs">
              Empty container pick-up authorized at Yangshan Container Depot Gate 3.
            </div>
            <div className="pt-2">
              <Link href="/portal/shipments/FWD-89210-US">
                <Button variant="glow" size="sm" className="w-full text-xs">
                  Track Live Shipment &rarr;
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
