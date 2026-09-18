// Rounds a raw range to a "nice" step (1, 2, 5, 10 x 10^n) so axis ticks land
// on clean numbers instead of arbitrary decimals.
function niceNumber(range: number, round: boolean): number {
  if (range === 0) return 1;
  const exponent = Math.floor(Math.log10(range));
  const fraction = range / Math.pow(10, exponent);
  let niceFraction: number;
  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else {
    if (fraction <= 1) niceFraction = 1;
    else if (fraction <= 2) niceFraction = 2;
    else if (fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
  }
  return niceFraction * Math.pow(10, exponent);
}

export function niceScale(max: number, maxTicks = 4) {
  const safeMax = max <= 0 ? 1 : max;
  const step = niceNumber(safeMax / (maxTicks - 1), true);
  const niceMax = Math.ceil(safeMax / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= niceMax + step / 2; v += step) {
    ticks.push(Math.round(v));
  }
  return { max: niceMax, step, ticks };
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(
    value,
  );
}

export function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export type ValueFormat = "currency" | "number";

export function formatByType(value: number, format: ValueFormat): string {
  return format === "currency"
    ? formatCompactCurrency(value)
    : formatCompactNumber(value);
}
