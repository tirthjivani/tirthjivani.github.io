"use client";

import { useEffect, useRef } from "react";
import type { ParallaxState } from "../rigContext";

export function useParallax() {
  const ref = useRef<ParallaxState>({
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
  });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      ref.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      ref.current.targetY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onLeave = () => {
      ref.current.targetX = 0;
      ref.current.targetY = 0;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return ref;
}
