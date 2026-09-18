import {
  computeCustomersByIndustry,
  computeKpis,
  computeMrrByPlan,
  computeNewCustomersByMonth,
  computeStatusBreakdown,
  loadCustomers,
} from "@/lib/customers";
import { ChartCard } from "@/components/charts/ChartCard";
import { BarChart } from "@/components/charts/BarChart";
import { LineChart } from "@/components/charts/LineChart";
import { DonutChart } from "@/components/charts/DonutChart";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function Home() {
  const customers = loadCustomers();
  const { totalCustomers, activeMrr, churnRate, avgNps, planMix } =
    computeKpis(customers);
  const mrrByPlan = computeMrrByPlan(customers);
  const customersByIndustry = computeCustomersByIndustry(customers);
  const newCustomersByMonth = computeNewCustomersByMonth(customers);
  const statusBreakdown = computeStatusBreakdown(customers);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 sm:px-8">
      <h1 className="text-xl font-semibold tracking-tight text-slate-900">
        Customer Overview
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Snapshot of the current Helix customer base.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total Customers
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">
            {totalCustomers}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Active MRR
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">
            {currencyFormatter.format(activeMrr)}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Churn Rate
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">
            {churnRate.toFixed(1)}%
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Avg NPS Score
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">
            {avgNps.toFixed(0)}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Plan Mix
          </p>
          <div className="mt-2 space-y-1">
            {planMix.map(([plan, count]) => (
              <div
                key={plan}
                className="flex items-center justify-between text-sm text-slate-700"
              >
                <span>{plan}</span>
                <span className="font-semibold tabular-nums text-slate-900">
                  {count}
                </span>
              </div>
            ))}
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
    </main>
  );
}
