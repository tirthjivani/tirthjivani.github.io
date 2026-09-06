"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { animate, stagger, type AnimationSequence } from "motion/react";
import { useImageAspects } from "@/lib/useImageAspects";
import type { Project } from "@/data/projects";

const DEFAULT_ASPECT = 1.6;
// Expo-out: quick zoom that decelerates into a soft settle.
const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];

// Preloader steps, isolated on /preloader.
//   1. POP: every image zooms in (scale + opacity 0 → 1) at the centre, one
//      after another, stacked on top of each other.
//   2. STACK: the whole deck moves together straight down into a vertical
//      column — the first image stays on top, the rest line up below (10px gap).
// Each image keeps its own real aspect the WHOLE time, capped to fit inside an
// imaginary 240px box (largest side = 240). Size never changes between steps.
const POP_START = 0.2;
const POP_DUR = 0.45;
const POP_STAGGER = 0.2;
const SETTLE_AFTER_POP = 0.35;
const CASCADE_DUR = 0.9;

const BOX = 240; // imaginary square cap — image never exceeds this on any side
const GAP = 10;

// Fit an aspect (w/h) inside a square so the longest side is `box`.
function fitInBox(aspect: number, box: number): { w: number; h: number } {
  return aspect >= 1 ? { w: box, h: box / aspect } : { w: box * aspect, h: box };
}

type Props = { projects: Project[] };

export function PreloaderStep({ projects }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Only real project images — drop entries that fall back to a picsum
  // placeholder (video-only projects with no local webp).
  const imageProjects = useMemo(
    () => projects.filter((p) => p.image.src.startsWith("/")),
    [projects]
  );
  const aspects = useImageAspects(imageProjects);
  const ranRef = useRef(false);

  useLayoutEffect(() => {
    if (ranRef.current) return;
    const root = containerRef.current;
    if (!root) return;
    // Wait until every image has its real aspect so its on-screen size (and
    // the column layout) is final before the zoom — size must not change later.
    const allResolved =
      imageProjects.length > 0 &&
      imageProjects.every((p) => aspects[p.id] != null);
    if (!allResolved) return;

    const tiles = Array.from(root.querySelectorAll<HTMLElement>("[data-tile]"));
    if (tiles.length === 0) return;
    ranRef.current = true;
    const n = tiles.length;

    const sizes = imageProjects.map((p) =>
      fitInBox(aspects[p.id] ?? DEFAULT_ASPECT, BOX)
    );
    // Column centre-offset per tile: tile[0] at top (y:0), each later tile a
    // real-height + gap below the previous.
    const columnY: number[] = [];
    let acc = 0;
    for (let i = 0; i < n; i++) {
      if (i === 0) columnY.push(0);
      else {
        acc += sizes[i - 1].h / 2 + GAP + sizes[i].h / 2;
        columnY.push(acc);
      }
    }

    // Snap: scale 0 / opacity 0 / y 0 at centre (size is fixed in markup).
    animate(tiles, { scale: 0, opacity: 0, y: 0 }, { duration: 0 });

    const popEndsAt = POP_START + POP_STAGGER * Math.max(0, n - 1) + POP_DUR;
    const cascadeStart = popEndsAt + SETTLE_AFTER_POP;

    const segments: AnimationSequence = [];

    // Beat 1 — POP. Project order, tile[0] first at the bottom of the stack.
    segments.push([
      tiles,
      { scale: 1, opacity: 1 },
      {
        at: POP_START,
        duration: POP_DUR,
        delay: stagger(POP_STAGGER, { from: "first" }),
        ease: EASE_OUT,
      },
    ]);

    // Beat 2 — STACK. Each tile slides to its column slot. All move together
    // (same `at` + duration) so the deck travels down in equal time. tile[0]
    // keeps y:0 (stays on top); only its y is a no-op.
    for (let i = 0; i < n; i++) {
      segments.push([
        tiles[i],
        { y: columnY[i] },
        { at: cascadeStart, duration: CASCADE_DUR, ease: EASE_IN_OUT },
      ]);
    }

    const controls = animate(segments);
    return () => controls.stop();
  }, [aspects, imageProjects]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {imageProjects.map((project, idx) => {
        const { w, h } = fitInBox(aspects[project.id] ?? DEFAULT_ASPECT, BOX);
        return (
          <div
            key={project.id}
            data-tile
            data-idx={idx}
            className="absolute overflow-hidden"
            style={{
              width: w,
              height: h,
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
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        );
      })}
    </div>
  );
}
