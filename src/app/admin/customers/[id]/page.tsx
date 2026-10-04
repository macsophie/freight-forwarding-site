"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Building2, ShieldCheck, Mail, Phone, Globe, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || "COMP-001";

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/customers">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-white">Apex Global Imports LLC</h1>
            <Badge variant="success">ACTIVE VERIFIED</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Account ID: {id} • Member since Jan 15, 2026</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4 text-cyan-400" />
              Corporate Information & KYC
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block">Legal Entity Name:</span>
                <span className="font-bold text-white">Apex Global Imports LLC</span>
              </div>
              <div>
                <span className="text-slate-400 block">Corporate Email:</span>
                <span className="text-slate-200 font-mono">operations@apeximports.com</span>
              </div>
              <div>
                <span className="text-slate-400 block">Tax ID / EIN:</span>
                <span className="text-slate-200 font-mono">XX-XXXXXXX</span>
              </div>
              <div>
                <span className="text-slate-400 block">EORI Number (EU):</span>
                <span className="text-slate-200 font-mono">GB123456789000</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block">Underwritten Credit Facility:</span>
                <span className="text-lg font-bold font-mono text-emerald-400">{formatCurrency(50000)}</span>
              </div>
              <Button variant="outline" size="sm" className="text-xs">
                Adjust Credit Limit
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Account Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <Link href="/admin/shipments" className="block">
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                View 4 Active Shipments
              </Button>
            </Link>
            <Link href="/admin/quotes" className="block">
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                View Customer Quotes
              </Button>
            </Link>
            <Link href="/admin/invoices" className="block">
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                View Ledger & Billing
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
