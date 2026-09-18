import fs from "fs";
import path from "path";

type CustomerRow = Record<string, string>;

function loadCustomers(): CustomerRow[] {
  const csvPath = path.join(process.cwd(), "data", "helix_customers.csv");
  const csv = fs.readFileSync(csvPath, "utf-8").trim();
  const [headerLine, ...lines] = csv.split("\n");
  const headers = headerLine.split(",");
  return lines.map((line) => {
    const values = line.split(",");
    return Object.fromEntries(
      headers.map((header, i) => [header, values[i] ?? ""]),
    );
  });
}

function computeKpis(rows: CustomerRow[]) {
  const totalCustomers = rows.length;

  // Active MRR: sum of mrr for customers with status = Active.
  // Churned/at-risk accounts are excluded so this reflects current run-rate revenue.
  const activeMrr = rows
    .filter((r) => r.status === "Active")
    .reduce((sum, r) => sum + Number(r.mrr || 0), 0);

  // Churn rate: share of all customers whose status is Churned.
  const churnedCount = rows.filter((r) => r.status === "Churned").length;
  const churnRate = (churnedCount / totalCustomers) * 100;

  // Average NPS: mean of nps_score across all customers.
  const npsValues = rows
    .map((r) => Number(r.nps_score))
    .filter((v) => !Number.isNaN(v));
  const avgNps =
    npsValues.reduce((sum, v) => sum + v, 0) / npsValues.length;

  // Plan mix: customer count per plan, most popular first.
  const planCounts = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.plan] = (acc[r.plan] ?? 0) + 1;
    return acc;
  }, {});
  const planMix = Object.entries(planCounts).sort((a, b) => b[1] - a[1]);

  return { totalCustomers, activeMrr, churnRate, avgNps, planMix };
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function Home() {
  const customers = loadCustomers();
  const { totalCustomers, activeMrr, churnRate, avgNps, planMix } =
    computeKpis(customers);

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
    </main>
  );
}
