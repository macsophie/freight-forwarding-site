"use client";

import * as React from "react";
import Link from "next/link";
import { ErrorState } from "@/components/feedback/error-state";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Global Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full space-y-4">
        <ErrorState
          title="System Service Interruption"
          description={
            error.message ||
            "An unexpected error occurred while connecting to the freight network. Please try refreshing or return home."
          }
          onRetry={reset}
        />
        <div className="flex justify-center">
          <Link href="/">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 border-slate-800">
              <Home className="h-3.5 w-3.5" />
              <span>Return to ForwardFlow Home</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
