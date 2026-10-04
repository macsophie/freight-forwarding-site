import { ArrowRight, Globe, MapPin, Anchor, Plane, Truck } from "lucide-react";
import { ShipmentMode } from "@/types/database";
import { cn } from "@/lib/utils";

export function RouteDisplay({
  originName,
  originPort,
  originCountry,
  destinationName,
  destinationPort,
  destinationCountry,
  mode,
  className,
}: {
  originName: string;
  originPort: string;
  originCountry: string;
  destinationName: string;
  destinationPort: string;
  destinationCountry: string;
  mode?: ShipmentMode;
  className?: string;
}) {
  const ModeIcon =
    mode === "AIR" ? Plane : mode === "ROAD" ? Truck : Anchor;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/50 gap-4",
        className
      )}
    >
      {/* Origin */}
      <div className="flex-1 flex items-start gap-3 w-full">
        <div className="h-9 w-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
          <MapPin className="h-4 w-4" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Origin
          </span>
          <h4 className="text-sm font-semibold text-white">{originName}</h4>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <span className="font-mono text-sky-300 font-semibold">{originPort}</span>
            <span>• {originCountry}</span>
          </p>
        </div>
      </div>

      {/* Corridor Connector */}
      <div className="flex flex-col items-center justify-center shrink-0 px-2 py-1 bg-slate-950/80 rounded-lg border border-slate-800/80">
        <div className="flex items-center gap-2 text-slate-400">
          <div className="h-[1px] w-6 bg-slate-700 hidden sm:block" />
          <ModeIcon className="h-4 w-4 text-cyan-400" />
          <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          <div className="h-[1px] w-6 bg-slate-700 hidden sm:block" />
        </div>
        {mode && (
          <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mt-0.5">
            {mode.replace("_", " ")}
          </span>
        )}
      </div>

      {/* Destination */}
      <div className="flex-1 flex items-start sm:justify-end gap-3 w-full sm:text-right">
        <div className="order-2 sm:order-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Destination
          </span>
          <h4 className="text-sm font-semibold text-white">{destinationName}</h4>
          <p className="text-xs text-slate-400 flex items-center sm:justify-end gap-1">
            <span className="font-mono text-emerald-300 font-semibold">{destinationPort}</span>
            <span>• {destinationCountry}</span>
          </p>
        </div>
        <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 order-1 sm:order-2">
          <MapPin className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
