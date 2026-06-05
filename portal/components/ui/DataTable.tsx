"use client";

import { type ReactNode, useMemo, useState } from "react";

export interface Column<T> {
  key: keyof T & string;
  header: string;
  render?: (value: T[keyof T], row: T) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  caption?: string;
}

type SortDir = "asc" | "desc";

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  caption,
}: Props<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const hasFilters = columns.some((c) => c.filterable);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  // Filter first (case-insensitive substring on the raw cell value), then sort.
  const rows = useMemo(() => {
    const active = Object.entries(filters).filter(([, v]) => v.trim() !== "");
    const filtered = active.length
      ? data.filter((row) =>
          active.every(([key, term]) =>
            String(row[key] ?? "")
              .toLowerCase()
              .includes(term.toLowerCase())
          )
        )
      : data;

    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, filters, sortKey, sortDir]);

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-sm" aria-label={caption}>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="px-4 py-3 text-left font-semibold text-slate-600"
              >
                {col.sortable ? (
                  <button
                    onClick={() => handleSort(col.key)}
                    className="flex items-center gap-1 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
                    aria-sort={
                      sortKey === col.key
                        ? sortDir === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    {col.header}
                    <span className="text-slate-400">
                      {sortKey === col.key
                        ? sortDir === "asc"
                          ? "↑"
                          : "↓"
                        : "↕"}
                    </span>
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
          {hasFilters && (
            <tr>
              {columns.map((col) => (
                <th key={col.key} scope="col" className="px-4 pb-2 pt-0">
                  {col.filterable ? (
                    <input
                      type="text"
                      value={filters[col.key] ?? ""}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          [col.key]: e.target.value,
                        }))
                      }
                      placeholder={`Filter ${col.header.toLowerCase()}…`}
                      aria-label={`Filter by ${col.header}`}
                      className="w-full rounded border border-slate-300 px-2 py-1 text-xs font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : null}
                </th>
              ))}
            </tr>
          )}
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-slate-400"
              >
                No data available
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-slate-700">
                    {col.render
                      ? col.render(row[col.key], row)
                      : String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
