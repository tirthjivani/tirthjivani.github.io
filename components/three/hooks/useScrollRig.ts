"use client";

import { useEffect, useRef } from "react";
import type { ScrollState } from "../rigContext";
import { getLenis } from "@/lib/lenis";

/**
 * Scroll rig in "logical cycles" — `target` is unbounded scroll progress
 * measured in cycles (1 unit = one gallery cycle). Programmatic scroll
 * jumps that exceed half a cycle (i.e. the surf wrap) are detected and
 * subtracted so the smoothed `current` value remains continuous across
 * the wrap. Caller smooths target → current per frame.
 */
export function useScrollRig(cyclePx: number) {
  const ref = useRef<ScrollState>({ target: 0, current: 0, velocity: 0 });
  const lastY = useRef<number | null>(null);

  useEffect(() => {
    lastY.current = typeof window !== "undefined" ? window.scrollY : 0;

    const onScroll = () => {
      if (cyclePx <= 0) return;
      const y = window.scrollY;
      const prev = lastY.current ?? y;
      let dy = y - prev;
      if (Math.abs(dy) > cyclePx * 0.5) {
        dy -= Math.sign(dy) * cyclePx;
      }
      ref.current.target += dy / cyclePx;
      lastY.current = y;
    };

    const onResize = () => {
      lastY.current = window.scrollY;
    };

    const lenis = getLenis();
    if (lenis) {
      lenis.on("scroll", onScroll);
      window.addEventListener("resize", onResize);
      return () => {
        lenis.off("scroll", onScroll);
        window.removeEventListener("resize", onResize);
      };
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [cyclePx]);

  return ref;
}
