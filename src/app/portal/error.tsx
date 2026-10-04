"use client";

import * as React from "react";
import { ErrorState } from "@/components/feedback/error-state";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Portal Exception:", error);
  }, [error]);

  return (
    <div className="py-12 max-w-2xl mx-auto">
      <ErrorState
        title="Failed to Load Portal View"
        description={
          error.message ||
          "An error occurred while retrieving your company's freight shipments. Please check your connection and retry."
        }
        onRetry={reset}
      />
    </div>
  );
}
