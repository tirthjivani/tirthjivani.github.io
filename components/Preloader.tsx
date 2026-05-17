"use client";

import { useEffect } from "react";
import { getLenis } from "@/lib/lenis";

type Props = {
  onDone?: () => void;
};

/**
 * A passive overlay that blocks interaction during the intro animation.
 * The actual tile animation runs inside ListView (so the same image
 * elements are reused — no cross-fade between two stacks). PortfolioView
 * fires onDone when ListView's intro completes; this component just owns
 * the click-blocker + scroll lock for the duration.
 */
export function Preloader({ onDone: _onDone }: Props) {
  useEffect(() => {
    const lenis = getLenis();
    lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      lenis?.start();
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-[100] bg-transparent"
      aria-hidden
    />
  );
}
