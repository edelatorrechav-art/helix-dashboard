"use client";

import type { ReactNode } from "react";

export function ChartTooltip({
  x,
  y,
  visible,
  children,
}: {
  x: number;
  y: number;
  visible: boolean;
  children: ReactNode;
}) {
  if (!visible) return null;
  return (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg"
      style={{ left: x, top: y - 10 }}
    >
      {children}
    </div>
  );
}

export function TooltipValue({ children }: { children: ReactNode }) {
  return <div className="text-sm font-semibold text-white">{children}</div>;
}

export function TooltipLabel({ children }: { children: ReactNode }) {
  return <div className="text-[11px] text-slate-300">{children}</div>;
}
