"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

type Props = {
  src: string;
  /** Tailwind width classes (responsive ok), e.g. "w-[80vw] md:w-[45vw]" */
  className?: string;
  /** parallax drift (px) — image moves ± this across its scroll range */
  drift?: number;
};

// Contained parallax image: horizontally centered, grayscale with a mode-aware
// tint, drifts slowly on scroll, and reveals full colour on hover.
export function ParallaxBg({ src, className = "w-[45vw]", drift = 60 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-drift, drift]);

  return (
    <div ref={ref} className={`mx-auto ${className}`}>
      <motion.div style={{ y }} className="relative overflow-hidden">
        <img
          src={src}
          alt=""
          aria-hidden
          draggable={false}
          className="block w-full grayscale"
        />
        {/* Mode-aware tint: darkens in dark mode / lightens in light mode. */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{ backgroundColor: "var(--bg)" }}
        />
      </motion.div>
    </div>
  );
}
