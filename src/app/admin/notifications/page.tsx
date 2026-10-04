"use client";

import * as React from "react";
import { BellRing, Send, Radio, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

export default function AdminNotificationsPage() {
  const [broadcastTitle, setBroadcastTitle] = React.useState("");
  const [broadcastMessage, setBroadcastMessage] = React.useState("");
  const [targetAudience, setTargetAudience] = React.useState("ALL_CUSTOMERS");
  const [dispatched, setDispatched] = React.useState(false);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;
    setDispatched(true);
    setTimeout(() => {
      setDispatched(false);
      setBroadcastTitle("");
      setBroadcastMessage("");
    }, 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white">System Broadcasts & Alerts</h1>
        <p className="text-xs text-slate-400 mt-1">
          Dispatch operational corridor alerts, port strike notices, weather advisories, and system notifications.
        </p>
      </div>

      <Card>
        <form onSubmit={handleBroadcast}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Radio className="h-4 w-4 text-cyan-400" />
              Dispatch Global Operations Advisory
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div>
              <Label required>Target Audience</Label>
              <Select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="mt-1"
              >
                <option value="ALL_CUSTOMERS">All Corporate Shippers</option>
                <option value="OCEAN_SHIPPERS">Active Ocean Freight Shippers</option>
                <option value="AIR_SHIPPERS">Active Air Cargo Shippers</option>
                <option value="INTERNAL_STAFF">ForwardFlow Internal Operations Staff Only</option>
              </Select>
            </div>

            <div>
              <Label required>Advisory Title</Label>
              <Input
                placeholder="e.g. Trans-Pacific Weather Delay Advisory — Typhoon Warning"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label required>Notification Body</Label>
              <Input
                placeholder="Detailed logistics explanation and estimated impact on vessel schedules..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="mt-1"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="justify-between border-t border-slate-800">
            {dispatched && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="h-4 w-4" /> Advisory broadcast dispatched to all channels.
              </span>
            )}
            <Button type="submit" variant="glow" size="sm" className="ml-auto text-xs gap-1.5 font-semibold">
              <Send className="h-3.5 w-3.5" />
              <span>Broadcast Advisory</span>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
