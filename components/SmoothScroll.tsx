"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setLenis } from "@/lib/lenis";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.07,
      duration: 1.6,
      // easeOutQuint — long, gentle tail so motion settles without a hard stop
      easing: (t) => 1 - Math.pow(1 - t, 5),
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
      syncTouch: true,
    });
    setLenis(lenis);

    const onLenisScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onLenisScroll);

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.off("scroll", onLenisScroll);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
