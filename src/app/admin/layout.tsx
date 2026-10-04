"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Admin Operations Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        portalType="admin"
        userRole="OPERATIONS_MANAGER"
        companyName="ForwardFlow Global Logistics HQ"
      />

      {/* Main Operations Container */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header
          onMenuToggle={() => setSidebarOpen(true)}
          portalType="admin"
          userRole="OPERATIONS_MANAGER"
          userName="Capt. Marcus Vance"
          userEmail="marcus.vance@forwardflow.com"
          companyName="Global Operations HQ"
        />

        <main className="flex-1 p-4 md:p-6 max-w-[1500px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
