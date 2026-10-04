import * as React from "react";
import { cn } from "@/lib/utils";

const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical" }
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "shrink-0 bg-slate-800/80",
      orientation === "horizontal" ? "h-[1px] w-full my-4" : "h-full w-[1px] mx-4",
      className
    )}
    {...props}
  />
));
Separator.displayName = "Separator";

export { Separator };
