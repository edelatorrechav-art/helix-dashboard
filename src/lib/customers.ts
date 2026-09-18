export type CustomerRow = Record<string, string>;

export function computeKpis(rows: CustomerRow[]) {
  const totalCustomers = rows.length;

  // Active MRR: sum of mrr for customers with status = Active.
  // Churned/at-risk accounts are excluded so this reflects current run-rate revenue.
  const activeMrr = rows
    .filter((r) => r.status === "Active")
    .reduce((sum, r) => sum + Number(r.mrr || 0), 0);

  // Churn rate: share of all customers whose status is Churned.
  const churnedCount = rows.filter((r) => r.status === "Churned").length;
  const churnRate = totalCustomers === 0 ? 0 : (churnedCount / totalCustomers) * 100;

  // Average NPS: mean of nps_score across all customers.
  const npsValues = rows
    .map((r) => Number(r.nps_score))
    .filter((v) => !Number.isNaN(v));
  const avgNps =
    npsValues.length === 0
      ? 0
      : npsValues.reduce((sum, v) => sum + v, 0) / npsValues.length;

  // Plan mix: customer count per plan, most popular first.
  const planCounts = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.plan] = (acc[r.plan] ?? 0) + 1;
    return acc;
  }, {});
  const planMix = Object.entries(planCounts).sort((a, b) => b[1] - a[1]);

  return { totalCustomers, activeMrr, churnRate, avgNps, planMix };
}

const PLAN_TIER_ORDER = ["Starter", "Growth", "Business", "Enterprise"];

// MRR summed by plan, ordered by ascending tier rather than by value -
// the tiers already have a natural order the reader expects to scan left to right.
export function computeMrrByPlan(rows: CustomerRow[]) {
  const totals = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.plan] = (acc[r.plan] ?? 0) + Number(r.mrr || 0);
    return acc;
  }, {});
  return PLAN_TIER_ORDER.filter((plan) => plan in totals).map((plan) => ({
    label: plan,
    value: totals[plan],
  }));
}

// Customer count by industry, most customers first.
export function computeCustomersByIndustry(rows: CustomerRow[]) {
  const counts = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.industry] = (acc[r.industry] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

// New customers per month, derived from start_date (YYYY-MM-DD), in chronological order.
export function computeNewCustomersByMonth(rows: CustomerRow[]) {
  const counts = rows.reduce<Record<string, number>>((acc, r) => {
    const month = r.start_date?.slice(0, 7);
    if (!month) return acc;
    acc[month] = (acc[month] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({ month, value }));
}

const STATUS_ORDER = ["Active", "At-Risk", "Churned"];

// Customer status breakdown for the donut chart.
export function computeStatusBreakdown(rows: CustomerRow[]) {
  const counts = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});
  return STATUS_ORDER.filter((status) => status in counts).map((status) => ({
    label: status,
    value: counts[status],
  }));
}

export { STATUS_ORDER, PLAN_TIER_ORDER };
