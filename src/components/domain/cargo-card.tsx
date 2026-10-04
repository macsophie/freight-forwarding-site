import { Box, Weight, Gauge, AlertTriangle, ShieldCheck } from "lucide-react";
import { formatWeight, formatCBM } from "@/lib/utils";

export interface CargoItemData {
  package_type: string;
  quantity: number;
  gross_weight_kg: number;
  total_volume_cbm: number;
  commodity_description: string;
  is_hazardous?: boolean;
  un_number?: string | null;
  hs_code?: string | null;
}

export function CargoCard({ item }: { item: CargoItemData }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[11px] font-bold">
              {item.quantity}x {item.package_type}
            </span>
            {item.is_hazardous ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[11px] font-semibold">
                <AlertTriangle className="h-3 w-3" /> HAZMAT ({item.un_number || "UN Class"})
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold">
                <ShieldCheck className="h-3 w-3" /> Non-Hazardous
              </span>
            )}
          </div>
          <h4 className="text-sm font-semibold text-white mt-1.5">
            {item.commodity_description}
          </h4>
        </div>
        {item.hs_code && (
          <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-1 rounded">
            HS: {item.hs_code}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Weight className="h-3.5 w-3.5 text-sky-400" />
          <span>{formatWeight(item.gross_weight_kg)}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Gauge className="h-3.5 w-3.5 text-cyan-400" />
          <span>{formatCBM(item.total_volume_cbm)}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Box className="h-3.5 w-3.5 text-amber-400" />
          <span>{item.quantity} units</span>
        </div>
      </div>
    </div>
  );
}
