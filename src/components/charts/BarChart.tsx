"use client";

import { useState } from "react";
import { formatByType, niceScale, type ValueFormat } from "@/lib/chart-scale";
import { ChartTooltip, TooltipLabel, TooltipValue } from "./ChartTooltip";
import { EmptyChartState } from "./EmptyChartState";

type BarDatum = { label: string; value: number };

const NAVY = "#1e3a8a";
const NAVY_HOVER = "#16296b";

function topRoundedBarPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, Math.max(height, 0));
  const bottom = y + height;
  return `M${x},${bottom} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${bottom} Z`;
}

function rightRoundedBarPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, Math.max(width, 0), height / 2);
  return `M${x},${y} L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${y + height - r} Q${x + width},${y + height} ${x + width - r},${y + height} L${x},${y + height} Z`;
}

export function BarChart({
  data,
  orientation,
  valueFormat,
  xAxisLabel,
  yAxisLabel,
}: {
  data: BarDatum[];
  orientation: "vertical" | "horizontal";
  valueFormat: ValueFormat;
  xAxisLabel: string;
  yAxisLabel: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const valueFormatter = (value: number) => formatByType(value, valueFormat);

  if (data.length === 0) {
    return <EmptyChartState />;
  }

  const maxValue = Math.max(...data.map((d) => d.value), 0);
  const scale = niceScale(maxValue, 4);

  if (orientation === "vertical") {
    const width = 560;
    const height = 300;
    const margin = { top: 16, right: 16, bottom: 44, left: 68 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const bandWidth = plotWidth / data.length;
    const barWidth = Math.min(24, bandWidth * 0.5);

    const yFor = (v: number) =>
      margin.top + plotHeight - (v / scale.max) * plotHeight;

    return (
      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          role="img"
          aria-label={`${yAxisLabel} by ${xAxisLabel}`}
        >
          {/* gridlines */}
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
          {/* baseline */}
          <line
            x1={margin.left}
            x2={margin.left + plotWidth}
            y1={margin.top + plotHeight}
            y2={margin.top + plotHeight}
            stroke="#cbd5e1"
            strokeWidth={1}
          />

          {data.map((d, i) => {
            const barHeight = (d.value / scale.max) * plotHeight;
            const x = margin.left + i * bandWidth + (bandWidth - barWidth) / 2;
            const y = margin.top + plotHeight - barHeight;
            const isHovered = hovered === i;

            return (
              <g key={d.label}>
                <path
                  d={topRoundedBarPath(x, y, barWidth, barHeight, 4)}
                  fill={isHovered ? NAVY_HOVER : NAVY}
                />
                <text
                  x={x + barWidth / 2}
                  y={y - 8}
                  textAnchor="middle"
                  className="fill-slate-600 text-[10px] font-medium"
                >
                  {valueFormatter(d.value)}
                </text>
                <text
                  x={margin.left + i * bandWidth + bandWidth / 2}
                  y={margin.top + plotHeight + 20}
                  textAnchor="middle"
                  className="fill-slate-500 text-[11px]"
                >
                  {d.label}
                </text>
                {/* hover hit target covers the full band */}
                <rect
                  x={margin.left + i * bandWidth}
                  y={margin.top}
                  width={bandWidth}
                  height={plotHeight}
                  fill="transparent"
                  onPointerEnter={(e) => {
                    setHovered(i);
                    const rect = (
                      e.currentTarget.ownerSVGElement as SVGSVGElement
                    ).getBoundingClientRect();
                    setTooltipPos({
                      x: ((x + barWidth / 2) / width) * rect.width,
                      y: (y / height) * rect.height,
                    });
                  }}
                  onPointerLeave={() => setHovered(null)}
                />
              </g>
            );
          })}
        </svg>
        <ChartTooltip
          x={tooltipPos.x}
          y={tooltipPos.y}
          visible={hovered !== null}
        >
          {hovered !== null && (
            <>
              <TooltipValue>{valueFormatter(data[hovered].value)}</TooltipValue>
              <TooltipLabel>{data[hovered].label}</TooltipLabel>
            </>
          )}
        </ChartTooltip>
      </div>
    );
  }

  // Horizontal orientation
  const width = 600;
  const rowHeight = 26;
  const margin = { top: 8, right: 56, bottom: 32, left: 132 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = data.length * rowHeight;
  const height = margin.top + plotHeight + margin.bottom;
  const barThickness = Math.min(18, rowHeight * 0.6);

  const xFor = (v: number) => (v / scale.max) * plotWidth;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label={`${yAxisLabel} by ${xAxisLabel}`}
      >
        {/* gridlines */}
        {scale.ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={margin.left + xFor(tick)}
              x2={margin.left + xFor(tick)}
              y1={margin.top}
              y2={margin.top + plotHeight}
              stroke="#e2e8f0"
              strokeWidth={1}
            />
            <text
              x={margin.left + xFor(tick)}
              y={margin.top + plotHeight + 18}
              textAnchor="middle"
              className="fill-slate-400 text-[10px]"
            >
              {valueFormatter(tick)}
            </text>
          </g>
        ))}
        {/* baseline */}
        <line
          x1={margin.left}
          x2={margin.left}
          y1={margin.top}
          y2={margin.top + plotHeight}
          stroke="#cbd5e1"
          strokeWidth={1}
        />

        {data.map((d, i) => {
          const barWidth = xFor(d.value);
          const y = margin.top + i * rowHeight + (rowHeight - barThickness) / 2;
          const isHovered = hovered === i;

          return (
            <g key={d.label}>
              <text
                x={margin.left - 10}
                y={y + barThickness / 2}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-slate-600 text-[11px]"
              >
                {d.label}
              </text>
              <path
                d={rightRoundedBarPath(margin.left, y, barWidth, barThickness, 4)}
                fill={isHovered ? NAVY_HOVER : NAVY}
              />
              <text
                x={margin.left + barWidth + 8}
                y={y + barThickness / 2}
                dominantBaseline="middle"
                className="fill-slate-600 text-[10px] font-medium"
              >
                {valueFormatter(d.value)}
              </text>
              <rect
                x={margin.left}
                y={margin.top + i * rowHeight}
                width={plotWidth}
                height={rowHeight}
                fill="transparent"
                onPointerEnter={(e) => {
                  setHovered(i);
                  const rect = (
                    e.currentTarget.ownerSVGElement as SVGSVGElement
                  ).getBoundingClientRect();
                  setTooltipPos({
                    x: ((margin.left + barWidth / 2) / width) * rect.width,
                    y: (y / height) * rect.height,
                  });
                }}
                onPointerLeave={() => setHovered(null)}
              />
            </g>
          );
        })}
      </svg>
      <ChartTooltip x={tooltipPos.x} y={tooltipPos.y} visible={hovered !== null}>
        {hovered !== null && (
          <>
            <TooltipValue>{valueFormatter(data[hovered].value)}</TooltipValue>
            <TooltipLabel>{data[hovered].label}</TooltipLabel>
          </>
        )}
      </ChartTooltip>
    </div>
  );
}
