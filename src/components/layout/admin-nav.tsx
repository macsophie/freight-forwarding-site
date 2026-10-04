"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gauge,
  Building2,
  FileText,
  CalendarRange,
  Ship,
  Files,
  FileCheck2,
  DollarSign,
  CreditCard,
  Users,
  BellRing,
  Sliders,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_NAV_ITEMS = [
  { label: "Control Tower", href: "/admin/dashboard", icon: Gauge },
  { label: "Customers", href: "/admin/customers", icon: Building2 },
  { label: "Quotes Queue", href: "/admin/quotes", icon: FileText },
  { label: "Bookings Queue", href: "/admin/bookings", icon: CalendarRange },
  { label: "Shipments Console", href: "/admin/shipments", icon: Ship },
  { label: "Customs & Holds", href: "/admin/customs", icon: FileCheck2 },
  { label: "Document Vault", href: "/admin/documents", icon: Files },
  { label: "Invoices & AR", href: "/admin/invoices", icon: DollarSign },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Users & RBAC", href: "/admin/users", icon: Users },
  { label: "Notifications", href: "/admin/notifications", icon: BellRing },
  { label: "System Settings", href: "/admin/settings", icon: Sliders },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: ShieldCheck },
];

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-1 px-3 py-3">
      {ADMIN_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150",
              isActive
                ? "bg-sky-600/20 text-sky-400 border border-sky-500/30 font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0",
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
