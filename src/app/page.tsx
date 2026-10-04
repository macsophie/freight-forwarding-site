"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Ship,
  Plane,
  Truck,
  Train,
  ArrowRight,
  ShieldCheck,
  Globe2,
  Clock,
  Compass,
  FileCheck2,
  Receipt,
  Boxes,
  Search,
  LayoutDashboard,
  Gauge,
  FolderLock,
  Building2,
  Sliders,
  DollarSign,
  Shield,
  Layers,
  ChevronRight,
  Users,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SHIPMENT_MODES } from "@/lib/constants";

export default function HomePage() {
  const router = useRouter();
  const [quickTrackNumber, setQuickTrackNumber] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("all");

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTrackNumber.trim()) {
      router.push(`/track?number=${encodeURIComponent(quickTrackNumber.trim())}`);
    } else {
      router.push("/track");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 relative selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top Universal Platform Navigation Bar */}
      <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-cyan-950 border-b border-sky-500/20 px-4 py-2 text-xs">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200">Unified Freight Platform Active:</span>
            <span className="text-cyan-300 font-mono hidden sm:inline">Next.js 15 App Router + Supabase RLS</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/portal/dashboard"
              className="text-emerald-400 font-bold hover:underline flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20"
            >
              <LayoutDashboard className="h-3 w-3" />
              <span>Customer Portal</span>
            </Link>
            <Link
              href="/admin/dashboard"
              className="text-sky-400 font-bold hover:underline flex items-center gap-1 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20"
            >
              <Gauge className="h-3 w-3" />
              <span>Staff Control Tower</span>
            </Link>
            <Link
              href="/track"
              className="text-cyan-400 hover:underline flex items-center gap-1 hidden md:flex"
            >
              <Compass className="h-3 w-3" />
              <span>Milestone Tracking</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-500 via-cyan-400 to-emerald-400 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
                <Ship className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white">
                Forward<span className="text-cyan-400">Flow</span>
              </span>
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                Global Freight Platform
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#hub" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>All-In-One Hub</span>
            </a>
            <Link href="/portal/dashboard" className="hover:text-white transition-colors">
              Customer Portal
            </Link>
            <Link href="/admin/dashboard" className="hover:text-white transition-colors">
              Staff Ops Console
            </Link>
            <Link href="/track" className="hover:text-cyan-400 transition-colors">
              Live Tracking
            </Link>
            <Link href="/portal/documents" className="hover:text-white transition-colors">
              Document Vault
            </Link>
            <Link href="/admin/audit-logs" className="hover:text-white transition-colors">
              Audit Logs
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-xs">
                Sign In
              </Button>
            </Link>
            <Link href="/request-quote">
              <Button variant="glow" size="sm" className="text-xs font-semibold gap-1.5">
                <span>Instant Quote</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with All-in-One Quick Launcher */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-gradient-to-tr from-sky-600/20 via-cyan-500/20 to-emerald-500/10 blur-[130px] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs font-semibold mb-6 shadow-lg shadow-sky-500/10">
            <Globe2 className="h-3.5 w-3.5 text-cyan-400" />
            <span>Digital Freight Orchestration & Milestone Tracking Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-5">
            International Freight Forwarding <br />
            <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              All in One Integrated Platform
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            Instant quoting, multi-carrier bookings, live milestone tracking, digital customs clearance, corporate billing, and immutable compliance auditing.
          </p>

          {/* Quick Track Search Box */}
          <div className="max-w-xl mx-auto bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl shadow-2xl backdrop-blur-xl mb-8">
            <form onSubmit={handleQuickTrack} className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Input
                  icon={<Search className="h-4 w-4 text-cyan-400" />}
                  placeholder="Enter Tracking #, Container # or B/L (e.g. FWD-89210-US)"
                  value={quickTrackNumber}
                  onChange={(e) => setQuickTrackNumber(e.target.value)}
                  className="h-11 text-sm bg-slate-950/70 border-slate-700/60"
                />
              </div>
              <Button type="submit" variant="glow" size="default" className="h-11 px-6 gap-2">
                <span>Track Cargo</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
            <div className="flex items-center justify-center gap-4 mt-2.5 text-[11px] text-slate-400 font-mono">
              <span>Demo Shipments: <strong className="text-sky-300 cursor-pointer hover:underline" onClick={() => setQuickTrackNumber("FWD-89210-US")}>FWD-89210-US (Ocean FCL)</strong></span>
              <span>•</span>
              <span><strong className="text-cyan-300 cursor-pointer hover:underline" onClick={() => setQuickTrackNumber("FWD-44102-EU")}>FWD-44102-EU (Air Cargo)</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* ALL-IN-ONE PLATFORM NAVIGATION HUB */}
      <section id="hub" className="py-16 border-t border-slate-800/80 bg-slate-950 scroll-mt-24">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="info" className="mb-2 uppercase text-[10px] font-bold">
              Direct System Navigation
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Launch Any Platform Feature
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              Click any module below to immediately jump into live portal views, operational queues, and tracking dashboards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Customer Shipper Portal */}
            <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/80 p-6 flex flex-col justify-between shadow-xl shadow-emerald-500/5 hover:border-emerald-500/60 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <LayoutDashboard className="h-5 w-5" />
                  </div>
                  <Badge variant="success" className="text-[10px]">CUSTOMER ROLE</Badge>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Customer Shipper Portal
                </h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Self-service dashboard for corporate importers & exporters to manage consignments, bills of lading, and payments.
                </p>

                <div className="space-y-2 border-t border-slate-800 pt-4 text-xs">
                  <Link
                    href="/portal/dashboard"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    <span>Shipper Overview Dashboard</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                  </Link>
                  <Link
                    href="/portal/shipments"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    <span>In-Transit Shipments (4 Active)</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                  </Link>
                  <Link
                    href="/portal/quotes"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    <span>Freight Quotes & Proposals</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                  </Link>
                  <Link
                    href="/portal/documents"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    <span>Digital B/L & Customs Vault</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                  </Link>
                  <Link
                    href="/portal/invoices"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    <span>Invoices & Online Settlement</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                  </Link>
                </div>
              </div>

              <Link href="/portal/dashboard" className="mt-6">
                <Button variant="glow" size="sm" className="w-full text-xs font-semibold gap-1.5">
                  <span>Enter Shipper Portal</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            {/* 2. Staff Operations Control Tower */}
            <div className="rounded-2xl border border-sky-500/30 bg-slate-900/80 p-6 flex flex-col justify-between shadow-xl shadow-sky-500/5 hover:border-sky-500/60 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                    <Gauge className="h-5 w-5" />
                  </div>
                  <Badge variant="info" className="text-[10px]">STAFF OPS ROLE</Badge>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Staff Operations Tower
                </h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  HQ command center for operations managers, freight agents, and finance officers to dispatch and manage cargo.
                </p>

                <div className="space-y-2 border-t border-slate-800 pt-4 text-xs">
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    <span>Control Tower & Exception Alerts</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                  </Link>
                  <Link
                    href="/admin/shipments/FWD-89210-US"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-cyan-300 font-semibold transition-colors"
                  >
                    <span>Shipment Console & Milestone Dispatcher</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                  </Link>
                  <Link
                    href="/admin/quotes"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    <span>Rate Card & Quoting Desk</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                  </Link>
                  <Link
                    href="/admin/customers"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    <span>Customer & Shipper Directory</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                  </Link>
                  <Link
                    href="/admin/audit-logs"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    <span>Compliance & Audit Trail</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                  </Link>
                </div>
              </div>

              <Link href="/admin/dashboard" className="mt-6">
                <Button variant="default" size="sm" className="w-full text-xs font-semibold gap-1.5 bg-sky-600 hover:bg-sky-500">
                  <span>Enter Operations Tower</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            {/* 3. Public Cargo Services */}
            <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-6 flex flex-col justify-between shadow-xl shadow-cyan-500/5 hover:border-cyan-500/60 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Compass className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px]">PUBLIC ACCESS</Badge>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Public Cargo Services
                </h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Open-access global container tracking by tracking number and interactive instant freight quoting wizard.
                </p>

                <div className="space-y-2 border-t border-slate-800 pt-4 text-xs">
                  <Link
                    href="/track?number=FWD-89210-US"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    <span>Live Milestone Tracker (Demo: FWD-89210-US)</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                  </Link>
                  <Link
                    href="/track?number=FWD-44102-EU"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    <span>Air Cargo Tracker (Demo: FWD-44102-EU)</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                  </Link>
                  <Link
                    href="/request-quote"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    <span>Multi-Step Freight Rate Calculator</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                  </Link>
                  <Link
                    href="/auth/login"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    <span>Shipper & Staff Sign In</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                  </Link>
                  <Link
                    href="/auth/register"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    <span>Company Account Registration</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                  </Link>
                </div>
              </div>

              <Link href="/request-quote" className="mt-6">
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold gap-1.5">
                  <span>Start Quote Request</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Multimodal Freight Modes */}
      <section className="py-20 border-t border-slate-800/80 bg-slate-900/40">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Multimodal Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Global Freight Corridors
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {SHIPMENT_MODES.map((mode) => {
              const Icon =
                mode.value === "AIR"
                  ? Plane
                  : mode.value === "ROAD"
                  ? Truck
                  : mode.value === "RAIL"
                  ? Train
                  : mode.value === "OCEAN_LCL"
                  ? Boxes
                  : Ship;

              return (
                <div
                  key={mode.value}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 hover:border-sky-500/40 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    {mode.label}
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {mode.description}
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-800/80">
                    <Link
                      href={`/request-quote?mode=${mode.value}`}
                      className="text-[11px] font-semibold text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <span>Get Instant Rate</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Persistent Floating Quick-Access Dock */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-sky-500/40 shadow-2xl rounded-2xl p-2 flex items-center gap-2 backdrop-blur-xl max-w-full overflow-x-auto">
        <Link href="/">
          <Button variant="ghost" size="sm" className="h-8 text-xs px-2.5 text-slate-300">
            Home
          </Button>
        </Link>
        <div className="h-4 w-[1px] bg-slate-700" />
        <Link href="/portal/dashboard">
          <Button variant="glow" size="sm" className="h-8 text-xs px-3 gap-1.5 font-bold">
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Customer Portal</span>
          </Button>
        </Link>
        <Link href="/admin/dashboard">
          <Button variant="outline" size="sm" className="h-8 text-xs px-3 gap-1.5 border-sky-500/30 text-sky-300 font-bold hover:bg-sky-950/40">
            <Gauge className="h-3.5 w-3.5" />
            <span>Staff Admin</span>
          </Button>
        </Link>
        <Link href="/track?number=FWD-89210-US">
          <Button variant="outline" size="sm" className="h-8 text-xs px-2.5 text-cyan-300 border-cyan-500/30">
            <Compass className="h-3.5 w-3.5 mr-1" />
            <span>Live Tracker</span>
          </Button>
        </Link>
        <Link href="/request-quote">
          <Button variant="outline" size="sm" className="h-8 text-xs px-2.5 text-emerald-300 border-emerald-500/30">
            <span>Instant Quote</span>
          </Button>
        </Link>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-8 text-xs text-slate-500 pb-20">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Ship className="h-4 w-4 text-cyan-400" />
            <span className="font-bold text-slate-300">ForwardFlow Logistics Platform</span>
            <span>• © 2026</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/portal/dashboard" className="hover:text-white">Customer Portal</Link>
            <Link href="/admin/dashboard" className="hover:text-white">Staff Admin</Link>
            <Link href="/track" className="hover:text-white">Tracking</Link>
            <Link href="/request-quote" className="hover:text-white">Instant Quote</Link>
            <Link href="/admin/audit-logs" className="hover:text-white">Audit Logs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
