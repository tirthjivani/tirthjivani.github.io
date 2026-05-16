"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { EASE_IN_OUT } from "@/lib/gsap/eases";

export function BottomBlur() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const tween = gsap.fromTo(
      ref.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: EASE_IN_OUT }
    );
    return () => {
      tween.kill();
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
            "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)",
        }}
      />
    </div>
  );
}
