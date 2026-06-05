"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getAnalysis, getSegments } from "@/lib/api";
import type { AnalysisResponse, MarketSummary, SegmentsResponse } from "@/lib/types";
import { DataTable, type Column } from "./ui/DataTable";
import { ExportButton } from "./ExportButton";
import { LoadingSpinner } from "./ui/LoadingSpinner";

function fmt(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);
}

interface Props {
  summary: MarketSummary;
}

interface Filters {
  minPrice: string;
  maxPrice: string;
  minBedrooms: string;
  maxBedrooms: string;
}

type TableRow = Record<string, unknown>;

const segmentColumns: Column<TableRow>[] = [
  { key: "group", header: "Bedrooms", sortable: true, filterable: true },
  { key: "count", header: "Count", sortable: true },
  { key: "mean", header: "Avg Price", sortable: true, render: (v) => fmt(v as number) },
  { key: "median", header: "Median", sortable: true, render: (v) => fmt(v as number) },
  { key: "min", header: "Min", render: (v) => fmt(v as number) },
  { key: "max", header: "Max", render: (v) => fmt(v as number) },
];

export function MarketDashboard({ summary }: Props) {
  const [segments, setSegments] = useState<SegmentsResponse | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [filters, setFilters] = useState<Filters>({
    minPrice: "",
    maxPrice: "",
    minBedrooms: "",
    maxBedrooms: "",
  });
  const [loadingSegments, setLoadingSegments] = useState(true);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSegments("bedrooms")
      .then(setSegments)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingSegments(false));
  }, []);

  async function applyFilters() {
    setLoadingAnalysis(true);
    setError(null);
    try {
      const params = {
        ...(filters.minPrice ? { minPrice: Number(filters.minPrice) } : {}),
        ...(filters.maxPrice ? { maxPrice: Number(filters.maxPrice) } : {}),
        ...(filters.minBedrooms ? { minBedrooms: Number(filters.minBedrooms) } : {}),
        ...(filters.maxBedrooms ? { maxBedrooms: Number(filters.maxBedrooms) } : {}),
      };
      const result = await getAnalysis(params);
      setAnalysis(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Filter failed");
    } finally {
      setLoadingAnalysis(false);
    }
  }

  const summaryCards = [
    { label: "Properties", value: summary.count },
    { label: "Average Price", value: fmt(summary.mean) },
    { label: "Median Price", value: fmt(summary.median) },
    { label: "Price Range", value: `${fmt(summary.min)} – ${fmt(summary.max)}` },
    { label: "Std Dev", value: fmt(summary.stdDev) },
  ];

  const tableData: TableRow[] = (segments?.segments ?? []).map((s) => ({
    group: s.group,
    count: s.count,
    mean: s.mean,
    median: s.median,
    min: s.min,
    max: s.max,
  }));

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {summaryCards.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {label}
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900 truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* Segment chart */}
      {loadingSegments ? (
        <LoadingSpinner label="Loading segments…" />
      ) : segments ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">
            Average Price by Bedrooms
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={segments.segments}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="group" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(v: number) => `£${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11 }}
                width={56}
              />
              <Tooltip formatter={(v: number) => [fmt(v), "Avg Price"]} />
              <Bar dataKey="mean" name="Avg Price" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : null}

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Filter Analysis</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              { name: "minPrice", label: "Min Price (£)" },
              { name: "maxPrice", label: "Max Price (£)" },
              { name: "minBedrooms", label: "Min Bedrooms" },
              { name: "maxBedrooms", label: "Max Bedrooms" },
            ] as { name: keyof Filters; label: string }[]
          ).map(({ name, label }) => (
            <div key={name} className="flex flex-col gap-1">
              <label htmlFor={name} className="text-xs font-medium text-slate-600">
                {label}
              </label>
              <input
                id={name}
                type="number"
                value={filters[name]}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, [name]: e.target.value }))
                }
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any"
              />
            </div>
          ))}
        </div>
        <button
          onClick={applyFilters}
          disabled={loadingAnalysis}
          className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors"
        >
          {loadingAnalysis ? "Applying…" : "Apply Filters"}
        </button>

        {analysis && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 text-sm">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Matches</p>
              <p className="font-bold text-slate-900">{analysis.count}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Avg Price</p>
              <p className="font-bold text-slate-900">{fmt(analysis.mean)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Median</p>
              <p className="font-bold text-slate-900">{fmt(analysis.median)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Range</p>
              <p className="font-bold text-slate-900 text-xs">{fmt(analysis.min)} – {fmt(analysis.max)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Segment table */}
      {tableData.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">
              Segment Breakdown
            </h2>
            <ExportButton
              data={tableData}
              filename="market-segments"
              columns={["group", "count", "mean", "median", "min", "max"]}
              headers={["Bedrooms", "Count", "Avg Price", "Median", "Min", "Max"]}
            />
          </div>
          <DataTable columns={segmentColumns} data={tableData} caption="Market segments by bedrooms" />
        </div>
      )}

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
