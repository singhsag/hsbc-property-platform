"use client";

import { useWhatIf } from "@/hooks/useWhatIf";
import type { PropertyInput } from "@/lib/types";
import { EstimatorForm } from "./EstimatorForm";

function fmt(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);
}

export function WhatIfTool() {
  const { data, loading, error, runWhatIf } = useWhatIf();

  async function handleSubmit(input: PropertyInput) {
    await runWhatIf(input);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">
          Property Details
        </h2>
        <EstimatorForm
          onSubmit={handleSubmit}
          loading={loading}
          submitLabel="Analyse Market Position"
        />
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {data && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Estimated Price
            </p>
            <p className="mt-1 text-4xl font-bold text-blue-900">
              {fmt(data.predictedPrice)}
            </p>
          </div>

          {/* Percentile bar */}
          <div>
            <div className="mb-1 flex justify-between text-xs text-slate-500">
              <span>Market min {fmt(data.marketSummary.min)}</span>
              <span>Market max {fmt(data.marketSummary.max)}</span>
            </div>
            <div
              className="relative h-4 rounded-full bg-slate-200"
              role="meter"
              aria-label={`Market percentile: ${data.percentile.toFixed(1)}%`}
              aria-valuenow={data.percentile}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-4 rounded-full bg-blue-500 transition-all"
                style={{ width: `${Math.min(data.percentile, 100)}%` }}
              />
            </div>
            <p className="mt-1 text-center text-sm font-semibold text-slate-700">
              {data.percentile.toFixed(1)}th percentile
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Position</p>
              <p className="font-semibold text-slate-900 capitalize">
                {data.marketPosition.replace("_", " ")}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Market Median</p>
              <p className="font-semibold text-slate-900">
                {fmt(data.marketSummary.median)}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Market Avg</p>
              <p className="font-semibold text-slate-900">
                {fmt(data.marketSummary.mean)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
