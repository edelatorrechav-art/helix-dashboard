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
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-black/[.08] bg-white px-10 py-12 text-center shadow-sm dark:border-white/[.145] dark:bg-zinc-900">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Helix Customer Dashboard
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Total Customers
        </p>
        <p className="text-5xl font-bold tabular-nums text-black dark:text-zinc-50">
          {customerCount}
        </p>
      </main>
    </div>
  );
}
