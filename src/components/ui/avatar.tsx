import * as React from "react";
import { cn } from "@/lib/utils";

export function Avatar({
  className,
  children,
  src,
  alt = "User",
  initials,
}: {
  className?: string;
  children?: React.ReactNode;
  src?: string | null;
  alt?: string;
  initials?: string;
}) {
  const [imageError, setImageError] = React.useState(false);

  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-tr from-sky-600 to-cyan-500 text-white font-semibold items-center justify-center text-xs shadow-md border border-slate-700/50 select-none",
        className
      )}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          className="aspect-square h-full w-full object-cover"
        />
      ) : initials ? (
        <span>{initials}</span>
      ) : (
        children || <span>U</span>
      )}
    </div>
  );
}
