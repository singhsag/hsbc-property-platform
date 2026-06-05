"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { postCompare } from "@/lib/api";
import type { CompareItem, PropertyInput } from "@/lib/types";
import { EstimatorForm } from "./EstimatorForm";

const MAX = 5; // matches CompareRequest max_length=5 in property-backend schema

function fmt(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);
}

export function CompareView() {
  const [properties, setProperties] = useState<PropertyInput[]>([]);
  const [results, setResults] = useState<CompareItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  function addProperty(input: PropertyInput) {
    setProperties((prev) => [...prev, input]);
    setAdding(false);
    setResults(null);
  }

  function removeProperty(index: number) {
    setProperties((prev) => prev.filter((_, i) => i !== index));
    setResults(null);
  }

  async function runCompare() {
    if (properties.length < 2) return;
    setLoading(true);
    setError(null);
    try {
      const res = await postCompare(properties);
      setResults(res.comparisons);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Compare failed");
    } finally {
      setLoading(false);
    }
  }

  const chartData = results?.map((r, i) => ({
    name: `Property ${i + 1}`,
    price: Math.round(r.predicted_price),
  }));

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {properties.map((p, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          >
            <span className="font-medium text-slate-700">
              Property {i + 1} — {p.square_footage} sq ft, {p.bedrooms} bed,{" "}
              {p.year_built}
            </span>
            <button
              onClick={() => removeProperty(i)}
              className="text-red-500 hover:text-red-700 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
              aria-label={`Remove property ${i + 1}`}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {adding && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">
            Property {properties.length + 1}
          </h3>
          <EstimatorForm
            onSubmit={addProperty}
            loading={false}
            submitLabel="Add Property"
          />
          <button
            onClick={() => setAdding(false)}
            className="mt-2 text-xs text-slate-500 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="flex gap-3">
        {properties.length < MAX && !adding && (
          <button
            onClick={() => setAdding(true)}
            className="rounded-md border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors"
          >
            + Add Property
          </button>
        )}
        {properties.length >= 2 && !adding && (
          <button
            onClick={runCompare}
            disabled={loading}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60 transition-colors"
          >
            {loading ? "Comparing…" : "Compare"}
          </button>
        )}
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {chartData && chartData.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">
            Price Comparison
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(v: number) => `£${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11 }}
                width={56}
              />
              <Tooltip formatter={(v: number) => [fmt(v), "Est. Price"]} />
              <Legend />
              <Bar dataKey="price" name="Estimated Price" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {results?.map((r, i) => (
              <div
                key={i}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center"
              >
                <p className="text-xs text-slate-500">Property {i + 1}</p>
                <p className="text-lg font-bold text-slate-900">
                  {fmt(r.predicted_price)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
