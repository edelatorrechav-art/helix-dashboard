import fs from "fs";
import path from "path";

function getCustomerCount(): number {
  const csvPath = path.join(process.cwd(), "data", "helix_customers.csv");
  const csv = fs.readFileSync(csvPath, "utf-8").trim();
  const lines = csv.split("\n");
  return lines.length - 1; // subtract header row
}

export default function Home() {
  const customerCount = getCustomerCount();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 sm:px-8">
      <h1 className="text-xl font-semibold tracking-tight text-slate-900">
        Customer Overview
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Snapshot of the current Helix customer base.
      </p>

      <div className="mt-6 max-w-xs rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Total Customers
        </p>
        <p className="mt-2 text-4xl font-semibold tabular-nums text-slate-900">
          {customerCount}
        </p>
      </div>
    </main>
  );
}
