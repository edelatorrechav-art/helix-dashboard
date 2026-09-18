"use client";

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  statusOptions,
  plan,
  onPlanChange,
  planOptions,
  industry,
  onIndustryChange,
  industryOptions,
  resultCount,
  totalCount,
  hasActiveFilters,
  onReset,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  statusOptions: string[];
  plan: string;
  onPlanChange: (value: string) => void;
  planOptions: string[];
  industry: string;
  onIndustryChange: (value: string) => void;
  industryOptions: string[];
  resultCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onReset: () => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex min-w-[220px] flex-1 flex-col gap-1 text-xs font-medium text-slate-500">
          Search
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by company or customer ID…"
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </label>

        <Select
          label="Status"
          value={status}
          onChange={onStatusChange}
          options={statusOptions}
        />
        <Select
          label="Plan"
          value={plan}
          onChange={onPlanChange}
          options={planOptions}
        />
        <Select
          label="Industry"
          value={industry}
          onChange={onIndustryChange}
          options={industryOptions}
        />

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="rounded-md px-2 py-1.5 text-xs font-medium text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline"
          >
            Reset filters
          </button>
        )}

        <span className="ml-auto whitespace-nowrap text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-900">{resultCount}</span> of{" "}
          {totalCount} customers
        </span>
      </div>
    </div>
  );
}
