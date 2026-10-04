"use client";

import * as React from "react";
import { Building, MapPin, Users, Shield, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function CustomerSettingsPage() {
  const [saved, setSaved] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Company & Account Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage corporate credentials, customs compliance numbers, facility addresses, and team roles.
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Company Profile</TabsTrigger>
          <TabsTrigger value="addresses">Address Book</TabsTrigger>
          <TabsTrigger value="team">Team Members</TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile */}
        <TabsContent value="profile">
          <Card>
            <form onSubmit={handleSave}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building className="h-4 w-4 text-cyan-400" />
                  Corporate Registration & Tax Identification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label required>Company Legal Name</Label>
                    <Input defaultValue="Apex Global Imports LLC" />
                  </div>
                  <div className="space-y-1.5">
                    <Label required>Corporate Email</Label>
                    <Input defaultValue="operations@apeximports.com" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>Tax ID / EIN Number</Label>
                    <Input defaultValue="XX-XXXXXXX" className="font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>EORI Number (EU)</Label>
                    <Input defaultValue="GB123456789000" className="font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Base Currency</Label>
                    <Input defaultValue="USD" disabled className="font-mono" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Corporate Phone</Label>
                    <Input defaultValue="+1 (555) 349-1029" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Website</Label>
                    <Input defaultValue="https://apeximports.example.com" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t border-slate-800">
                {saved && (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="h-4 w-4" /> Changes saved successfully!
                  </span>
                )}
                <Button type="submit" variant="glow" size="sm" className="ml-auto text-xs">
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Tab 2: Addresses */}
        <TabsContent value="addresses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-sky-400" />
                Saved Facilities & Delivery Destinations
              </CardTitle>
              <Button size="sm" variant="outline" className="text-xs gap-1">
                <Plus className="h-3.5 w-3.5" /> Add Facility
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  label: "West Coast Distribution Hub",
                  address: "2400 Harbor Blvd, Long Beach, CA 90802, USA",
                  contact: "Carlos Mendez (+1 555-491-2091)",
                  isPrimary: true,
                },
                {
                  label: "Midwest Warehouse & Assembly",
                  address: "7100 Logistics Pkwy, Elk Grove Village, IL 60007, USA",
                  contact: "Sara Jenkins (+1 555-882-1099)",
                  isPrimary: false,
                },
              ].map((addr, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{addr.label}</h4>
                      {addr.isPrimary && (
                        <Badge variant="default" className="text-[10px]">Default Consignee</Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{addr.address}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">Contact: {addr.contact}</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-7 text-xs self-start sm:self-center">
                    Edit
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Team */}
        <TabsContent value="team">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-400" />
                Team Members & Access Roles
              </CardTitle>
              <Button size="sm" variant="outline" className="text-xs gap-1">
                <Plus className="h-3.5 w-3.5" /> Invite User
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  name: "Alex Rivera",
                  email: "alex@apeximports.com",
                  role: "CUSTOMER_ADMIN",
                  status: "ACTIVE",
                },
                {
                  name: "Elena Rostova",
                  email: "elena@apeximports.com",
                  role: "CUSTOMER_USER",
                  status: "ACTIVE",
                },
              ].map((member, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-between"
                >
                  <div>
                    <h5 className="font-bold text-xs text-white">{member.name}</h5>
                    <p className="text-[11px] text-slate-400 font-mono">{member.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="info" className="text-[10px]">
                      {member.role.replace("_", " ")}
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-400">
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
