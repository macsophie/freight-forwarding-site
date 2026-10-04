import React from "react";
import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon = PackageOpen,
  title = "No records found",
  description = "No items match the selected criteria or none have been created yet.",
  actionLabel,
  onAction,
  className,
}: {
  icon?: React.ElementType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-slate-800 bg-slate-950/20 backdrop-blur-sm",
        className
      )}
    >
      <div className="h-14 w-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
        <Icon className="h-7 w-7 text-sky-400/80" />
      </div>
      <h3 className="text-base font-semibold text-slate-200">{title}</h3>
      <p className="text-xs text-slate-400 mt-1 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          variant="default"
          size="sm"
          className="mt-5"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
