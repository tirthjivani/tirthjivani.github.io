"use client";

import type { ViewMode } from "./Navbar";
import { CharReveal } from "./CharReveal";

type Props = {
  view: ViewMode;
  onViewChange: (next: ViewMode) => void;
  introReady?: boolean;
};

export function BottomBar({
  view,
  onViewChange,
  introReady = true,
}: Props) {
  return (
    <div
      className="pointer-events-none fixed bottom-[20px] left-0 right-0 z-30"
      style={{
        transform: introReady ? "translateY(0)" : "translateY(140%)",
        opacity: introReady ? 1 : 0,
        transition:
          "transform 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.6s, opacity 0.8s ease-out 0.6s",
      }}
    >
      <div
        className="pointer-events-auto absolute bottom-0 left-[20px] flex gap-[10px] text-[13px] leading-none tracking-[-0.03em] text-white"
        style={{ mixBlendMode: "difference" }}
      >
        <button
          type="button"
          onClick={() => onViewChange("list")}
          className={`transition-colors duration-150 ease-in-out ${
            view === "list"
              ? "text-white"
              : "text-white/30 hover:text-white/50 active:text-white/20"
          }`}
        >
          <CharReveal visible={introReady} delay={1.0}>
            Vertical
          </CharReveal>
        </button>
        <button
          type="button"
          onClick={() => onViewChange("surf")}
          className={`transition-colors duration-150 ease-in-out ${
            view === "surf"
              ? "text-white"
              : "text-white/30 hover:text-white/50 active:text-white/20"
          }`}
        >
          <CharReveal visible={introReady} delay={1.2}>
            Surf
          </CharReveal>
        </button>
      </div>

      {view === "surf" && (
        <div
          className="pointer-events-none absolute bottom-0 right-[20px] text-[13px] leading-none tracking-[-0.03em] text-white/60"
          style={{ mixBlendMode: "difference" }}
        >
          <CharReveal visible={introReady} delay={1.3}>
            (Scroll or drag)
          </CharReveal>
        </div>
      )}
    </div>
  );
}
