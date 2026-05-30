"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { animate, stagger, type AnimationSequence } from "motion/react";
import { getLenis } from "@/lib/lenis";
import { getProjectAction } from "@/lib/projectAction";
import { useImageAspects } from "@/lib/useImageAspects";
import { Compass } from "./Compass";
import { sizeForAspect } from "@/lib/sizeForAspect";
import type { Project } from "@/data/projects";

const COPIES = 3;
const MIDDLE = 1;
const GAP = 10;
const DEFAULT_ASPECT = 1.6;

// Intro timeline (seconds). Matches the /preloader study: each image zooms in
// (scale + opacity 0 → 1, expo-out) at the centre one after another, the deck
// then moves together (no stagger, equal time) into the vertical stack, and
// finally scrolls one full loop until the default project is back at centre.
const INTRO_EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];
const INTRO_EASE_IN_OUT3: [number, number, number, number] = [0.65, 0, 0.35, 1];
const POP_START = 0.2;
const POP_DUR = 0.45;
const POP_STAGGER = 0.2;
const SETTLE_AFTER_POP = 0.35;
const CASCADE_DUR = 0.9;
const SCROLL_LOOP_DUR = 1.8;

// "wait" holds (hidden) until image aspects resolve, so the POP expands every
// tile at its true final size instead of the uniform DEFAULT_ASPECT box.
type IntroStage = "wait" | "pop" | "loop" | "done";

type Cursor = { x: number; y: number; text: string } | null;

type Props = {
  projects: Project[];
  activeIndex: number;
  onActiveChange: (idx: number) => void;
  introReady?: boolean;
  intro?: boolean;
  // Fires the moment the upward translate begins — gives the parent a hook
  // to reveal navbar / sidebar / bottombar text in parallel with the stack
  // sliding to its resting position.
  onIntroReveal?: () => void;
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

// Translate the scroll position by `delta` while preserving any in-flight
// lenis momentum. lenis.scrollTo(y, { immediate: true }) internally calls
// `reset()`, which zeroes velocity and stops the smooth animation — that's
// exactly what made the list feel like it "stuck" at the project under
// the wrap boundary (every cycle the wheel inertia got cancelled, so the
// list couldn't carry past that section without a fresh user input).
// Shifting both targetScroll and animatedScroll by the same delta moves the
// frame of reference instead of resetting the animation, so the lerp keeps
// going seamlessly across the copy boundary.
function shiftScroll(delta: number) {
  if (typeof window === "undefined" || delta === 0) return;
  const newY = window.scrollY + delta;
  const lenis = getLenis() as unknown as {
    animatedScroll: number;
    targetScroll: number;
    animate?: { value: number; from: number; to: number };
    preventNextNativeScrollEvent?: () => void;
  } | null;
  if (lenis) {
    lenis.animatedScroll += delta;
    lenis.targetScroll += delta;
    // CRITICAL: lenis's internal Animate.value is the source of truth for the
    // raf lerp — onUpdate writes `animatedScroll = value` every frame, so
    // shifting only animatedScroll/targetScroll gets wiped on the next raf.
    // Shifting value/from/to by the same delta translates the in-flight
    // animation without changing its remaining distance, preserving momentum.
    if (lenis.animate) {
      lenis.animate.value += delta;
      lenis.animate.from += delta;
      lenis.animate.to += delta;
    }
    lenis.preventNextNativeScrollEvent?.();
  }
  window.scrollTo(0, newY);
}

function smoothScrollTo(y: number) {
  if (typeof window === "undefined") return;
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(y, { duration: 0.4 });
  else window.scrollTo({ top: y, behavior: "smooth" });
}

function ProjectSection({
  project,
  aspect,
  idx,
  copy,
  isActive,
  introActive,
  introColor,
  playVideo,
  onClick,
  setCursor,
}: {
  project: Project;
  aspect: number;
  idx: number;
  copy: number;
  isActive: boolean;
  introActive: boolean;
  introColor: boolean;
  playVideo: boolean;
  onClick: () => void;
  setCursor: (c: Cursor) => void;
}) {
  const action = getProjectAction(project);
  const { w, h } = sizeForAspect(aspect);

  // While the POP/CASCADE beats run, Motion FULLY owns transform / scale /
  // opacity / filter via inline styles it writes directly on the DOM node.
  // React must not set any of those here: a mid-intro re-render (the parent
  // flipping `textReady`, etc.) would otherwise overwrite Motion's
  // translateY(...)·scale(...) with a bare value, dropping the centering
  // offset and snapping each tile back to its section center. The pre-pop
  // frame is hidden by the wrapper's `opacity:0` during the "wait" stage, and
  // Motion's snap runs in a useLayoutEffect (before paint) once "pop" begins.
  const introStyles = introActive
    ? {
        willChange: "transform, filter" as const,
      }
    : {
        transform: "scaleY(var(--list-vel-scale, 1))",
        opacity: 1,
        // Keep every tile in full colour through the whole intro (pop → stack →
        // loop), like /preloader. Only once the intro is done does the list's
        // grayscale-non-active treatment kick in.
        filter: introColor || isActive ? "grayscale(0)" : "grayscale(1)",
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
        data-tile-active={isActive ? "true" : undefined}
        data-tile-copy={copy}
        data-tile-index={idx}
        style={{
          width: w,
          height: h,
          backgroundColor: "var(--tile-bg)",
          ...introStyles,
        }}
        className={`relative overflow-hidden ${
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
          playVideo ? (
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
            // Non-middle copies: load just enough to render first frame, no
            // playback. Avoids 3× range-fetch storm on /outbox.mp4 etc.
            <video
              src={`${project.video}#t=0.001`}
              muted
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )
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
  onIntroReveal,
  onIntroDone,
}: Props) {
  const total = projects.length;
  const adjustingRef = useRef(false);
  const router = useRouter();
  const [cursor, setCursor] = useState<Cursor>(null);
  const [mounted, setMounted] = useState(false);
  const [introStage, setIntroStage] = useState<IntroStage>(
    intro ? "wait" : "done"
  );
  // Jump to "done" if the parent ever turns the intro off — the useState
  // initialiser only reads `intro` at first render.
  useEffect(() => {
    if (!intro) setIntroStage("done");
  }, [intro]);
  const initialActiveRef = useRef(activeIndex);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const liveAspects = useImageAspects(projects);
  // Aspects load async (Image onload / video metadata). Commit only when ALL
  // entries resolved so layout settles in one pass instead of reflowing
  // per-image — that mid-load reflow was the source of the picture+text
  // blinking. Until then, render with DEFAULT_ASPECT for every tile.
  const [stableAspects, setStableAspects] = useState<Record<string, number>>(
    {}
  );
  useEffect(() => {
    if (projects.length === 0) return;
    // Block commits only while the animated beats run (pop/loop): a reflow
    // then would change copyH and re-scroll mid-animation, breaking the
    // snapshotted deck geometry. During "wait" we WANT the commit — it gives
    // tiles their real sizes before the POP, so each image expands at its true
    // final size. "done" allows late-resolving aspects to land too.
    if (introStage === "pop" || introStage === "loop") return;
    const allResolved = projects.every((p) => liveAspects[p.id] != null);
    if (allResolved) setStableAspects(liveAspects);
  }, [liveAspects, projects, introStage]);
  const aspects = stableAspects;

  // "wait" → "pop": start the intro once every tile has its real size, so the
  // POP expands tiles concentrically at the size they'll hold in the list.
  // A fallback timer starts the pop anyway if some image never resolves.
  useEffect(() => {
    if (introStage !== "wait") return;
    const allResolved =
      projects.length > 0 && projects.every((p) => stableAspects[p.id] != null);
    if (allResolved) {
      setIntroStage("pop");
      return;
    }
    const fallback = window.setTimeout(() => setIntroStage("pop"), 2500);
    return () => window.clearTimeout(fallback);
  }, [introStage, stableAspects, projects]);

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

  // Center a section in the viewport given the current geometry. Always lands
  // the result inside the MIDDLE copy's safe zone [cH, 2cH) so the wrap check
  // never fires immediately on first paint (otherwise the first scroll event
  // would yank the page by ±cH before lenis could lerp anywhere).
  const centeredScroll = (idx: number): number => {
    const top = sectionTops[idx] ?? 0;
    const nextTop = idx + 1 < sectionTops.length ? sectionTops[idx + 1] : copyH;
    const sectionH = nextTop - top - GAP;
    let sy = copyH * MIDDLE + top + sectionH / 2 - window.innerHeight / 2;
    if (copyH > 0) {
      while (sy < copyH) sy += copyH;
      while (sy >= copyH * 2) sy -= copyH;
    }
    return sy;
  };
  const centeredScrollRef = useRef(centeredScroll);
  centeredScrollRef.current = centeredScroll;

  // True once the user has actually scrolled — until then, any geometry change
  // (async aspects committing) should keep the active project dead-centre, not
  // drift. (This is what caused the reveal to land on the next project.)
  const userScrolledRef = useRef(false);
  useEffect(() => {
    const onWheelOrTouch = () => {
      userScrolledRef.current = true;
    };
    window.addEventListener("wheel", onWheelOrTouch, { passive: true });
    window.addEventListener("touchmove", onWheelOrTouch, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheelOrTouch);
      window.removeEventListener("touchmove", onWheelOrTouch);
    };
  }, []);

  const didInitialJumpRef = useRef(false);
  const prevCopyHRef = useRef(0);
  useLayoutEffect(() => {
    if (copyH === 0) return;
    if (!didInitialJumpRef.current) {
      // Center the active project's section (Figma frame 851:77 — active card
      // sits at screen centre, not pinned to the top).
      jumpTo(centeredScrollRef.current(initialActiveRef.current));
      didInitialJumpRef.current = true;
      prevCopyHRef.current = copyH;
      return;
    }
    const prev = prevCopyHRef.current;
    if (prev > 0 && prev !== copyH) {
      if (userScrolledRef.current) {
        // Preserve the user's relative position across the reflow.
        jumpTo(window.scrollY * (copyH / prev));
      } else {
        // No interaction yet → re-center the active project exactly so the
        // async aspect reflow doesn't shift the default off centre.
        jumpTo(centeredScrollRef.current(initialActiveRef.current));
      }
    }
    prevCopyHRef.current = copyH;
  }, [total, copyH, sectionTops]);

  // Intro — three beats matching the Figma flow
  // (file 8CWnIO8QF2IE5EPjivKR6R, section 851:72, frames 851:54 → 851:77).
  //   1. POP: tiles snap stacked at viewport centre, scale 0 → 1, in project
  //      order — tile[0] (the active/centre project) first at the BOTTOM of
  //      the deck, then tile[1], tile[2] … expanding on top (frames 851:66 /
  //      851:69).
  //   2. CASCADE: deck unfolds to natural flow with the active card pinned at
  //      centre and the rest sitting at their real `h[i] + GAP` gaps below
  //      (frame 851:73). Cascade target is simply `y: 0` because the initial
  //      scroll already centres the active section.
  //   3. SCROLL-LOOP (separate effect): real scroll cycles the whole list once
  //      (scrollY += copyH) and lands the active back at centre; chrome text
  //      reveals over this window (frame 851:77).
  const introDoneRef = useRef(onIntroDone);
  introDoneRef.current = onIntroDone;
  const introRevealRef = useRef(onIntroReveal);
  introRevealRef.current = onIntroReveal;
  const initialAspectsRef = useRef(aspects);
  initialAspectsRef.current = aspects;

  // Beats 1 + 2 — POP then CASCADE on the middle copy. On completion, hand off
  // to the "loop" stage which runs the scroll cycle.
  useLayoutEffect(() => {
    if (introStage !== "pop") return;

    const tiles = Array.from(
      document.querySelectorAll<HTMLElement>(
        `[data-tile][data-tile-copy="${MIDDLE}"]`
      )
    );
    if (tiles.length === 0) {
      introRevealRef.current?.();
      setIntroStage("done");
      introDoneRef.current?.();
      return;
    }

    // Sizes / tops snapshot at intro start. Real aspects are committed before
    // we enter "pop" (the wait stage), so these are the tiles' true sizes.
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
    const active = initialActiveRef.current;

    // Re-center the scroll on the active section using THIS snapshot's geometry
    // so the cascade's `y:0` lands the active exactly at viewport centre,
    // regardless of any intermediate jumps during the wait stage.
    const activeTop = tops[active] ?? 0;
    const activeNextTop =
      active + 1 < tops.length ? tops[active + 1] : localCopyH;
    const activeSecH = activeNextTop - activeTop - GAP;
    const sy = MIDDLE * localCopyH + activeTop + activeSecH / 2 - vh / 2;
    jumpTo(sy);

    // Delta to land tile[idx]'s centre at the viewport centre.
    const tileCenterY = (idx: number): number => {
      const sz = sizes[idx];
      if (!sz) return 0;
      const docCenter = MIDDLE * localCopyH + (tops[idx] ?? 0) + sz.h / 2;
      return vh / 2 - (docCenter - sy);
    };

    const n = tiles.length;

    // POP in natural project order: tile[0] at the bottom of the deck (lowest
    // z-index, visible first), each later tile stacking on top. Snap every tile
    // to scale 0 / opacity 0 at the viewport centre.
    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      const idx = parseInt(tile.dataset.tileIndex ?? "0", 10);
      tile.style.zIndex = String(idx + 1);
      animate(
        tile,
        {
          y: tileCenterY(idx),
          scale: 0,
          opacity: 0,
          filter: "grayscale(0)",
        },
        { duration: 0 }
      );
    }

    const segments: AnimationSequence = [];

    // Beat 1 — POP. Zoom in (scale + opacity 0 → 1, expo-out), tile[0] first.
    segments.push([
      tiles,
      { scale: 1, opacity: 1 },
      {
        at: POP_START,
        duration: POP_DUR,
        delay: stagger(POP_STAGGER, { from: "first" }),
        ease: INTRO_EASE_OUT,
      },
    ]);

    // Beat 2 — STACK to natural flow (y:0). The initial scroll already centres
    // the active section, so y:0 lands the active (tile[0]) at centre with the
    // rest below at their real gaps. All tiles move together — no stagger,
    // equal time — so the whole deck slides down into the column at once.
    const popEndsAt = POP_START + POP_STAGGER * Math.max(0, n - 1) + POP_DUR;
    const cascadeStart = popEndsAt + SETTLE_AFTER_POP;
    segments.push([
      tiles,
      { y: 0 },
      {
        at: cascadeStart,
        duration: CASCADE_DUR,
        ease: INTRO_EASE_IN_OUT3,
      },
    ]);

    const controls = animate(segments);

    controls
      .then(() => {
        // Clear Motion-managed inline styles so React's resting styles (per
        // ProjectSection, once `introStage !== "pop"`) take over cleanly.
        for (const tile of tiles) {
          tile.style.transform = "";
          tile.style.opacity = "";
          tile.style.filter = "";
          tile.style.transformOrigin = "";
          tile.style.zIndex = "";
        }
        // Reveal chrome text and advance to the scroll-loop stage. The loop
        // runs in its own effect (below) so it survives this stage change.
        introRevealRef.current?.();
        setIntroStage("loop");
      })
      .catch(() => {});

    return () => {
      controls.stop();
    };
  }, [introStage, projects]);

  // Beat 3 — SCROLL-LOOP. The deck is now the resting list (all 3 copies
  // render normally because `introStage !== "pop"`). Translate the whole
  // sections wrapper up by one copy height: every project cycles through the
  // viewport once and — because the copies are identical — the active lands
  // back at centre. We move the wrapper rather than window.scrollY so it works
  // while the Preloader holds `body { overflow:hidden }`, fires no scroll
  // events (no activeIndex churn / snap), and leaves the real scroll position
  // untouched for lenis to resume from. Clearing the transform on completion
  // is visually seamless since copy N and copy N+1 are pixel-identical.
  useEffect(() => {
    if (introStage !== "loop") return;
    const wrapper = wrapperRef.current;
    const { copyH: cH } = geomRef.current;
    if (!wrapper || cH === 0) {
      setIntroStage("done");
      introDoneRef.current?.();
      return;
    }
    const loop = animate(
      wrapper,
      { y: [0, -cH] },
      {
        duration: SCROLL_LOOP_DUR,
        ease: INTRO_EASE_IN_OUT3,
        onComplete: () => {
          wrapper.style.transform = "";
          setIntroStage("done");
          introDoneRef.current?.();
        },
      }
    );
    return () => {
      loop.stop();
    };
  }, [introStage]);

  useEffect(() => {
    let snapTimer: number | null = null;
    let lastVelocity = 0;
    let snappedAt = -1; // wrappedY at which we last fired a snap; dedupe.
    const clearSnap = () => {
      if (snapTimer !== null) {
        window.clearTimeout(snapTimer);
        snapTimer = null;
      }
    };

    const fireSnap = () => {
      if (adjustingRef.current) return;
      const { sectionTops: tops, copyH: cH } = geomRef.current;
      if (cH === 0) return;
      const center = window.scrollY + window.innerHeight / 2;
      const wrappedY = ((center % cH) + cH) % cH;
      let idx = 0;
      for (let i = tops.length - 1; i >= 0; i--) {
        if (tops[i] <= wrappedY) {
          idx = i;
          break;
        }
      }
      const top = tops[idx];
      const nextTop = idx < tops.length - 1 ? tops[idx + 1] : cH;
      const sectionH = nextTop - top - GAP;
      const sectionCenter = top + sectionH / 2;
      const delta = sectionCenter - wrappedY;
      if (Math.abs(delta) < 1) return;
      if (Math.abs(snappedAt - sectionCenter) < 1) return;
      snappedAt = sectionCenter;
      smoothScrollTo(window.scrollY + delta);
    };

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
      // Wrap at the copy boundaries: the moment scroll leaves the MIDDLE
      // copy ([cH, 2cH)) we translate the frame of reference back by ±cH.
      // Because copy K and copy K+1 are pixel-identical, the wrap is
      // visually a no-op. Earlier thresholds (0.5cH / 2.5cH) let the user
      // drift deep into the outer copies, and on shorter viewports the
      // upper threshold could exceed the document's scrollable max — which
      // meant the wrap never fired and the list dead-ended at whichever
      // project happened to land at the body bottom.
      if (sy < cH) {
        adjustingRef.current = true;
        shiftScroll(cH);
        requestAnimationFrame(() => {
          adjustingRef.current = false;
        });
      } else if (sy >= cH * 2) {
        adjustingRef.current = true;
        shiftScroll(-cH);
        requestAnimationFrame(() => {
          adjustingRef.current = false;
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Lenis emits a `scroll` event per frame with the current velocity. Use it
    // to detect the moment the lerp tail flattens out — that's when the user
    // has "stopped" scrolling. Fire a snap then; debounce in case velocity
    // briefly dips through zero.
    const lenis = getLenis();
    const onLenisScroll = ({ velocity }: { velocity: number }) => {
      const moving = Math.abs(velocity) > 0.05;
      if (moving) {
        // reset dedupe so the next stop can snap to a different section
        snappedAt = -1;
        clearSnap();
        lastVelocity = velocity;
        return;
      }
      if (Math.abs(lastVelocity) <= 0.05) return; // already stopped
      lastVelocity = 0;
      clearSnap();
      snapTimer = window.setTimeout(fireSnap, 60);
    };
    if (lenis) lenis.on("scroll", onLenisScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      const l = getLenis();
      if (l) l.off("scroll", onLenisScroll);
      clearSnap();
    };
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
      <div
        ref={wrapperRef}
        style={{ opacity: introStage === "wait" ? 0 : 1 }}
      >
        {sections.map(({ key, project, idx, copy }) => (
          <ProjectSection
            key={key}
            project={project}
            aspect={aspects[project.id] ?? DEFAULT_ASPECT}
            idx={idx}
            copy={copy}
            isActive={idx === activeIndex}
            introActive={introStage === "pop" && copy === MIDDLE}
            introColor={introStage !== "done"}
            playVideo={copy === MIDDLE}
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
          <div className="grid grid-cols-12 gap-x-[10px] text-[13px] leading-none text-white">
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
