"use client";

import { useMemo, useState } from "react";
import type { CustomerRow } from "@/lib/customers";
import { downloadCsv, rowsToCsv } from "@/lib/csv-export";

type SortDirection = "asc" | "desc";

type Column = {
  key: string;
  label: string;
  numeric?: boolean;
  align?: "right";
  format?: (row: CustomerRow) => string;
};

const STATUS_COLORS: Record<string, string> = {
  Active: "#0ca30c",
  "At-Risk": "#fab219",
  Churned: "#d03b3b",
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const COLUMNS: Column[] = [
  { key: "company_name", label: "Company" },
  { key: "industry", label: "Industry" },
  { key: "plan", label: "Plan" },
  { key: "status", label: "Status" },
  {
    key: "mrr",
    label: "MRR",
    numeric: true,
    align: "right",
    format: (row) => currencyFormatter.format(Number(row.mrr || 0)),
  },
  { key: "nps_score", label: "NPS", numeric: true, align: "right" },
  { key: "csm_name", label: "CSM" },
];

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? "#64748b";
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-slate-700">
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      {status}
    </span>
  );
}

export function CustomerTable({
  rows,
  totalCount,
  exportColumns,
}: {
  rows: CustomerRow[];
  totalCount: number;
  exportColumns: string[];
}) {
  const [sortKey, setSortKey] = useState<string>("mrr");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const sortedRows = useMemo(() => {
    const column = COLUMNS.find((c) => c.key === sortKey);
    const copy = [...rows];
    copy.sort((a, b) => {
      if (column?.numeric) {
        const diff = Number(a[sortKey] || 0) - Number(b[sortKey] || 0);
        return sortDir === "asc" ? diff : -diff;
      }
      const diff = (a[sortKey] || "").localeCompare(b[sortKey] || "");
      return sortDir === "asc" ? diff : -diff;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  function handleSort(column: Column) {
    if (sortKey === column.key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(column.key);
      setSortDir(column.numeric ? "desc" : "asc");
    }
  }

  function handleExport() {
    const csv = rowsToCsv(sortedRows, exportColumns);
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(`helix-customers-${date}.csv`, csv);
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Customer Directory</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {rows.length} of {totalCount} customers — click a column to sort
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          disabled={sortedRows.length === 0}
          className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M8 1.5v8.25m0 0L4.75 6.5M8 9.75l3.25-3.25M2.5 11.5v1.75c0 .69.56 1.25 1.25 1.25h8.5c.69 0 1.25-.56 1.25-1.25V11.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Export CSV
        </button>
      </div>

      <div className="mt-4 max-h-[480px] overflow-auto rounded-md border border-slate-100">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr>
              {COLUMNS.map((column) => {
                const isActive = sortKey === column.key;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    className={`border-b border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 ${
                      column.align === "right" ? "text-right" : "text-left"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSort(column)}
                      className={`inline-flex items-center gap-1 rounded hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 ${
                        isActive ? "text-slate-900" : ""
                      }`}
                    >
                      {column.label}
                      <span className="text-[10px] text-slate-400">
                        {isActive ? (sortDir === "asc" ? "▲" : "▼") : ""}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="px-3 py-8 text-center text-sm text-slate-400"
                >
                  No customers match your filters.
                </td>
              </tr>
            ) : (
              sortedRows.map((row) => (
                <tr
                  key={row.customer_id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  {COLUMNS.map((column) => (
                    <td
                      key={column.key}
                      className={`px-3 py-2 text-slate-700 ${
                        column.align === "right"
                          ? "text-right tabular-nums"
                          : "text-left"
                      }`}
                    >
                      {column.key === "status" ? (
                        <StatusBadge status={row.status} />
                      ) : column.format ? (
                        column.format(row)
                      ) : (
                        row[column.key] || "—"
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
