"use client";

import * as React from "react";
import { ErrorState } from "@/components/feedback/error-state";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Operations Control Tower Exception:", error);
  }, [error]);

  return (
    <div className="py-12 max-w-2xl mx-auto">
      <ErrorState
        title="Operations Dispatch Error"
        description={
          error.message ||
          "An error occurred while loading the operations control console. The event log has been saved for review."
        }
        onRetry={reset}
      />
    </div>
  );
}
