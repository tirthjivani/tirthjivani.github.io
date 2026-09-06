"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { animate, stagger, type AnimationSequence } from "motion/react";
import { useImageAspects } from "@/lib/useImageAspects";
import { sizeForAspect } from "@/lib/sizeForAspect";
import type { Project } from "@/data/projects";

const DEFAULT_ASPECT = 1.6;
const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];

// Exact /preloader flow, used as the home intro overlay:
//   1. POP   — every project image zooms in (scale + opacity 0 → 1, expo-out)
//              at the centre, one after another, stacked on top of each other
//              inside an imaginary 240px square box (full colour).
//   2. STACK — the whole deck moves together (no stagger, equal time) into a
//              vertical column: the default project stays on top, the rest line
//              up below (10px gap).
//   3. LOOP  — the column scrolls one full cycle until the default is back at
//              centre. Chrome reveals over this window, then the overlay
//              cross-fades into the live list.
const POP_START = 0.2;
const POP_DUR = 0.45;
const POP_STAGGER = 0.2;
const SETTLE_AFTER_POP = 0.35;
const STACK_DUR = 0.9;
const SETTLE_AFTER_STACK = 0.3;
const LOOP_DUR = 1.8;
const FADE_DUR = 0.5;

const GAP = 10; // matches ListView's GAP so the column lines up identically

type Props = {
  projects: Project[];
  onReveal?: () => void; // loop starts → reveal site chrome
  onDone?: () => void; // overlay finished → drop it, show live list
};

export function IntroOverlay({ projects, onReveal, onDone }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Only real local project images (videos excluded — they don't resolve a
  // reliable aspect in every browser and aren't needed for the intro). Stable
  // ref via useMemo so the run effect doesn't churn.
  const items = useMemo(
    () => projects.filter((p) => p.image.src.startsWith("/")),
    [projects]
  );
  const aspects = useImageAspects(items);
  const onRevealRef = useRef(onReveal);
  onRevealRef.current = onReveal;
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  // Start as soon as the FIRST tile can be drawn, not when all ~15 images have
  // finished downloading. The pop is staggered POP_STAGGER apart, so tile i
  // isn't needed on screen until POP_START + i * POP_STAGGER — by then the
  // rest have streamed in behind it. Waiting for the whole set meant a cold
  // load sat on a blank screen for as long as the slowest image took.
  //
  // Sizes come from the baked seed dimensions (see useImageAspects), so layout
  // needs no network at all; this gate is purely about having pixels to show.
  const sized = items.length > 0 && aspects[items[0].id] != null;
  const [firstDecoded, setFirstDecoded] = useState(false);
  const [fallback, setFallback] = useState(false);
  const firstSrc = items[0]?.image.src;

  useEffect(() => {
    if (!firstSrc) return;
    let cancelled = false;
    const img = new window.Image();
    img.fetchPriority = "high";
    const done = () => {
      if (!cancelled) setFirstDecoded(true);
    };
    img.onload = done;
    // A broken lead image must not hold the intro hostage.
    img.onerror = done;
    img.src = firstSrc;
    if (img.complete) done();
    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [firstSrc]);

  // Hard cap, so a stalled network still gets an intro rather than a black
  // screen.
  useEffect(() => {
    const t = window.setTimeout(() => setFallback(true), 1200);
    return () => window.clearTimeout(t);
  }, []);

  const ready = sized && (firstDecoded || fallback);

  useLayoutEffect(() => {
    if (!ready) return;
    const container = containerRef.current;
    const wrapper = wrapperRef.current;
    if (!container || !wrapper) return;

    const a = Array.from(wrapper.querySelectorAll<HTMLElement>('[data-copy="a"]'));
    const b = Array.from(wrapper.querySelectorAll<HTMLElement>('[data-copy="b"]'));
    const n = a.length;
    if (n === 0) return;

    const sizes = items.map((p) => sizeForAspect(aspects[p.id] ?? DEFAULT_ASPECT));
    // Column centre-offset per tile (tile0 at 0; each later tile its real
    // height + gap below the previous) and the full one-cycle span.
    const colY: number[] = [];
    let acc = 0;
    for (let i = 0; i < n; i++) {
      if (i === 0) colY.push(0);
      else {
        acc += sizes[i - 1].h / 2 + GAP + sizes[i].h / 2;
        colY.push(acc);
      }
    }
    const span = acc + sizes[n - 1].h / 2 + GAP + sizes[0].h / 2;

    // Snap. Copy A: stacked at centre, scale 0 / opacity 0 (will pop in).
    // Copy B: one full cycle below, already full-size (scrolls in on loop).
    animate(a, { y: 0, scale: 0, opacity: 0 }, { duration: 0 });
    b.forEach((tile, i) =>
      animate(tile, { y: colY[i] + span, scale: 1, opacity: 1 }, { duration: 0 })
    );

    const popEndsAt = POP_START + POP_STAGGER * Math.max(0, n - 1) + POP_DUR;
    const stackStart = popEndsAt + SETTLE_AFTER_POP;
    const loopStart = stackStart + STACK_DUR + SETTLE_AFTER_STACK;

    const segments: AnimationSequence = [];

    // Beat 1 — POP (copy A), project order, tile0 first.
    segments.push([
      a,
      { scale: 1, opacity: 1 },
      {
        at: POP_START,
        duration: POP_DUR,
        delay: stagger(POP_STAGGER, { from: "first" }),
        ease: EASE_OUT,
      },
    ]);

    // Beat 2 — STACK (copy A) into the column, all together (equal time).
    for (let i = 0; i < n; i++) {
      segments.push([
        a[i],
        { y: colY[i] },
        { at: stackStart, duration: STACK_DUR, ease: EASE_IN_OUT },
      ]);
    }

    // Beat 3 — LOOP. Translate the wrapper up one full cycle so copy B's
    // default lands at centre (identical image → one seamless loop).
    segments.push([
      wrapper,
      { y: -span },
      { at: loopStart, duration: LOOP_DUR, ease: EASE_IN_OUT },
    ]);

    // Reveal chrome the moment the loop starts.
    const revealTimer = window.setTimeout(() => {
      onRevealRef.current?.();
    }, loopStart * 1000);

    const controls = animate(segments);
    controls
      .then(() =>
        animate(container, { opacity: 0 }, { duration: FADE_DUR, ease: EASE_IN_OUT })
      )
      .then(() => {
        onDoneRef.current?.();
      })
      .catch(() => {});

    return () => {
      controls.stop();
      window.clearTimeout(revealTimer);
    };
    // Run exactly once, when `ready` flips true. aspects/items are snapshotted
    // inside; excluding them keeps a later aspect update from cancelling the
    // running animation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const renderCopy = (copy: "a" | "b") =>
    items.map((project, idx) => {
      const { w, h } = sizeForAspect(aspects[project.id] ?? DEFAULT_ASPECT);
      return (
        <div
          key={`${copy}-${project.id}`}
          data-copy={copy}
          className="absolute left-1/2 top-1/2 overflow-hidden"
          style={{
            width: w,
            height: h,
            marginLeft: -w / 2,
            marginTop: -h / 2,
            zIndex: idx + 1,
            opacity: 0,
            transform: "scale(0)",
            willChange: "transform, opacity",
          }}
        >
          <img
            src={project.image.src}
            alt={project.title}
            decoding="async"
            draggable={false}
            // Copy A pops first and is all the user can see; copy B only
            // matters once the loop beat starts, seconds later. (Both copies
            // share one request per URL.)
            fetchPriority={copy === "a" && idx < 4 ? "high" : "low"}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      );
    });

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-10 overflow-hidden"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div ref={wrapperRef} className="absolute inset-0">
        {renderCopy("a")}
        {renderCopy("b")}
      </div>
    </div>
  );
}
