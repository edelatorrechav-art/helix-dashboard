"use client";

import { useState } from "react";
import { ChartTooltip, TooltipLabel, TooltipValue } from "./ChartTooltip";
import { EmptyChartState } from "./EmptyChartState";

type DonutDatum = { label: string; value: number };

// Fixed status colors - these represent real account states (healthy / at
// risk / lost), not an arbitrary category order, so they use the reserved
// status palette rather than the chart's navy accent.
const STATUS_COLORS: Record<string, string> = {
  Active: "#0ca30c",
  "At-Risk": "#fab219",
  Churned: "#d03b3b",
};
const DEFAULT_COLOR = "#64748b";

export function DonutChart({
  data,
  centerLabel,
}: {
  data: DonutDatum[];
  centerLabel: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (data.length === 0 || total === 0) {
    return <EmptyChartState />;
  }

  const size = 220;
  const center = size / 2;
  const radius = 78;
  const strokeWidth = 30;
  const circumference = 2 * Math.PI * radius;
  const gap = 4;

  const rawLengths = data.map((d) => (d.value / total) * circumference);
  const segmentStarts = rawLengths.map((_, i) =>
    rawLengths.slice(0, i).reduce((sum, len) => sum + len, 0),
  );

  const segments = data.map((d, i) => {
    const drawLength = Math.max(rawLengths[i] - gap, 0);
    const offset = -(segmentStarts[i] + gap / 2);
    return {
      ...d,
      color: STATUS_COLORS[d.label] ?? DEFAULT_COLOR,
      dasharray: `${drawLength} ${circumference - drawLength}`,
      dashoffset: offset,
      isHovered: hovered === i,
    };
  });

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center">
      <div className="relative shrink-0">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          role="img"
          aria-label="Customer status breakdown"
        >
          <g transform={`rotate(-90 ${center} ${center})`}>
            {segments.map((s, i) => (
              <circle
                key={s.label}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={s.color}
                strokeWidth={s.isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={s.dasharray}
                strokeDashoffset={s.dashoffset}
                style={{ transition: "stroke-width 120ms ease" }}
                onPointerEnter={(e) => {
                  setHovered(i);
                  const rect = (
                    e.currentTarget.ownerSVGElement as SVGSVGElement
                  ).getBoundingClientRect();
                  setTooltipPos({ x: rect.width / 2, y: rect.height / 2 - radius });
                }}
                onPointerLeave={() => setHovered(null)}
              />
            ))}
          </g>
          <text
            x={center}
            y={center - 6}
            textAnchor="middle"
            className="fill-slate-900 text-2xl font-semibold"
          >
            {total}
          </text>
          <text
            x={center}
            y={center + 14}
            textAnchor="middle"
            className="fill-slate-500 text-[11px]"
          >
            {centerLabel}
          </text>
        </svg>
        <ChartTooltip x={tooltipPos.x} y={tooltipPos.y} visible={hovered !== null}>
          {hovered !== null && (
            <>
              <TooltipValue>
                {segments[hovered].value} (
                {((segments[hovered].value / total) * 100).toFixed(1)}%)
              </TooltipValue>
              <TooltipLabel>{segments[hovered].label}</TooltipLabel>
            </>
          )}
        </ChartTooltip>
      </div>

      <div className="flex flex-col gap-2">
        {segments.map((s, i) => (
          <div
            key={s.label}
            className="flex items-center gap-2 text-sm"
            onPointerEnter={() => setHovered(i)}
            onPointerLeave={() => setHovered(null)}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-slate-600">{s.label}</span>
            <span className="ml-auto font-semibold tabular-nums text-slate-900">
              {s.value}
            </span>
            <span className="w-12 text-right text-xs tabular-nums text-slate-400">
              {((s.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
