"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { ViewMode } from "./Navbar";
import type { ImageEntry, Project } from "@/data/projects";
import { EASE_OUT, EASE_IN_OUT } from "@/lib/gsap/eases";

type Props = {
  view: ViewMode;
  onViewChange: (next: ViewMode) => void;
  activeProject: Project | undefined;
  activeImage: ImageEntry | undefined;
  activeIndex: number;
  total: number;
  hoveredProject?: Project | null;
  hoveredIndex?: number | null;
};

// Animated text swap that mirrors Framer's <AnimatePresence mode="wait" initial={false}>
// with enter (y: 4 → 0, opacity 0 → 1) and exit (y: 0 → -4, opacity 1 → 0), 0.2s easeOut each.
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
    animating.current = true;
    pending.current = null;
    gsap.to(el, {
      y: -4,
      opacity: 0,
      duration: 0.2,
      ease: EASE_OUT,
      onComplete: () => {
        setDisplay(value);
        gsap.fromTo(
          el,
          { y: 4, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.2,
            ease: EASE_OUT,
            onComplete: () => {
              animating.current = false;
              if (pending.current !== null && pending.current !== value) {
                const next = pending.current;
                pending.current = null;
                setDisplay((d) => {
                  if (d === next) return d;
                  // trigger another swap on next render via state change of `value`
                  return d;
                });
                // re-run sequence for the latest pending value
                animating.current = true;
                gsap.to(el, {
                  y: -4,
                  opacity: 0,
                  duration: 0.2,
                  ease: EASE_OUT,
                  onComplete: () => {
                    setDisplay(next);
                    gsap.fromTo(
                      el,
                      { y: 4, opacity: 0 },
                      {
                        y: 0,
                        opacity: 1,
                        duration: 0.2,
                        ease: EASE_OUT,
                        onComplete: () => {
                          animating.current = false;
                        },
                      }
                    );
                  },
                });
              }
            },
          }
        );
      },
    });
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

// AnimatePresence-style fade-in / fade-out, mounted while exit plays.
function useFadePresence(visible: boolean, duration = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) setMounted(true);
  }, [visible]);

  useLayoutEffect(() => {
    if (!mounted || !ref.current) return;
    if (visible) {
      const tween = gsap.fromTo(
        ref.current,
        { opacity: 0 },
        { opacity: 1, duration, ease: EASE_IN_OUT }
      );
      return () => {
        tween.kill();
      };
    }
    const tween = gsap.to(ref.current, {
      opacity: 0,
      duration,
      ease: EASE_IN_OUT,
      onComplete: () => setMounted(false),
    });
    return () => {
      tween.kill();
    };
  }, [visible, mounted, duration]);

  return { ref, mounted };
}

export function BottomBar({
  view,
  onViewChange,
  hoveredProject,
}: Props) {
  const isGridHover = view === "index" && !!hoveredProject;

  // List view now renders its own mid-vertical metadata + compass inside ListView.
  // BottomBar's chrome only surfaces on Grid hover.
  const chromeProject = isGridHover ? hoveredProject : null;
  const chromeImage = isGridHover ? hoveredProject?.image : null;

  const visible = !!(chromeProject && chromeImage);
  const presence = useFadePresence(visible, 0.3);

  // Inner title key: enter/exit on switching hover-mode vs list-mode title content.
  const titleKey = isGridHover
    ? `hover-${chromeProject?.id ?? ""}`
    : chromeProject?.id ?? "";
  const titleText = chromeProject
    ? isGridHover
      ? chromeProject.title
      : chromeProject.impact ?? ""
    : "";
  const titleClass = isGridHover ? "text-[24px] leading-none" : "text-[14px] leading-[1.4]";

  return (
    <div className="pointer-events-none fixed bottom-[20px] left-0 right-0 z-30">
      <div
        className="pointer-events-auto absolute bottom-0 left-[20px] flex gap-[10px] text-[14px] leading-none tracking-[-0.03em] text-white"
        style={{ mixBlendMode: "difference" }}
      >
        <button
          type="button"
          onClick={() => onViewChange("list")}
          className={`transition-colors duration-150 ease-in-out ${
            view === "list" ? "text-white" : "text-white/30 hover:text-white/50 active:text-white/20"
          }`}
        >
          Vertical
        </button>
        <button
          type="button"
          onClick={() => onViewChange("index")}
          className={`hidden transition-colors duration-150 ease-in-out md:inline-block ${
            view === "index" ? "text-white" : "text-white/30 hover:text-white/50 active:text-white/20"
          }`}
        >
          Grid
        </button>
        <button
          type="button"
          onClick={() => onViewChange("surf")}
          className={`transition-colors duration-150 ease-in-out ${
            view === "surf" ? "text-white" : "text-white/30 hover:text-white/50 active:text-white/20"
          }`}
        >
          Surf
        </button>
      </div>

      {view === "surf" && (
        <div
          className="pointer-events-none absolute bottom-0 right-[20px] text-[14px] leading-none tracking-[-0.03em] text-white/60"
          style={{ mixBlendMode: "difference" }}
        >
          (Scroll or drag)
        </div>
      )}

      <div className="grid min-h-[80px] grid-cols-12 items-end px-[20px] text-[14px] leading-none tracking-[-0.03em] text-white">
        {presence.mounted && chromeProject && chromeImage && (
          <div ref={presence.ref} className="contents" style={{ opacity: 0 }}>
            <div className="col-start-4 col-span-3 max-w-[260px]">
              <ChromeTitle keyId={titleKey} text={titleText} className={titleClass} />
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
      gsap.to(el, {
        y: -4,
        opacity: 0,
        duration: 0.2,
        ease: EASE_OUT,
        onComplete: () => {
          setDisplay(next);
          gsap.fromTo(
            el,
            { y: 4, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.2,
              ease: EASE_OUT,
              onComplete: () => {
                animating.current = false;
                if (pending.current && pending.current.key !== next.key) {
                  const p = pending.current;
                  pending.current = null;
                  runSwap(p);
                }
              },
            }
          );
        },
      });
    };
    runSwap({ key: keyId, text });
  }, [keyId, text, display.key, display.text]);

  return (
    <p ref={elRef} className={className}>
      {display.text}
    </p>
  );
}
