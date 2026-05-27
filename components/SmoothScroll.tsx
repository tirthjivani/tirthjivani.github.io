"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { setLenis } from "@/lib/lenis";

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      // Smooth wheel through Lenis — gentle lerp, long easeOutQuint tail so
      // motion never stops abruptly. The snap layer in ListView handles
      // centring once the user lets go.
      lerp: 0.085,
      duration: 1.4,
      easing: (t) => 1 - Math.pow(1 - t, 5),
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
      syncTouch: true,
    });
    setLenis(lenis);

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
