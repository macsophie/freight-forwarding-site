"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Calculator, CheckCircle2, Shield, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { QuoteStatusBadge } from "@/components/domain/status-badge";
import { RouteDisplay } from "@/components/domain/address-display";
import { CargoCard } from "@/components/domain/cargo-card";
import { formatCurrency } from "@/lib/utils";

export default function AdminQuoteProcessPage() {
  const params = useParams();
  const quoteNumber = (params?.id as string) || "QUO-2026-7712";

  const [freightBase, setFreightBase] = React.useState(1200);
  const [originThc, setOriginThc] = React.useState(250);
  const [destinationThc, setDestinationThc] = React.useState(300);
  const [customsFee, setCustomsFee] = React.useState(100);
  const [issued, setIssued] = React.useState(false);

  const total = freightBase + originThc + destinationThc + customsFee;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/quotes">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-white font-mono">{quoteNumber}</h1>
              <QuoteStatusBadge status={issued ? "ISSUED" : "REVIEWING"} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Customer: <strong className="text-slate-200">Helios Energy Systems</strong>
            </p>
          </div>
        </div>

        {!issued && (
          <Button
            variant="glow"
            size="sm"
            className="text-xs font-semibold gap-1.5"
            onClick={() => setIssued(true)}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Issue Official Quote to Customer</span>
          </Button>
        )}
      </div>

      <RouteDisplay
        originName="Shenzhen Yantian CY"
        originPort="CNSZX"
        originCountry="CN"
        destinationName="Rotterdam Gateway Terminal"
        destinationPort="NLRTM"
        destinationCountry="NL"
        mode="OCEAN_LCL"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pricing Editor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Calculator className="h-4 w-4 text-cyan-400" />
              Staff Rate Calculation & Margin Builder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <Label>Base Freight Carriage ($)</Label>
              <Input
                type="number"
                value={freightBase}
                onChange={(e) => setFreightBase(parseFloat(e.target.value) || 0)}
                className="mt-1 font-mono"
              />
            </div>
            <div>
              <Label>Origin THC & Wharfage ($)</Label>
              <Input
                type="number"
                value={originThc}
                onChange={(e) => setOriginThc(parseFloat(e.target.value) || 0)}
                className="mt-1 font-mono"
              />
            </div>
            <div>
              <Label>Destination Discharge & Security ($)</Label>
              <Input
                type="number"
                value={destinationThc}
                onChange={(e) => setDestinationThc(parseFloat(e.target.value) || 0)}
                className="mt-1 font-mono"
              />
            </div>
            <div>
              <Label>Customs Declaration & ISF ($)</Label>
              <Input
                type="number"
                value={customsFee}
                onChange={(e) => setCustomsFee(parseFloat(e.target.value) || 0)}
                className="mt-1 font-mono"
              />
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-sm">
              <span className="font-bold text-white">Calculated Quoted Rate:</span>
              <span className="text-xl font-extrabold text-cyan-300 font-mono">
                {formatCurrency(total)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Cargo Specification */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Cargo Item Details</CardTitle>
          </CardHeader>
          <CardContent>
            <CargoCard
              item={{
                package_type: "Crates",
                quantity: 4,
                gross_weight_kg: 3200,
                total_volume_cbm: 12.8,
                commodity_description: "Lithium Battery Energy Storage Cabinets (UN 3480)",
                is_hazardous: true,
                un_number: "UN3480",
                hs_code: "8507.60",
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
