"use client";

import { useEffect, useRef } from "react";
import { animate } from "motion/react";

export function BottomBlur() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const controls = animate(
      ref.current,
      { opacity: [0, 1] },
      { duration: 0.3, ease: [0.42, 0, 0.58, 1] }
    );
    return () => {
      controls.stop();
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      style={{ opacity: 0 }}
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-20 hidden h-[240px] md:block"
    >
      <div
        className="absolute inset-0 backdrop-blur-[2px]"
        style={{
          WebkitMaskImage:
            "linear-gradient(to top, black 55%, transparent 100%)",
          maskImage: "linear-gradient(to top, black 55%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-0 backdrop-blur-[8px]"
        style={{
          WebkitMaskImage:
            "linear-gradient(to top, black 25%, transparent 70%)",
          maskImage: "linear-gradient(to top, black 25%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 backdrop-blur-[18px]"
        style={{
          WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 40%)",
          maskImage: "linear-gradient(to top, black 0%, transparent 40%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, var(--blur-fade) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
