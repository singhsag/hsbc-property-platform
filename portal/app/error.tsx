"use client";

import { useEffect } from "react";

// Root-level error boundary: catches any unhandled error in the app tree.
// Per-route error.tsx files handle segment-specific errors; this is the fallback.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="rounded-xl border border-red-200 bg-red-50 p-10 max-w-md w-full">
        <p className="text-lg font-semibold text-red-700">
          Something went wrong
        </p>
        <p className="mt-2 text-sm text-red-500">
          {error.message || "An unexpected error occurred loading this page."}
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-md bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
