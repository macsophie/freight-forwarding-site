"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Ship, FileSpreadsheet, Receipt, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: "SHIPMENT" | "QUOTE" | "INVOICE" | "DOCUMENT" | "SYSTEM";
  isRead: boolean;
  createdAt: string;
  linkUrl: string;
}

const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Shipment Departed Origin Port",
    message: "Maersk Mc-Kinney Moller (Voy 2608W) has departed Shanghai (CNSHA) en route to Long Beach (USLGB).",
    category: "SHIPMENT",
    isRead: false,
    createdAt: "2026-08-18T09:30:00Z",
    linkUrl: "/portal/shipments/FWD-89210-US",
  },
  {
    id: "notif-2",
    title: "Customs Entry 7501 Filed",
    message: "Formal import declaration filed with US CBP for shipment FWD-44102-EU at Chicago O'Hare.",
    category: "DOCUMENT",
    isRead: false,
    createdAt: "2026-08-29T10:15:00Z",
    linkUrl: "/portal/shipments/FWD-44102-EU",
  },
  {
    id: "notif-3",
    title: "Freight Quote QUO-2026-9104 Issued",
    message: "Your quote request for 1x 40ft High Cube Container is ready for review.",
    category: "QUOTE",
    isRead: true,
    createdAt: "2026-08-24T14:00:00Z",
    linkUrl: "/portal/quotes/QUO-2026-9104",
  },
  {
    id: "notif-4",
    title: "Commercial Invoice Generated",
    message: "Invoice INV-2026-0901 for $3,450.00 has been issued (Net 30 terms).",
    category: "INVOICE",
    isRead: true,
    createdAt: "2026-08-20T11:00:00Z",
    linkUrl: "/portal/invoices",
  },
];

export default function CustomerNotificationsPage() {
  const [notifications, setNotifications] = React.useState(SAMPLE_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Notifications & Alerts</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time milestone notifications, customs status changes, and commercial billing alerts.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllRead} className="text-xs">
          Mark All as Read
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.map((n) => {
            const Icon =
              n.category === "SHIPMENT"
                ? Ship
                : n.category === "QUOTE"
                ? FileSpreadsheet
                : n.category === "INVOICE"
                ? Receipt
                : FileText;

            return (
              <div
                key={n.id}
                className={`p-4 rounded-xl border transition-colors flex items-start gap-4 ${
                  !n.isRead
                    ? "border-sky-500/30 bg-slate-900/90 shadow-md"
                    : "border-slate-800 bg-slate-950/40 text-slate-400"
                }`}
              >
                <div className="h-9 w-9 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-white leading-tight">
                      {n.title}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-500 shrink-0">
                      {formatDate(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                  <div className="mt-3">
                    <Link href={n.linkUrl}>
                      <Button variant="outline" size="sm" className="h-6 text-[11px] px-2 text-cyan-300">
                        View Details &rarr;
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
