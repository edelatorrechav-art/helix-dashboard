"use client";

import { useEffect, useRef, useState } from "react";

// Charts author gridlines/text at a fixed pixel scale, so the SVG's viewBox
// needs to track the container's real width - otherwise a viewBox sized for
// a ~600-900px desktop card gets squeezed to a ~300px mobile card and every
// label shrinks with it (observed as low as ~3px rendered text on mobile).
// The fallback is used for the server render and the first client paint
// (before ResizeObserver can measure anything), so SSR output stays stable.
export function useElementWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const measured = entries[0]?.contentRect.width;
      if (measured && measured > 0) setWidth(measured);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}
