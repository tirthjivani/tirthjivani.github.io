"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  activeIndex: number;
  total: number;
};

const SIZE = 56;
const DOT = 6;
const RADIUS = 22;

export function Compass({ activeIndex, total }: Props) {
  const step = total > 0 ? 360 / total : 0;
  const lastIndexRef = useRef(activeIndex);
  const [cumulative, setCumulative] = useState(activeIndex);

  useEffect(() => {
    if (total <= 0) return;
    const prev = lastIndexRef.current;
    if (prev === activeIndex) return;
    let delta = activeIndex - prev;
    if (delta > total / 2) delta -= total;
    else if (delta < -total / 2) delta += total;
    lastIndexRef.current = activeIndex;
    setCumulative((c) => c + delta);
  }, [activeIndex, total]);

  const ringRotation = -90 + step * cumulative;

  return (
    <div
      aria-hidden
      className="pointer-events-none"
      style={{ width: SIZE, height: SIZE }}
    >
      <div
        className="relative h-full w-full transition-transform duration-500 ease-out"
        style={{ transform: `rotate(${ringRotation}deg)` }}
      >
        {Array.from({ length: total }, (_, i) => {
          const angle = -step * i;
          const rad = (angle * Math.PI) / 180;
          const x = Math.sin(rad) * RADIUS;
          const y = -Math.cos(rad) * RADIUS;
          const isActive = i === activeIndex;

          return (
            <span
              key={i}
              className="absolute left-1/2 top-1/2 rounded-full transition-colors duration-300 ease-out"
              style={{
                width: DOT,
                height: DOT,
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                border: isActive ? "1px solid #fff" : "1px solid rgba(255,255,255,0.3)",
                background: isActive ? "#fff" : "transparent",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
