"use client";

import * as React from "react";
import { Sliders, ShieldCheck, Database, KeyRound, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Platform System Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          EDI webhook endpoints, automated rate margins, carrier API credentials, and database health.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="h-4 w-4 text-cyan-400" />
              Automated Freight Quoting Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Default Margin Markup (%)</Label>
                <Input defaultValue="15.0" className="mt-1 font-mono" />
              </div>
              <div>
                <Label>Bunker Fuel Surcharge Base ($/CBM)</Label>
                <Input defaultValue="25.0" className="mt-1 font-mono" />
              </div>
              <div>
                <Label>Customs Entry Fee ($)</Label>
                <Input defaultValue="125.0" className="mt-1 font-mono" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t border-slate-800">
            <Button variant="glow" size="sm" className="text-xs">
              Save Parameters
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-400" />
              Database & Row-Level Security Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/60">
              <div>
                <span className="font-bold text-white block">PostgreSQL Row-Level Security</span>
                <span className="text-[11px] text-slate-400">14 Tables isolated via tenant policies</span>
              </div>
              <Badge variant="success">ENFORCED</Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/60">
              <div>
                <span className="font-bold text-white block">Document Storage Bucket Isolation</span>
                <span className="text-[11px] text-slate-400">Private buckets with signed URL verification</span>
              </div>
              <Badge variant="success">ACTIVE</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
