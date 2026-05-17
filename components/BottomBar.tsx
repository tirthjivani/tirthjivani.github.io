"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate } from "motion/react";
import type { ViewMode } from "./Navbar";
import type { ImageEntry, Project } from "@/data/projects";
import { CharReveal } from "./CharReveal";

const EASE_OUT: [number, number, number, number] = [0, 0, 0.58, 1];
const EASE_IN_OUT: [number, number, number, number] = [0.42, 0, 0.58, 1];

type Props = {
  view: ViewMode;
  onViewChange: (next: ViewMode) => void;
  activeProject: Project | undefined;
  activeImage: ImageEntry | undefined;
  activeIndex: number;
  total: number;
  hoveredProject?: Project | null;
  hoveredIndex?: number | null;
  introReady?: boolean;
};

// Animated text swap — exit (y: 0 → -4, opacity 1 → 0), then enter
// (y: 4 → 0, opacity 0 → 1). Mirrors Framer's AnimatePresence mode="wait".
function SwapText({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const elRef = useRef<HTMLSpanElement>(null);
  const pending = useRef<string | null>(null);
  const animating = useRef(false);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    if (value === display) return;
    const el = elRef.current;
    if (!el) {
      setDisplay(value);
      return;
    }
    if (animating.current) {
      pending.current = value;
      return;
    }

    const playSwap = (next: string) => {
      animating.current = true;
      const exit = animate(
        el,
        { y: -4, opacity: 0 },
        { duration: 0.2, ease: EASE_OUT }
      );
      exit
        .then(() => {
          setDisplay(next);
          const enter = animate(
            el,
            { y: [4, 0], opacity: [0, 1] },
            { duration: 0.2, ease: EASE_OUT }
          );
          enter
            .then(() => {
              animating.current = false;
              if (pending.current !== null && pending.current !== next) {
                const p = pending.current;
                pending.current = null;
                playSwap(p);
              }
            })
            .catch(() => {});
        })
        .catch(() => {});
    };

    playSwap(value);
  }, [value, display]);

  return (
    <span className="relative inline-flex">
      <span
        ref={elRef}
        className={`inline-block whitespace-nowrap ${className ?? ""}`}
      >
        {display}
      </span>
    </span>
  );
}

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-[10px] whitespace-nowrap text-[14px] leading-none">
      <span className="text-white/30">{label}</span>
      <SwapText value={value} />
    </div>
  );
}

// Fade-in / fade-out presence, mounted while exit plays.
function useFadePresence(visible: boolean, duration = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) setMounted(true);
  }, [visible]);

  useLayoutEffect(() => {
    if (!mounted || !ref.current) return;
    if (visible) {
      const controls = animate(
        ref.current,
        { opacity: [0, 1] },
        { duration, ease: EASE_IN_OUT }
      );
      return () => {
        controls.stop();
      };
    }
    const controls = animate(
      ref.current,
      { opacity: 0 },
      { duration, ease: EASE_IN_OUT }
    );
    controls.then(() => setMounted(false)).catch(() => {});
    return () => {
      controls.stop();
    };
  }, [visible, mounted, duration]);

  return { ref, mounted };
}

export function BottomBar({
  view,
  onViewChange,
  hoveredProject,
  introReady = true,
}: Props) {
  const isGridHover = view === "index" && !!hoveredProject;

  const chromeProject = isGridHover ? hoveredProject : null;
  const chromeImage = isGridHover ? hoveredProject?.image : null;

  const visible = !!(chromeProject && chromeImage);
  const presence = useFadePresence(visible, 0.3);

  const titleKey = isGridHover
    ? `hover-${chromeProject?.id ?? ""}`
    : chromeProject?.id ?? "";
  const titleText = chromeProject
    ? isGridHover
      ? chromeProject.title
      : chromeProject.impact ?? ""
    : "";
  const titleClass = isGridHover
    ? "text-[24px] leading-none"
    : "text-[14px] leading-[1.4]";

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
        className="pointer-events-auto absolute bottom-0 left-[20px] flex gap-[10px] text-[14px] leading-none tracking-[-0.03em] text-white"
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
          onClick={() => onViewChange("index")}
          className={`hidden transition-colors duration-150 ease-in-out md:inline-block ${
            view === "index"
              ? "text-white"
              : "text-white/30 hover:text-white/50 active:text-white/20"
          }`}
        >
          <CharReveal visible={introReady} delay={1.1}>
            Grid
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
          className="pointer-events-none absolute bottom-0 right-[20px] text-[14px] leading-none tracking-[-0.03em] text-white/60"
          style={{ mixBlendMode: "difference" }}
        >
          <CharReveal visible={introReady} delay={1.3}>
            (Scroll or drag)
          </CharReveal>
        </div>
      )}

      <div className="grid min-h-[80px] grid-cols-12 items-end px-[20px] text-[14px] leading-none tracking-[-0.03em] text-white">
        {presence.mounted && chromeProject && chromeImage && (
          <div ref={presence.ref} className="contents" style={{ opacity: 0 }}>
            <div className="col-start-4 col-span-3 max-w-[260px]">
              <ChromeTitle
                keyId={titleKey}
                text={titleText}
                className={titleClass}
              />
            </div>

            <div className="col-start-7 col-span-3 flex flex-col gap-[10px]">
              <Pair label="Role" value={chromeImage.role} />
              <Pair label="Category" value={chromeImage.category} />
            </div>

            <div className="col-start-10 col-span-2 flex flex-col gap-[10px]">
              <Pair label="Client" value={chromeImage.client} />
              <Pair label="Year" value={chromeImage.year} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Inner title that animates on key/text change.
function ChromeTitle({
  keyId,
  text,
  className,
}: {
  keyId: string;
  text: string;
  className?: string;
}) {
  const elRef = useRef<HTMLParagraphElement>(null);
  const [display, setDisplay] = useState({ key: keyId, text });
  const animating = useRef(false);
  const pending = useRef<{ key: string; text: string } | null>(null);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    if (display.key === keyId) {
      if (display.text !== text) setDisplay({ key: keyId, text });
      return;
    }
    const el = elRef.current;
    if (!el) {
      setDisplay({ key: keyId, text });
      return;
    }
    if (animating.current) {
      pending.current = { key: keyId, text };
      return;
    }
    const runSwap = (next: { key: string; text: string }) => {
      animating.current = true;
      const exit = animate(
        el,
        { y: -4, opacity: 0 },
        { duration: 0.2, ease: EASE_OUT }
      );
      exit
        .then(() => {
          setDisplay(next);
          const enter = animate(
            el,
            { y: [4, 0], opacity: [0, 1] },
            { duration: 0.2, ease: EASE_OUT }
          );
          enter
            .then(() => {
              animating.current = false;
              if (pending.current && pending.current.key !== next.key) {
                const p = pending.current;
                pending.current = null;
                runSwap(p);
              }
            })
            .catch(() => {});
        })
        .catch(() => {});
    };
    runSwap({ key: keyId, text });
  }, [keyId, text, display.key, display.text]);

  return (
    <p ref={elRef} className={className}>
      {display.text}
    </p>
  );
}
