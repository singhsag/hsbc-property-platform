"use client";

import { useState } from "react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ExportButton } from "@/components/ExportButton";
import { useHistory } from "@/hooks/useHistory";
import type { EstimateResponse, HistoryResponse } from "@/lib/types";

function fmt(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);
}

type Row = Record<string, unknown>;

const columns: Column<Row>[] = [
  {
    key: "timestamp",
    header: "Time",
    sortable: true,
    render: (v) => new Date(v as string).toLocaleString("en-GB"),
  },
  {
    key: "predicted_price",
    header: "Est. Price",
    sortable: true,
    render: (v) => fmt(v as number),
  },
  { key: "square_footage", header: "Sq Ft", sortable: true },
  { key: "bedrooms", header: "Bed", filterable: true },
  { key: "bathrooms", header: "Bath" },
  { key: "year_built", header: "Year Built", sortable: true, filterable: true },
  { key: "school_rating", header: "School Rating" },
];

function flattenRow(e: EstimateResponse): Row {
  return {
    estimate_id: e.estimate_id,
    timestamp: e.timestamp,
    predicted_price: e.predicted_price,
    square_footage: e.inputs.square_footage,
    bedrooms: e.inputs.bedrooms,
    bathrooms: e.inputs.bathrooms,
    year_built: e.inputs.year_built,
    lot_size: e.inputs.lot_size,
    distance_to_city_center: e.inputs.distance_to_city_center,
    school_rating: e.inputs.school_rating,
  };
}

export function HistoryClient({ initial }: { initial: HistoryResponse }) {
  const [rows, setRows] = useState<Row[]>(initial.items.map(flattenRow));
  const { loading, refresh } = useHistory();

  async function handleRefresh() {
    const result = await refresh(50);
    if (result) setRows(result.items.map(flattenRow));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{rows.length} estimate(s)</p>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <ExportButton
            data={rows}
            filename="estimate-history"
            columns={["timestamp", "predicted_price", "square_footage", "bedrooms", "bathrooms", "year_built", "school_rating"]}
            headers={["Timestamp", "Est. Price", "Sq Ft", "Bedrooms", "Bathrooms", "Year Built", "School Rating"]}
          />
        </div>
      </div>
      <DataTable columns={columns} data={rows} caption="Estimate history" />
    </div>
  );
}
