export function LoadingSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-16"
      role="status"
      aria-label={label}
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      <span className="text-sm text-slate-500">{label}</span>
    </div>
  );
}
