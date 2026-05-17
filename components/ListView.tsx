"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { animate, stagger } from "motion/react";
import { getLenis } from "@/lib/lenis";
import { getProjectAction } from "@/lib/projectAction";
import { useImageAspects } from "@/lib/useImageAspects";
import { Compass } from "./Compass";
import { sizeForAspect } from "@/lib/sizeForAspect";
import type { Project } from "@/data/projects";

const COPIES = 3;
const MIDDLE = 1;
const GAP = 20;
const DEFAULT_ASPECT = 1.6;

type Cursor = { x: number; y: number; text: string } | null;

type Props = {
  projects: Project[];
  activeIndex: number;
  onActiveChange: (idx: number) => void;
  introReady?: boolean;
  intro?: boolean;
  onIntroDone?: () => void;
};

function jumpTo(y: number) {
  if (typeof window === "undefined") return;
  // Force native scroll synchronously — lenis.scrollTo can defer to its next
  // raf even with immediate:true, which is too late for downstream layout
  // measurements in the same render commit.
  window.scrollTo(0, y);
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(y, { immediate: true });
}

function ProjectSection({
  project,
  aspect,
  idx,
  copy,
  isActive,
  introActive,
  onClick,
  setCursor,
}: {
  project: Project;
  aspect: number;
  idx: number;
  copy: number;
  isActive: boolean;
  introActive: boolean;
  onClick: () => void;
  setCursor: (c: Cursor) => void;
}) {
  const action = getProjectAction(project);
  const { w, h } = sizeForAspect(aspect);

  // While the intro timeline is running, Motion owns transform / scale /
  // filter on this tile. Start at scale 0 so the SSR / pre-hydration frame
  // doesn't flash the natural flow position before Motion can set the stack.
  // Opacity stays at 1 throughout so the zoom-in scale effect is visible.
  const introStyles = introActive
    ? {
        transform: "scale(0)",
        filter: "grayscale(1)" as const,
        willChange: "transform, filter" as const,
      }
    : {
        transform: "scaleY(var(--list-vel-scale, 1))",
        filter: isActive ? "grayscale(0)" : "grayscale(1)",
        transition: "filter 0.45s ease-out",
        willChange: "transform, filter" as const,
      };

  return (
    <section
      className="relative flex items-center justify-center"
      style={{ height: h, marginBottom: GAP }}
    >
      <div
        data-tile
        data-tile-copy={copy}
        data-tile-index={idx}
        style={{
          width: w,
          height: h,
          ...introStyles,
        }}
        className={`relative overflow-hidden bg-[#0b0b0b] ${
          action ? "cursor-pointer" : ""
        }`}
        onClick={action ? onClick : undefined}
        onMouseEnter={(e) =>
          action && setCursor({ x: e.clientX, y: e.clientY, text: action.text })
        }
        onMouseMove={(e) =>
          action && setCursor({ x: e.clientX, y: e.clientY, text: action.text })
        }
        onMouseLeave={() => setCursor(null)}
        aria-label={project.title}
      >
        {project.video ? (
          <video
            src={project.video}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <img
            src={project.image.src}
            alt={project.title}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>
    </section>
  );
}

export function ListView({
  projects,
  activeIndex,
  onActiveChange,
  introReady = true,
  intro = false,
  onIntroDone,
}: Props) {
  const total = projects.length;
  const adjustingRef = useRef(false);
  const router = useRouter();
  const [cursor, setCursor] = useState<Cursor>(null);
  const [mounted, setMounted] = useState(false);
  const [introActive, setIntroActive] = useState(intro);
  const initialActiveRef = useRef(activeIndex);

  const aspects = useImageAspects(projects);

  // Per-project image heights and their tops within one copy (height + 10px gap each).
  const { sectionTops, copyH } = useMemo(() => {
    const tops: number[] = [];
    let acc = 0;
    projects.forEach((p) => {
      tops.push(acc);
      const h = sizeForAspect(aspects[p.id] ?? DEFAULT_ASPECT).h;
      acc += h + GAP;
    });
    return { sectionTops: tops, copyH: acc };
  }, [projects, aspects]);

  // Keep latest geometry in refs for scroll handler without re-binding listeners.
  const geomRef = useRef({ sectionTops, copyH });
  geomRef.current = { sectionTops, copyH };

  useEffect(() => setMounted(true), []);

  // Drive a CSS variable from lenis scroll velocity so each tile subtly
  // stretches with motion and settles back as velocity decays to zero.
  // The raf keeps lerping after lenis stops emitting so the tail is smooth.
  useEffect(() => {
    const root = document.documentElement;
    let rafId = 0;
    let smoothed = 0;
    let target = 0;
    const lenis = getLenis();
    const onLenisScroll = ({ velocity }: { velocity: number }) => {
      target = velocity;
    };
    const onWheel = (e: WheelEvent) => {
      // Without lenis, fall back to deltaY as a velocity proxy
      target = e.deltaY;
    };
    if (lenis) lenis.on("scroll", onLenisScroll);
    else window.addEventListener("wheel", onWheel, { passive: true });

    const tick = () => {
      smoothed += (target - smoothed) * 0.18;
      if (Math.abs(smoothed) < 0.01 && Math.abs(target) < 0.01) {
        smoothed = 0;
        target = 0;
      }
      // Decay target so non-lenis wheel pulses fade
      target *= 0.9;
      const scale = 1 + smoothed * 0.0008;
      root.style.setProperty("--list-vel-scale", scale.toFixed(4));
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      const l = getLenis();
      if (l) l.off("scroll", onLenisScroll);
      else window.removeEventListener("wheel", onWheel);
      root.style.setProperty("--list-vel-scale", "1");
    };
  }, []);

  useLayoutEffect(() => {
    if (copyH === 0) return;
    const target =
      copyH * MIDDLE + (sectionTops[initialActiveRef.current] ?? 0);
    jumpTo(target);
  }, [total, copyH, sectionTops]);

  // Intro animation — tiles start at scale 0 stacked at the exact viewport
  // center, then expand one after the other (stagger) so each new card
  // renders on top of the previous one (z-index runs high → low from the
  // active card down). Once the deck is built, every tile translates to
  // its natural section position, then the active tile shifts to color.
  // Opacity stays at 1 throughout so the pure scale-in is visible.
  const introDoneRef = useRef(onIntroDone);
  introDoneRef.current = onIntroDone;
  const initialAspectsRef = useRef(aspects);
  initialAspectsRef.current = aspects;

  useLayoutEffect(() => {
    if (!introActive) return;
    const tiles = Array.from(
      document.querySelectorAll<HTMLElement>(
        `[data-tile][data-tile-copy="${MIDDLE}"]`
      )
    );
    if (tiles.length === 0) {
      setIntroActive(false);
      introDoneRef.current?.();
      return;
    }

    // Sizes / tops snapshot at intro start. Aspects are async — if they
    // haven't loaded yet, all tiles share DEFAULT_ASPECT, which means they
    // stack at the *exact* viewport center (identical h). As real aspects
    // arrive, sections in flow reflow but the tiles' transforms keep them
    // anchored at center until the spread phase moves them home.
    const sizes = projects.map((p) =>
      sizeForAspect(initialAspectsRef.current[p.id] ?? DEFAULT_ASPECT)
    );
    const tops: number[] = [];
    let acc = 0;
    sizes.forEach(({ h }) => {
      tops.push(acc);
      acc += h + GAP;
    });
    const localCopyH = acc;

    const vh = window.innerHeight;
    const sy = window.scrollY;

    const tileOffsetY = (idx: number): number => {
      const sz = sizes[idx];
      if (!sz) return 0;
      const docCenter = MIDDLE * localCopyH + (tops[idx] ?? 0) + sz.h / 2;
      return vh / 2 - (docCenter - sy);
    };

    const active = initialActiveRef.current;
    const activeTile = tiles.find(
      (t) => parseInt(t.dataset.tileIndex ?? "-1", 10) === active
    );
    const n = tiles.length;

    // Order the deck so the active card lands on top last. With stagger
    // from "last", the LAST element of `tiles` animates first; we want
    // the active card to animate last and to sit at the highest z-index
    // so each successive card visibly stacks over the previous one.
    // Sort: place active first, then the rest in their natural order —
    // then `stagger({ from: "last" })` will animate them back→front with
    // the active at the very end.
    const ordered = [...tiles];
    if (activeTile) {
      ordered.splice(ordered.indexOf(activeTile), 1);
      ordered.unshift(activeTile);
    }

    // Initial snap (duration:0 acts as a motion "set"). All tiles start
    // stacked at the exact viewport center with scale 0, opacity 1. The
    // z-index runs high → low from the active card down so each card
    // that pops in renders above the previously-popped cards.
    for (let i = 0; i < ordered.length; i++) {
      const tile = ordered[i];
      const idx = parseInt(tile.dataset.tileIndex ?? "0", 10);
      tile.style.zIndex = String(n - i);
      animate(
        tile,
        {
          y: tileOffsetY(idx),
          scale: 0,
          opacity: 1,
          filter: "grayscale(1)",
        },
        { duration: 0 }
      );
    }

    // power2.out ≈ [0, 0, 0.58, 1]; power3.inOut ≈ [0.65, 0, 0.35, 1].
    // Quart out for the expand: snappy start, gentle settle.
    const EASE_OUT: [number, number, number, number] = [0, 0, 0.58, 1];
    const EASE_OUT_QUART: [number, number, number, number] = [0.22, 1, 0.36, 1];
    const EASE_IN_OUT3: [number, number, number, number] = [0.65, 0, 0.35, 1];

    // Stagger window: 0.06s per tile so 22 projects ≈ 1.3s of staggered
    // pop-ins. Each tile scales for 0.55s — short enough that you read
    // each new card popping in over the previous one. Last (active)
    // settles before the spread phase begins.
    const STAGGER = 0.06;
    const SCALE_DUR = 0.55;
    const scaleEndsAt = 0.35 + STAGGER * Math.max(0, n - 1) + SCALE_DUR;
    const spreadAt = scaleEndsAt + 0.15;
    const colorAt = spreadAt + 0.9;

    const controls = animate([
      // Scale-in: each card pops from scale 0 → 1 one after the other.
      // `from: "last"` makes the LAST entry of `ordered` start first;
      // since we put the active card at index 0, the active card pops
      // last and lands on top of the deck.
      [
        ordered,
        { scale: 1 },
        {
          at: 0.35,
          duration: SCALE_DUR,
          delay: stagger(STAGGER, { from: "last" }),
          ease: EASE_OUT_QUART,
        },
      ],
      // Translate every tile from its center offset back to y:0 (its
      // natural flow position). Tiles above the active move up, tiles
      // below move down — the stack "opens" into the list.
      [tiles, { y: 0 }, { at: spreadAt, duration: 1.4, ease: EASE_IN_OUT3 }],
      // Active tile transitions to color (reveals other details).
      ...(activeTile
        ? [
            [
              activeTile,
              { filter: "grayscale(0)" },
              { at: colorAt, duration: 0.75, ease: EASE_OUT },
            ] satisfies [HTMLElement, { filter: string }, { at: number; duration: number; ease: [number, number, number, number] }],
          ]
        : []),
    ]);

    controls
      .then(() => {
        // Clear motion-managed inline styles so ProjectSection's React-
        // controlled transform (scaleY of --list-vel-scale) + filter
        // (grayscale per isActive) take over.
        for (const tile of tiles) {
          tile.style.transform = "";
          tile.style.opacity = "";
          tile.style.filter = "";
          tile.style.transformOrigin = "";
          tile.style.zIndex = "";
        }
        setIntroActive(false);
        introDoneRef.current?.();
      })
      .catch(() => {});

    return () => {
      controls.stop();
    };
  }, [introActive, projects]);

  useEffect(() => {
    const onScroll = () => {
      const { sectionTops: tops, copyH: cH } = geomRef.current;
      if (total === 0 || cH === 0) return;
      const center = window.scrollY + window.innerHeight / 2;
      const wrappedY = ((center % cH) + cH) % cH;
      let idx = 0;
      for (let i = tops.length - 1; i >= 0; i--) {
        if (tops[i] <= wrappedY) {
          idx = i;
          break;
        }
      }
      onActiveChange(idx);

      if (adjustingRef.current) return;
      const sy = window.scrollY;
      if (sy < cH * 0.5) {
        adjustingRef.current = true;
        jumpTo(sy + cH);
        requestAnimationFrame(() => {
          adjustingRef.current = false;
        });
      } else if (sy > cH * (COPIES - 0.5)) {
        adjustingRef.current = true;
        jumpTo(sy - cH);
        requestAnimationFrame(() => {
          adjustingRef.current = false;
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [total, onActiveChange]);

  const activeProject = projects[Math.min(activeIndex, total - 1)];

  const handleClick = (project: Project) => {
    const action = getProjectAction(project);
    if (!action) return;
    if (action.external) {
      window.open(action.href, "_blank", "noopener,noreferrer");
    } else {
      router.push(action.href);
    }
  };

  const sections = useMemo(
    () =>
      Array.from({ length: COPIES }).flatMap((_, copy) =>
        projects.map((project, idx) => ({
          key: `${copy}-${project.id}`,
          project,
          idx,
          copy,
        }))
      ),
    [projects]
  );

  return (
    <>
      <div>
        {sections.map(({ key, project, idx, copy }) => (
          <ProjectSection
            key={key}
            project={project}
            aspect={aspects[project.id] ?? DEFAULT_ASPECT}
            idx={idx}
            copy={copy}
            isActive={idx === activeIndex}
            introActive={introActive && copy === MIDDLE}
            onClick={() => handleClick(project)}
            setCursor={setCursor}
          />
        ))}
      </div>

      {activeProject && (
        <div
          className="pointer-events-none fixed left-0 right-0 top-1/2 z-20 hidden -translate-y-1/2 px-[16px] md:block"
          style={{
            mixBlendMode: "difference",
            opacity: introReady ? 1 : 0,
            transition: "opacity 0.7s ease-out 0.4s",
          }}
        >
          <div className="grid grid-cols-12 gap-x-[10px] text-[14px] leading-none text-white">
            <span className="col-start-3 col-span-3 whitespace-nowrap">
              {activeProject.category ?? "-"}
            </span>
            <span className="col-start-9 col-span-2 whitespace-nowrap">
              {activeProject.image.role}
            </span>
            <span className="col-start-12 col-span-1 justify-self-end whitespace-nowrap">
              {activeProject.image.year}
            </span>
          </div>
        </div>
      )}

      <div
        className="pointer-events-none fixed right-[20px] bottom-[20px] z-30"
        style={{
          mixBlendMode: "difference",
          opacity: introReady ? 1 : 0,
          transform: introReady
            ? "translate(0, 0) scale(1)"
            : "translate(20px, 20px) scale(0.7)",
          transition:
            "opacity 0.9s ease-out 1.4s, transform 1.1s cubic-bezier(0.22, 1, 0.36, 1) 1.4s",
        }}
      >
        <Compass activeIndex={activeIndex} total={total} />
      </div>

      {mounted &&
        cursor &&
        createPortal(
          <div
            className="pointer-events-none fixed z-50 rounded-full bg-white px-[8px] py-[4px] text-[12px] leading-none tracking-[-0.02em] text-black"
            style={{ left: cursor.x + 18, top: cursor.y + 18 }}
          >
            {cursor.text}
          </div>,
          document.body
        )}
    </>
  );
}
