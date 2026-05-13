"use client";

type Props = {
  activeIndex: number;
  total: number;
};

const SIZE = 96;
const DOT = 10;
const RADIUS = 40;

export function Compass({ activeIndex, total }: Props) {
  const step = total > 0 ? 360 / total : 0;
  const ringRotation = -90 + step * activeIndex;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-[20px] right-[20px] z-30 hidden md:block"
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
