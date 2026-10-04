"use client";

import * as React from "react";
import Link from "next/link";
import { Ship, X, Compass, Shield, ArrowUpRight } from "lucide-react";
import { PortalNav } from "@/components/layout/portal-nav";
import { AdminNav } from "@/components/layout/admin-nav";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types/database";

export function Sidebar({
  isOpen,
  onClose,
  portalType = "portal",
  userRole = "CUSTOMER_ADMIN",
  companyName = "Apex Global Imports",
}: {
  isOpen: boolean;
  onClose: () => void;
  portalType?: "portal" | "admin";
  userRole?: UserRole;
  companyName?: string;
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-2xl transition-transform duration-300 md:static md:translate-x-0",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-800">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold tracking-tight text-white group"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-emerald-400 p-[1.5px] shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
                <Ship className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold tracking-wide text-white leading-none">
                Forward<span className="text-cyan-400">Flow</span>
              </span>
              <span className="text-[10px] font-mono font-medium text-slate-400 tracking-wider uppercase mt-1">
                {portalType === "admin" ? "Ops Control Tower" : "Shipper Portal"}
              </span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Company / Scope Context Card */}
        <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-900/30">
          <div className="flex items-center justify-between">
            <div className="flex flex-col truncate">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {portalType === "admin" ? "Staff Station" : "Active Shipper"}
              </span>
              <span className="text-xs font-bold text-slate-200 truncate">
                {portalType === "admin" ? "Global Operations HQ" : companyName}
              </span>
            </div>
            <Badge
              variant={portalType === "admin" ? "info" : "default"}
              className="text-[9px] px-1.5 py-0"
            >
              {portalType === "admin" ? "STAFF" : "VERIFIED"}
            </Badge>
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {portalType === "admin" ? (
            <AdminNav onNavigate={onClose} />
          ) : (
            <PortalNav onNavigate={onClose} />
          )}
        </div>

        {/* Bottom Quick Links */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40 space-y-2">
          <Link
            href="/track"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Compass className="h-3.5 w-3.5 text-cyan-400" />
              <span>Public Tracking</span>
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" />
          </Link>

          {portalType === "portal" ? (
            <Link
              href="/admin/dashboard"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-sky-400" />
                <span>Switch to Staff Ops</span>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" />
            </Link>
          ) : (
            <Link
              href="/portal/dashboard"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Ship className="h-3.5 w-3.5 text-emerald-400" />
                <span>Switch to Customer View</span>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" />
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
