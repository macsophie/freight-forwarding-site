import { CheckCircle2, Circle, Clock, MapPin } from "lucide-react";
import { SHIPMENT_MILESTONES } from "@/lib/constants";
import { ShipmentStatus } from "@/types/database";
import { formatDate, formatDateTime, cn } from "@/lib/utils";

export interface ShipmentEventItem {
  id: string;
  status: ShipmentStatus;
  event_title: string;
  event_description?: string | null;
  location_name: string;
  occurred_at: string;
  source?: string;
}

export function TrackingTimeline({
  currentStatus,
  events = [],
}: {
  currentStatus: ShipmentStatus;
  events?: ShipmentEventItem[];
}) {
  const currentMilestoneIndex = SHIPMENT_MILESTONES.findIndex(
    (m) => m.status === currentStatus
  );

  return (
    <div className="space-y-8">
      {/* Visual Stepper */}
      <div className="relative overflow-x-auto pb-4 pt-2">
        <div className="min-w-[760px] flex items-center justify-between relative px-6">
          {/* Progress Connecting Line */}
          <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-1 bg-slate-800 z-0">
            <div
              className="h-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 transition-all duration-500"
              style={{
                width: `${
                  currentMilestoneIndex >= 0
                    ? (currentMilestoneIndex / (SHIPMENT_MILESTONES.length - 1)) * 100
                    : 0
                }%`,
              }}
            />
          </div>

          {SHIPMENT_MILESTONES.map((milestone, index) => {
            const isCompleted = index < currentMilestoneIndex || currentStatus === "DELIVERED";
            const isCurrent = index === currentMilestoneIndex && currentStatus !== "DELIVERED";
            const isUpcoming = index > currentMilestoneIndex;

            return (
              <div
                key={milestone.status}
                className="relative z-10 flex flex-col items-center group cursor-default"
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 shadow-md",
                    isCompleted &&
                      "bg-emerald-500 border-emerald-400 text-slate-950 font-bold shadow-emerald-500/20",
                    isCurrent &&
                      "bg-sky-500 border-cyan-300 text-white font-bold ring-4 ring-sky-500/30 animate-pulse shadow-cyan-500/40",
                    isUpcoming &&
                      "bg-slate-900 border-slate-700 text-slate-500"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
                  ) : isCurrent ? (
                    <Clock className="h-4 w-4 stroke-[2.5]" />
                  ) : (
                    <span className="text-xs font-semibold">{index + 1}</span>
                  )}
                </div>

                <div className="text-center mt-2.5 max-w-[90px]">
                  <p
                    className={cn(
                      "text-xs font-semibold leading-tight",
                      isCurrent && "text-cyan-400 font-bold",
                      isCompleted && "text-slate-200",
                      isUpcoming && "text-slate-500"
                    )}
                  >
                    {milestone.shortLabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Milestone Event Stream */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 shadow-inner">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-sky-400" />
          Milestone Event Log & Chain of Custody
        </h4>

        {events.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 italic">
            Awaiting carrier milestone event dispatch.
          </p>
        ) : (
          <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
            {events.map((event, idx) => (
              <div key={event.id || idx} className="relative flex items-start pl-8 group">
                <div className="absolute left-2 top-1.5 -translate-x-1/2 h-3.5 w-3.5 rounded-full border-2 border-slate-900 bg-sky-400 shadow-sm" />
                <div className="flex-1 bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 transition-colors hover:border-slate-700">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <h5 className="text-sm font-semibold text-white">
                      {event.event_title}
                    </h5>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
                      {formatDateTime(event.occurred_at)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-sky-400/80" />
                    {event.location_name}
                  </p>
                  {event.event_description && (
                    <p className="text-xs text-slate-300 mt-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40">
                      {event.event_description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
