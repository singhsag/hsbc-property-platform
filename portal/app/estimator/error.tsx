"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
      <p className="text-sm font-medium text-red-700">
        Failed to load estimator
      </p>
      <p className="mt-1 text-xs text-red-500">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
      >
        Retry
      </button>
    </div>
  );
}
