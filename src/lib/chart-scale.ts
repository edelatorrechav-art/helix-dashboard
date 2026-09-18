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

// A hand-rolled compact formatter, not Intl's `notation: "compact"` - that
// option's rounding/trailing-zero behavior has been observed to differ
// between Node's and the browser's bundled ICU data (e.g. "$50K" vs
// "$50.0K" for the same value), which breaks SSR hydration. Plain math
// here is deterministic across runtimes.
function compactParts(value: number): { rounded: string; suffix: string } {
  const abs = Math.abs(value);
  const [divisor, suffix] =
    abs >= 1_000_000_000
      ? [1_000_000_000, "B"]
      : abs >= 1_000_000
        ? [1_000_000, "M"]
        : abs >= 1_000
          ? [1_000, "K"]
          : [1, ""];
  const divided = value / divisor;
  const fixed = suffix ? divided.toFixed(1) : String(Math.round(divided));
  return { rounded: fixed.replace(/\.0$/, ""), suffix };
}

export function formatCompactNumber(value: number): string {
  const { rounded, suffix } = compactParts(value);
  return `${rounded}${suffix}`;
}

export function formatCompactCurrency(value: number): string {
  const { rounded, suffix } = compactParts(value);
  return `$${rounded}${suffix}`;
}

export type ValueFormat = "currency" | "number";

export function formatByType(value: number, format: ValueFormat): string {
  return format === "currency"
    ? formatCompactCurrency(value)
    : formatCompactNumber(value);
}
