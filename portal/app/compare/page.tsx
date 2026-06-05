import { CompareView } from "@/components/CompareView";

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        Compare Properties
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        Add up to 5 properties to compare their estimated values side-by-side.
      </p>
      <CompareView />
    </div>
  );
}
