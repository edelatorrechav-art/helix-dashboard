"use client";

import { useMemo, useState } from "react";
import {
  computeCustomersByIndustry,
  computeKpis,
  computeMrrByPlan,
  computeNewCustomersByMonth,
  computeStatusBreakdown,
  PLAN_TIER_ORDER,
  STATUS_ORDER,
  type CustomerRow,
} from "@/lib/customers";
import { ChartCard } from "@/components/charts/ChartCard";
import { BarChart } from "@/components/charts/BarChart";
import { LineChart } from "@/components/charts/LineChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { FilterBar } from "./FilterBar";
import { CustomerTable } from "./CustomerTable";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function uniqueInOrder(values: string[], preferredOrder: string[]) {
  const present = new Set(values);
  const ordered = preferredOrder.filter((v) => present.has(v));
  const rest = Array.from(present)
    .filter((v) => !preferredOrder.includes(v))
    .sort();
  return [...ordered, ...rest];
}

export function DashboardClient({ customers }: { customers: CustomerRow[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [plan, setPlan] = useState("");
  const [industry, setIndustry] = useState("");

  const exportColumns = useMemo(
    () => (customers.length > 0 ? Object.keys(customers[0]) : []),
    [customers],
  );

  const statusOptions = useMemo(
    () => uniqueInOrder(customers.map((c) => c.status), STATUS_ORDER),
    [customers],
  );
  const planOptions = useMemo(
    () => uniqueInOrder(customers.map((c) => c.plan), PLAN_TIER_ORDER),
    [customers],
  );
  const industryOptions = useMemo(
    () => uniqueInOrder(customers.map((c) => c.industry), []),
    [customers],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return customers.filter((c) => {
      if (status && c.status !== status) return false;
      if (plan && c.plan !== plan) return false;
      if (industry && c.industry !== industry) return false;
      if (
        term &&
        !c.company_name.toLowerCase().includes(term) &&
        !c.customer_id.toLowerCase().includes(term)
      ) {
        return false;
      }
      return true;
    });
  }, [customers, search, status, plan, industry]);

  const kpis = useMemo(() => computeKpis(filtered), [filtered]);
  const mrrByPlan = useMemo(() => computeMrrByPlan(filtered), [filtered]);
  const customersByIndustry = useMemo(
    () => computeCustomersByIndustry(filtered),
    [filtered],
  );
  const newCustomersByMonth = useMemo(
    () => computeNewCustomersByMonth(filtered),
    [filtered],
  );
  const statusBreakdown = useMemo(
    () => computeStatusBreakdown(filtered),
    [filtered],
  );

  const hasActiveFilters = Boolean(search || status || plan || industry);

  return (
    <>
      <div className="mt-6">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          statusOptions={statusOptions}
          plan={plan}
          onPlanChange={setPlan}
          planOptions={planOptions}
          industry={industry}
          onIndustryChange={setIndustry}
          industryOptions={industryOptions}
          resultCount={filtered.length}
          totalCount={customers.length}
          hasActiveFilters={hasActiveFilters}
          onReset={() => {
            setSearch("");
            setStatus("");
            setPlan("");
            setIndustry("");
          }}
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total Customers
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">
            {kpis.totalCustomers}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Active MRR
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">
            {currencyFormatter.format(kpis.activeMrr)}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Churn Rate
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">
            {kpis.churnRate.toFixed(1)}%
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Avg NPS Score
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">
            {kpis.avgNps.toFixed(0)}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Plan Mix
          </p>
          <div className="mt-2 space-y-1">
            {kpis.planMix.length === 0 ? (
              <p className="text-sm text-slate-400">No data</p>
            ) : (
              kpis.planMix.map(([planName, count]) => (
                <div
                  key={planName}
                  className="flex items-center justify-between text-sm text-slate-700"
                >
                  <span>{planName}</span>
                  <span className="font-semibold tabular-nums text-slate-900">
                    {count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="New Customers by Month"
          subtitle="Signups per month, Jan 2023 - Dec 2024"
          className="lg:col-span-2"
        >
          <LineChart
            data={newCustomersByMonth}
            valueFormat="number"
            xAxisLabel="Month"
            yAxisLabel="New customers"
          />
        </ChartCard>

        <ChartCard title="MRR by Plan" subtitle="Monthly recurring revenue per plan tier">
          <BarChart
            data={mrrByPlan}
            orientation="vertical"
            valueFormat="currency"
            xAxisLabel="Plan"
            yAxisLabel="MRR"
          />
        </ChartCard>

        <ChartCard title="Customer Status" subtitle="Share of customers by account status">
          <DonutChart data={statusBreakdown} centerLabel="Customers" />
        </ChartCard>

        <ChartCard
          title="Customers by Industry"
          subtitle="Customer count per industry, most first"
          className="lg:col-span-2"
        >
          <BarChart
            data={customersByIndustry}
            orientation="horizontal"
            valueFormat="number"
            xAxisLabel="Industry"
            yAxisLabel="Customers"
          />
        </ChartCard>
      </div>

      <div className="mt-10">
        <CustomerTable
          rows={filtered}
          totalCount={customers.length}
          exportColumns={exportColumns}
        />
      </div>
    </>
  );
}
