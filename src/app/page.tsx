import { loadCustomers } from "@/lib/customers-data";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default function Home() {
  const customers = loadCustomers();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 sm:px-8">
      <h1 className="text-xl font-semibold tracking-tight text-slate-900">
        Customer Overview
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Snapshot of the current Helix customer base.
      </p>

      <DashboardClient customers={customers} />
    </main>
  );
}
