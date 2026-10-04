"use client";

import Link from "next/link";
import { Search, Bell, Plus, Menu, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/layout/user-nav";
import { UserRole } from "@/types/database";

export function Header({
  onMenuToggle,
  portalType = "portal",
  userRole = "CUSTOMER_ADMIN",
  userName = "Freight Shipper",
  userEmail = "shipper@apeximports.com",
  companyName = "Apex Global Imports",
}: {
  onMenuToggle?: () => void;
  portalType?: "portal" | "admin";
  userRole?: UserRole;
  userName?: string;
  userEmail?: string;
  companyName?: string;
}) {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 md:px-6 backdrop-blur-xl">
      {/* Left: Mobile trigger & Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 w-64 md:w-80">
          <Search className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder={
              portalType === "admin"
                ? "Search shipments, B/L, companies, invoices..."
                : "Search your shipments, quotes, B/L..."
            }
            className="w-full bg-transparent text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
          />
          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Quick actions, notifications, user avatar */}
      <div className="flex items-center gap-3">
        {portalType === "portal" ? (
          <Link href="/request-quote">
            <Button size="sm" variant="glow" className="gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              <span>Request Quote</span>
            </Button>
          </Link>
        ) : (
          <Link href="/track">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <Compass className="h-3.5 w-3.5 text-cyan-400" />
              <span>Public Track</span>
            </Button>
          </Link>
        )}

        <Link
          href={portalType === "admin" ? "/admin/notifications" : "/portal/notifications"}
          className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-400 ring-2 ring-slate-950 animate-pulse" />
        </Link>

        <div className="h-6 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

        <UserNav
          name={userName}
          email={userEmail}
          role={userRole}
          companyName={companyName}
        />
      </div>
    </header>
  );
}
