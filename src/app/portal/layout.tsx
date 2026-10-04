"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        portalType="portal"
        userRole="CUSTOMER_ADMIN"
        companyName="Apex Global Imports LLC"
      />

      {/* Main Content Shell */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header
          onMenuToggle={() => setSidebarOpen(true)}
          portalType="portal"
          userRole="CUSTOMER_ADMIN"
          userName="Alex Rivera"
          userEmail="alex@apeximports.com"
          companyName="Apex Global Imports LLC"
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
