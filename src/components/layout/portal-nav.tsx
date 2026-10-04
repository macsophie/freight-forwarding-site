"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileSpreadsheet,
  CalendarCheck,
  Ship,
  FolderLock,
  FileCheck2,
  Receipt,
  Bell,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/portal/dashboard", icon: LayoutDashboard },
  { label: "Quotes", href: "/portal/quotes", icon: FileSpreadsheet },
  { label: "Bookings", href: "/portal/bookings", icon: CalendarCheck },
  { label: "Shipments", href: "/portal/shipments", icon: Ship },
  { label: "Document Vault", href: "/portal/documents", icon: FolderLock },
  { label: "Customs & Clearance", href: "/portal/customs", icon: FileCheck2 },
  { label: "Invoices & Billing", href: "/portal/invoices", icon: Receipt },
  { label: "Notifications", href: "/portal/notifications", icon: Bell },
  { label: "Company Settings", href: "/portal/settings", icon: Settings },
];

export function PortalNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-1.5 px-3 py-4">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/portal/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200",
              isActive
                ? "bg-gradient-to-r from-sky-500/20 to-cyan-500/10 text-sky-400 border border-sky-500/30 shadow-sm shadow-sky-500/10 font-bold"
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-850 hover:bg-slate-800/60"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                isActive ? "text-cyan-400" : "text-slate-400"
              )}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
