"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EstimateResponse, MarketSummary } from "@/lib/types";

function fmt(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);
}

interface Props {
  result: EstimateResponse;
  marketSummary: MarketSummary;
}

export function PredictionResult({ result, marketSummary }: Props) {
  const chartData = [
    { name: "Your Property", value: Math.round(result.predicted_price) },
    { name: "Market Average", value: Math.round(marketSummary.mean) },
    { name: "Market Median", value: Math.round(marketSummary.median) },
  ];

  const rows: [string, string][] = [
    ["Square Footage", `${result.inputs.square_footage} sq ft`],
    ["Bedrooms", String(result.inputs.bedrooms)],
    ["Bathrooms", String(result.inputs.bathrooms)],
    ["Year Built", String(result.inputs.year_built)],
    ["Lot Size", `${result.inputs.lot_size} sq ft`],
    ["Distance to City", `${result.inputs.distance_to_city_center} mi`],
    ["School Rating", `${result.inputs.school_rating}/10`],
  ];

  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-6 text-center">
        <p className="text-sm font-medium text-blue-700 uppercase tracking-wide">
          Estimated Value
        </p>
        <p className="mt-1 text-4xl font-bold text-blue-900">
          {fmt(result.predicted_price)}
        </p>
        <p className="mt-1 text-xs text-blue-600">
          {new Date(result.timestamp).toLocaleString("en-GB")}
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-700">
          vs. Market
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis
              tickFormatter={(v: number) => `£${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11 }}
              width={56}
            />
            <Tooltip
              formatter={(v: number) => [fmt(v), "Price"]}
            />
            <Bar
              dataKey="value"
              fill="#2563eb"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-700">
          Input Summary
        </h3>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-sm" aria-label="Input summary">
            <tbody className="divide-y divide-slate-100">
              {rows.map(([label, value]) => (
                <tr key={label} className="flex justify-between px-4 py-2">
                  <td className="text-slate-500">{label}</td>
                  <td className="font-medium text-slate-900">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
