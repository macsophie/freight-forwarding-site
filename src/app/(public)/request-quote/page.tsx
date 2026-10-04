"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Ship,
  Plane,
  Truck,
  Train,
  Boxes,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calculator,
  Plus,
  Trash2,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SHIPMENT_MODES, INCOTERMS } from "@/lib/constants";
import { ShipmentMode, Incoterm } from "@/types/database";
import {
  calculateCBM,
  estimateFreightCharges,
  QuoteItemInput,
} from "@/domain/quotes";
import { formatCurrency, formatWeight, formatCBM } from "@/lib/utils";

export default function RequestQuotePage() {
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [mode, setMode] = React.useState<ShipmentMode>("OCEAN_FCL");
  const [incoterm, setIncoterm] = React.useState<Incoterm>("FOB");

  const [originName, setOriginName] = React.useState("Shanghai, China");
  const [originPort, setOriginPort] = React.useState("CNSHA");
  const [originCountry, setOriginCountry] = React.useState("CN");

  const [destinationName, setDestinationName] = React.useState("Long Beach, CA, USA");
  const [destinationPort, setDestinationPort] = React.useState("USLGB");
  const [destinationCountry, setDestinationCountry] = React.useState("US");

  const [cargoReadyDate, setCargoReadyDate] = React.useState(
    new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0]
  );
  const [specialInstructions, setSpecialInstructions] = React.useState("");

  const [items, setItems] = React.useState<QuoteItemInput[]>([
    {
      package_type: "Pallets",
      quantity: 10,
      length_cm: 120,
      width_cm: 100,
      height_cm: 160,
      gross_weight_kg: 4500,
      total_volume_cbm: 19.2,
      commodity_description: "Industrial Precision Bearings & Linear Rails",
      is_hazardous: false,
      hs_code: "8482.10",
    },
  ]);

  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [generatedQuoteNumber, setGeneratedQuoteNumber] = React.useState("");

  // Calculate totals
  const totalWeight = items.reduce((acc, item) => acc + (item.gross_weight_kg || 0), 0);
  const totalVolume = items.reduce((acc, item) => acc + (item.total_volume_cbm || 0), 0);

  // Estimate
  const estimate = React.useMemo(() => {
    return estimateFreightCharges(mode, totalWeight, totalVolume);
  }, [mode, totalWeight, totalVolume]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        package_type: "Boxes",
        quantity: 1,
        gross_weight_kg: 50,
        total_volume_cbm: 0.5,
        commodity_description: "General Commercial Merchandise",
        is_hazardous: false,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof QuoteItemInput, val: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = val;

    // Recalculate CBM if dimensions change
    if (["length_cm", "width_cm", "height_cm", "quantity"].includes(field)) {
      const it = updated[index];
      if (it.length_cm && it.width_cm && it.height_cm && it.quantity) {
        it.total_volume_cbm = Math.round(
          calculateCBM(it.length_cm, it.width_cm, it.height_cm, it.quantity) * 1000
        ) / 1000;
      }
    }

    setItems(updated);
  };

  const handleSubmitQuote = () => {
    const qNum = `QUO-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    setGeneratedQuoteNumber(qNum);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full border-emerald-500/30 bg-slate-900/90 shadow-2xl text-center p-8">
          <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Quote Request Submitted!</h2>
          <p className="text-xs text-slate-400 mt-2">
            Your quote reference has been generated and dispatched to our global routing desk.
          </p>

          <div className="my-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-cyan-300 text-lg font-bold">
            {generatedQuoteNumber}
          </div>

          <div className="text-left text-xs space-y-2 bg-slate-950/50 p-4 rounded-lg border border-slate-800/60 mb-6">
            <div className="flex justify-between">
              <span className="text-slate-400">Mode:</span>
              <span className="text-slate-200 font-semibold">{mode.replace("_", " ")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Route:</span>
              <span className="text-slate-200 font-semibold">{originPort} &rarr; {destinationPort}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Cargo:</span>
              <span className="text-slate-200 font-semibold">{formatWeight(totalWeight)} ({formatCBM(totalVolume)})</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-800 text-cyan-300 font-bold">
              <span>Indicative Estimate:</span>
              <span>{formatCurrency(estimate.totalAmount)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/portal/quotes" className="flex-1">
              <Button variant="glow" className="w-full text-xs">
                View in Customer Portal
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full text-xs">
                Return Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Already have an account?</span>
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-xs">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl flex-1">
        {/* Wizard Stepper Banner */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge variant="default" className="mb-2">Instant Quoting Engine</Badge>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Request International Freight Quote
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Get automated indicative rates and customized routing proposals within minutes.
          </p>

          {/* Stepper indicators */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {[
              { num: 1, label: "Mode & Terms" },
              { num: 2, label: "Corridor & Routing" },
              { num: 3, label: "Cargo Specifications" },
              { num: 4, label: "Review & Estimate" },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    step === s.num
                      ? "bg-sky-500 text-white ring-4 ring-sky-500/20 shadow-md"
                      : step > s.num
                      ? "bg-emerald-500 text-slate-950 font-bold"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {step > s.num ? "✓" : s.num}
                </div>
                <span className={`text-xs font-medium hidden md:inline ${step === s.num ? "text-white font-semibold" : "text-slate-500"}`}>
                  {s.label}
                </span>
                {s.num < 4 && <div className="h-[1px] w-6 bg-slate-800 hidden md:block" />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Mode & Incoterm */}
        {step === 1 && (
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Select Shipment Mode & Incoterm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label required>Freight Transport Mode</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {SHIPMENT_MODES.map((m) => {
                    const isSelected = mode === m.value;
                    const Icon =
                      m.value === "AIR"
                        ? Plane
                        : m.value === "ROAD"
                        ? Truck
                        : m.value === "RAIL"
                        ? Train
                        : m.value === "OCEAN_LCL"
                        ? Boxes
                        : Ship;

                    return (
                      <div
                        key={m.value}
                        onClick={() => setMode(m.value)}
                        className={`cursor-pointer p-4 rounded-xl border transition-all ${
                          isSelected
                            ? "border-sky-500 bg-sky-500/10 shadow-lg shadow-sky-500/10 text-white"
                            : "border-slate-800 bg-slate-900/50 hover:border-slate-700 text-slate-400"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <Icon className={`h-5 w-5 ${isSelected ? "text-cyan-400" : "text-slate-500"}`} />
                          <span className="font-bold text-sm text-slate-100">{m.label}</span>
                        </div>
                        <p className="text-[11px] leading-tight text-slate-400">{m.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label required>Incoterms 2020 Rules</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                  {INCOTERMS.map((inc) => (
                    <button
                      type="button"
                      key={inc.value}
                      onClick={() => setIncoterm(inc.value)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        incoterm === inc.value
                          ? "border-cyan-500 bg-cyan-500/10 text-cyan-300 font-bold"
                          : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <span className="font-mono text-sm block font-bold text-slate-100">{inc.value}</span>
                      <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">{inc.short}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button variant="glow" onClick={() => setStep(2)} className="gap-2">
                <span>Continue to Routing</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 2: Origin & Destination */}
        {step === 2 && (
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Trade Corridor & Readiness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Origin */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
                  <span className="text-xs font-bold uppercase text-sky-400">Origin Gateway</span>
                  <div>
                    <Label required>Origin City / Facility</Label>
                    <Input
                      value={originName}
                      onChange={(e) => setOriginName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label required>Port Code</Label>
                      <Input
                        value={originPort}
                        onChange={(e) => setOriginPort(e.target.value)}
                        className="mt-1 font-mono uppercase"
                      />
                    </div>
                    <div>
                      <Label required>Country</Label>
                      <Input
                        value={originCountry}
                        onChange={(e) => setOriginCountry(e.target.value)}
                        className="mt-1 uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* Destination */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
                  <span className="text-xs font-bold uppercase text-emerald-400">Destination Gateway</span>
                  <div>
                    <Label required>Destination City / Facility</Label>
                    <Input
                      value={destinationName}
                      onChange={(e) => setDestinationName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label required>Port Code</Label>
                      <Input
                        value={destinationPort}
                        onChange={(e) => setDestinationPort(e.target.value)}
                        className="mt-1 font-mono uppercase"
                      />
                    </div>
                    <div>
                      <Label required>Country</Label>
                      <Input
                        value={destinationCountry}
                        onChange={(e) => setDestinationCountry(e.target.value)}
                        className="mt-1 uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label required>Estimated Cargo Ready Date</Label>
                <Input
                  type="date"
                  value={cargoReadyDate}
                  onChange={(e) => setCargoReadyDate(e.target.value)}
                  className="mt-1 max-w-sm"
                />
              </div>

              <div>
                <Label>Special Handling / Transport Notes</Label>
                <Input
                  placeholder="e.g. Liftgate required, bonded warehouse storage, customs duty prepayment"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="mt-1"
                />
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button variant="glow" onClick={() => setStep(3)} className="gap-2">
                <span>Continue to Cargo Details</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 3: Cargo Details */}
        {step === 3 && (
          <Card className="max-w-3xl mx-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Cargo Specifications & Items</CardTitle>
              <Button size="sm" variant="outline" onClick={handleAddItem} className="gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" /> Add Package
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400">Cargo Line #{idx + 1}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <Label required>Package Type</Label>
                      <Select
                        value={item.package_type}
                        onChange={(e) => handleItemChange(idx, "package_type", e.target.value)}
                        className="mt-1"
                      >
                        <option value="Pallets">Pallets (Standard Euro/US)</option>
                        <option value="Boxes">Cartons / Boxes</option>
                        <option value="Crates">Wooden Crates</option>
                        <option value="Drums">Steel / Plastic Drums</option>
                        <option value="20ft Container">20ft Dry Container</option>
                        <option value="40ft HC Container">40ft High Cube Container</option>
                      </Select>
                    </div>

                    <div>
                      <Label required>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", parseInt(e.target.value) || 1)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label required>Gross Weight (KG)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.gross_weight_kg}
                        onChange={(e) => handleItemChange(idx, "gross_weight_kg", parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <Label>Dimensions L x W x H (CM)</Label>
                      <div className="grid grid-cols-3 gap-1 mt-1">
                        <Input
                          placeholder="L"
                          type="number"
                          value={item.length_cm || ""}
                          onChange={(e) => handleItemChange(idx, "length_cm", parseFloat(e.target.value) || 0)}
                        />
                        <Input
                          placeholder="W"
                          type="number"
                          value={item.width_cm || ""}
                          onChange={(e) => handleItemChange(idx, "width_cm", parseFloat(e.target.value) || 0)}
                        />
                        <Input
                          placeholder="H"
                          type="number"
                          value={item.height_cm || ""}
                          onChange={(e) => handleItemChange(idx, "height_cm", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label required>Total Volume (CBM)</Label>
                      <Input
                        type="number"
                        step="0.001"
                        value={item.total_volume_cbm}
                        onChange={(e) => handleItemChange(idx, "total_volume_cbm", parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>HS Tariff Code</Label>
                      <Input
                        placeholder="e.g. 8482.10"
                        value={item.hs_code || ""}
                        onChange={(e) => handleItemChange(idx, "hs_code", e.target.value)}
                        className="mt-1 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <Label required>Commodity Description</Label>
                    <Input
                      placeholder="Detailed cargo commodity description for customs classification"
                      value={item.commodity_description}
                      onChange={(e) => handleItemChange(idx, "commodity_description", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button variant="glow" onClick={() => setStep(4)} className="gap-2">
                <span>Review Estimate</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 4: Review & Live Estimate */}
        {step === 4 && (
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Review Quote & Estimated Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Route banner */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Trade Corridor</span>
                  <span className="text-white font-bold text-sm">{originName} ({originPort}) &rarr; {destinationName} ({destinationPort})</span>
                </div>
                <Badge variant="info">{mode.replace("_", " ")}</Badge>
              </div>

              {/* Estimate Calculation Breakdown */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-900/80 p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-cyan-400" />
                    <span className="text-base font-bold text-white">Indicative Rate Calculation</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Est. Transit: ~{estimate.estimatedTransitDays} Days</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Base Freight Carriage ({mode}):</span>
                    <span className="font-mono font-semibold">{formatCurrency(estimate.freightCharge)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Origin Terminal Handling & Port Security:</span>
                    <span className="font-mono">{formatCurrency(estimate.originCharges)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Destination Port Discharge & Wharfage:</span>
                    <span className="font-mono">{formatCurrency(estimate.destinationCharges)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Customs Entry Brokerage & Regulatory Filing:</span>
                    <span className="font-mono">{formatCurrency(estimate.customsCharges)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Marine Cargo Insurance (All-Risk Coverage):</span>
                    <span className="font-mono">{formatCurrency(estimate.insuranceCharge)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-base font-extrabold text-white">
                  <span>Total Estimated Freight:</span>
                  <span className="text-xl font-mono text-cyan-300">{formatCurrency(estimate.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button variant="glow" onClick={handleSubmitQuote} className="gap-2">
                <span>Submit & Finalize Quote Request</span>
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}
      </main>
    </div>
  );
}
