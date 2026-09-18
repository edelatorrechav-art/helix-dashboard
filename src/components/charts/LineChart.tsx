"use client";

import { useRef, useState } from "react";
import { formatByType, niceScale, type ValueFormat } from "@/lib/chart-scale";
import { useElementWidth } from "@/lib/use-element-width";
import { ChartTooltip, TooltipLabel, TooltipValue } from "./ChartTooltip";
import { EmptyChartState } from "./EmptyChartState";

type LinePoint = { month: string; value: number };

const NAVY = "#1e3a8a";

function formatMonthTick(month: string) {
  const [year, m] = month.split("-");
  const date = new Date(Number(year), Number(m) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function formatMonthFull(month: string) {
  const [year, m] = month.split("-");
  const date = new Date(Number(year), Number(m) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function LineChart({
  data,
  valueFormat,
  xAxisLabel,
  yAxisLabel,
}: {
  data: LinePoint[];
  valueFormat: ValueFormat;
  xAxisLabel: string;
  yAxisLabel: string;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerRef, measuredWidth] = useElementWidth<HTMLDivElement>(900);
  const valueFormatter = (value: number) => formatByType(value, valueFormat);

  if (data.length === 0) {
    return (
      <div ref={containerRef}>
        <EmptyChartState />
      </div>
    );
  }

  const width = Math.max(measuredWidth, 240);
  const height = Math.max(width * (280 / 900), 160);
  const margin = { top: 16, right: 16, bottom: 32, left: 52 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const maxValue = Math.max(...data.map((d) => d.value), 0);
  const scale = niceScale(maxValue, 4);

  const xFor = (i: number) =>
    margin.left + (i / Math.max(data.length - 1, 1)) * plotWidth;
  const yFor = (v: number) =>
    margin.top + plotHeight - (v / scale.max) * plotHeight;

  // Adaptive tick density: fit as many month labels as comfortably space
  // out at ~70px apart, so labels thin out on a narrow mobile card instead
  // of overlapping.
  const maxLabels = Math.max(2, Math.floor(plotWidth / 70));
  const labelStride = Math.max(1, Math.ceil(data.length / maxLabels));

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"}${xFor(i)},${yFor(d.value)}`)
    .join(" ");
  const areaPath = `${linePath} L${xFor(data.length - 1)},${margin.top + plotHeight} L${xFor(0)},${margin.top + plotHeight} Z`;

  const handlePointerMove: React.PointerEventHandler<SVGRectElement> = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relativeX = ((e.clientX - rect.left) / rect.width) * width;
    const ratio = (relativeX - margin.left) / plotWidth;
    const index = Math.min(
      Math.max(Math.round(ratio * (data.length - 1)), 0),
      data.length - 1,
    );
    setHoveredIndex(index);
    setTooltipPos({
      x: (xFor(index) / width) * rect.width,
      y: (yFor(data[index].value) / height) * rect.height,
    });
  };

  const hovered = hoveredIndex !== null ? data[hoveredIndex] : null;
  const hoveredX = hoveredIndex !== null ? xFor(hoveredIndex) : 0;
  const hoveredY = hoveredIndex !== null ? yFor(data[hoveredIndex].value) : 0;

  return (
    <div className="relative" ref={containerRef}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label={`${yAxisLabel} over ${xAxisLabel}`}
      >
        {scale.ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={margin.left}
              x2={margin.left + plotWidth}
              y1={yFor(tick)}
              y2={yFor(tick)}
              stroke="#e2e8f0"
              strokeWidth={1}
            />
            <text
              x={margin.left - 10}
              y={yFor(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-slate-400 text-[10px]"
            >
              {valueFormatter(tick)}
            </text>
          </g>
        ))}
        <line
          x1={margin.left}
          x2={margin.left + plotWidth}
          y1={margin.top + plotHeight}
          y2={margin.top + plotHeight}
          stroke="#cbd5e1"
          strokeWidth={1}
        />

        {data.map((d, i) =>
          i % labelStride === 0 ? (
            <text
              key={d.month}
              x={xFor(i)}
              y={margin.top + plotHeight + 20}
              textAnchor="middle"
              className="fill-slate-500 text-[10px]"
            >
              {formatMonthTick(d.month)}
            </text>
          ) : null,
        )}

        <path d={areaPath} fill={NAVY} opacity={0.1} />
        <path
          d={linePath}
          fill="none"
          stroke={NAVY}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {hoveredIndex !== null && (
          <>
            <line
              x1={hoveredX}
              x2={hoveredX}
              y1={margin.top}
              y2={margin.top + plotHeight}
              stroke="#94a3b8"
              strokeWidth={1}
            />
            <circle
              cx={hoveredX}
              cy={hoveredY}
              r={4}
              fill={NAVY}
              stroke="#ffffff"
              strokeWidth={2}
            />
          </>
        )}

        <rect
          x={margin.left}
          y={margin.top}
          width={plotWidth}
          height={plotHeight}
          fill="transparent"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoveredIndex(null)}
        />
      </svg>
      <ChartTooltip x={tooltipPos.x} y={tooltipPos.y} visible={hovered !== null}>
        {hovered && (
          <>
            <TooltipValue>{valueFormatter(hovered.value)}</TooltipValue>
            <TooltipLabel>{formatMonthFull(hovered.month)}</TooltipLabel>
          </>
        )}
      </ChartTooltip>
    </div>
  );
}
