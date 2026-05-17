"use client";

import {
  animate,
  type MotionValue,
  useAnimationFrame,
  useMotionValue,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

export type SurfItem = {
  src: string;
  alt: string;
  video?: string;
};

export interface CardMotion {
  readonly key: string;
  readonly transform: MotionValue<string>;
  readonly opacity: MotionValue<number>;
  readonly item: SurfItem;
}

export interface SurfWaveLayout {
  readonly cardWidth: number;
  readonly cardHeight: number;
}

export interface SurfaceBindings {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerCancel: (e: React.PointerEvent) => void;
  onWheel: (e: React.WheelEvent) => void;
}

export interface UseSurfWaveResult {
  readonly cards: readonly CardMotion[];
  readonly layout: SurfWaveLayout;
  readonly bindSurface: SurfaceBindings;
  readonly ready: boolean;
}

const TARGET_GAP_PX = 130;
const MIN_PER_VIEW = 5;
const MAX_PER_VIEW = 13;
const PORTRAIT_H_CAP = 0.85;

const DRAG_SENSITIVITY_DESKTOP = 2;
const DRAG_SENSITIVITY_MOBILE = 3.5;

const MOBILE_MAX_WIDTH = 768;

const AMP_RATIO = 0.05;
const DIAG_RATIO = 0.28;
const SCALE_MIN = 0.4;
const SCALE_MAX = 1.1;
const ROT_SLOPE = -26;
const ROT_BASE = -24;

// Card box: landscape proportions tuned for ~16:10 project shots. With
// object-fit:contain in CSS, taller/shorter aspects center inside the box
// without cropping ("fit width and fit height"). Wider cards + bigger gaps
// (fewer perView) so each project reads at a comfortable size.
const CARD_W_GAP_MULT = 4;
const CARD_ASPECT = 16 / 10;

const HORIZONTAL_NUDGE = 0;

const EASE_OUT = [0.19, 1, 0.22, 1] as const;
const INTRO_DURATION = 1;
const ARROW_DURATION = 0.22;

const TIME_STEP = 0.02;
const LERP_FACTOR = 0.1;
const VELOCITY_AMP_COUPLING = 0.01;

const CLICK_THRESHOLD_PX = 10;
const ARROW_JUMP_CARDS = 4;
const OVERSCAN_SLOTS = 4;
const FRAME_MS = 1000 / 60;
const MAX_SLOTS = 48;

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

interface Viewport {
  w: number;
  h: number;
  perView: number;
  gap: number;
  baseH: number;
  amplitude: number;
  dragSensitivity: number;
  stripWidth: number;
  slotCount: number;
}

function measureViewport(slotPoolSize: number): Viewport {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const isMobile = w <= MOBILE_MAX_WIDTH;

  const perView = Math.min(
    MAX_PER_VIEW,
    Math.max(MIN_PER_VIEW, Math.round(w / TARGET_GAP_PX))
  );
  const gap = w / perView;
  const baseH = Math.min(h, w * PORTRAIT_H_CAP);
  const amplitude = baseH * AMP_RATIO;
  const dragSensitivity = isMobile
    ? DRAG_SENSITIVITY_MOBILE
    : DRAG_SENSITIVITY_DESKTOP;

  const slotCount = Math.min(
    Math.ceil(w / gap) + OVERSCAN_SLOTS,
    slotPoolSize
  );
  const stripWidth = slotCount * gap;

  return {
    w,
    h,
    perView,
    gap,
    baseH,
    amplitude,
    dragSensitivity,
    stripWidth,
    slotCount,
  };
}

export function useSurfWave(
  items: readonly SurfItem[],
  reducedMotion: boolean,
  onCardClick?: (itemIndex: number) => void
): UseSurfWaveResult {
  const itemCount = items.length;
  const onCardClickRef = useRef(onCardClick);
  onCardClickRef.current = onCardClick;
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const pool = useMotionValuePool(MAX_SLOTS);
  const cardsRef = useRef<CardMotion[] | null>(null);
  if (cardsRef.current === null) {
    cardsRef.current = pool.map((mv, i): CardMotion => {
      const fallback: SurfItem = { src: "", alt: "" };
      const item = itemCount > 0 ? items[i % itemCount] : fallback;
      return {
        key: `surf-slot-${i}`,
        transform: mv.transform,
        opacity: mv.opacity,
        item: item ?? fallback,
      };
    });
  }
  const cards = cardsRef.current;

  const [layout, setLayout] = useState<SurfWaveLayout>({
    cardWidth: 0,
    cardHeight: 0,
  });
  const [ready, setReady] = useState(false);

  const vpRef = useRef<Viewport | null>(null);

  const targetScroll = useRef(0);
  const currentScroll = useRef(0);
  const prevScroll = useRef(0);
  const velocity = useRef(0);

  const timeRef = useRef(0);

  const k = useMotionValue(reducedMotion ? 1 : 0);

  const dragging = useRef(false);
  const dragPointerId = useRef<number | null>(null);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);
  const dragMoved = useRef(0);

  const arrowAnimRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    function applyMeasure() {
      const vp = measureViewport(MAX_SLOTS);
      vpRef.current = vp;

      const cardWidth = vp.gap * CARD_W_GAP_MULT;
      const cardHeight = cardWidth / CARD_ASPECT;
      setLayout((prev) =>
        prev.cardWidth === cardWidth && prev.cardHeight === cardHeight
          ? prev
          : { cardWidth, cardHeight }
      );
      setReady(true);
    }

    applyMeasure();

    let resizeRaf = 0;
    function onResize() {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(applyMeasure);
    }
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      k.set(1);
      return;
    }
    k.set(0);
    const controls = animate(k, 1, {
      duration: INTRO_DURATION,
      ease: EASE_OUT,
    });
    return () => controls.stop();
  }, [k, reducedMotion]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const vp = vpRef.current;
      if (!vp) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

      const dir = e.key === "ArrowRight" ? 1 : -1;
      const dest = targetScroll.current + dir * ARROW_JUMP_CARDS * vp.gap;
      targetScroll.current = dest;

      if (reducedMotion) {
        currentScroll.current = dest;
        return;
      }
      arrowAnimRef.current?.stop();
      arrowAnimRef.current = animate(currentScroll.current, dest, {
        duration: ARROW_DURATION,
        ease: EASE_OUT,
        onUpdate: (latest) => {
          currentScroll.current = latest;
        },
        onComplete: () => {
          arrowAnimRef.current = null;
        },
      });
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      arrowAnimRef.current?.stop();
    };
  }, [reducedMotion]);

  function onPointerDown(e: React.PointerEvent) {
    arrowAnimRef.current?.stop();
    arrowAnimRef.current = null;
    dragging.current = true;
    dragPointerId.current = e.pointerId;
    dragStartX.current = e.clientX;
    dragStartScroll.current = targetScroll.current;
    dragMoved.current = 0;
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture?.(e.pointerId);
    el.dataset.dragging = "true";
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current || e.pointerId !== dragPointerId.current) return;
    const vp = vpRef.current;
    if (!vp) return;
    const dx = e.clientX - dragStartX.current;
    dragMoved.current = Math.max(dragMoved.current, Math.abs(dx));
    targetScroll.current = dragStartScroll.current - dx * vp.dragSensitivity;
  }

  function endPointer(e: React.PointerEvent) {
    if (e.pointerId !== dragPointerId.current) return;
    const wasDragging = dragging.current;
    dragging.current = false;
    dragPointerId.current = null;
    const el = e.currentTarget as HTMLElement;
    el.releasePointerCapture?.(e.pointerId);
    delete el.dataset.dragging;

    if (
      wasDragging &&
      dragMoved.current < CLICK_THRESHOLD_PX &&
      onCardClickRef.current
    ) {
      const vp = vpRef.current;
      if (vp && itemCount > 0) {
        const slot = Math.floor((e.clientX + currentScroll.current) / vp.gap);
        const idx = ((slot % itemCount) + itemCount) % itemCount;
        onCardClickRef.current(idx);
      }
    }
  }

  function onWheel(e: React.WheelEvent) {
    arrowAnimRef.current?.stop();
    arrowAnimRef.current = null;
    targetScroll.current += e.deltaY + e.deltaX;
  }

  useAnimationFrame((_t, delta) => {
    const vp = vpRef.current;
    if (!vp) return;

    const deltaFrames = delta > 0 ? Math.min(delta / FRAME_MS, 4) : 1;

    if (!reducedMotion) {
      timeRef.current += TIME_STEP * deltaFrames;
    }
    const time = timeRef.current;

    if (arrowAnimRef.current) {
      targetScroll.current = currentScroll.current;
    } else {
      currentScroll.current = lerp(
        currentScroll.current,
        targetScroll.current,
        Math.min(LERP_FACTOR * deltaFrames, 1)
      );
    }

    velocity.current = currentScroll.current - prevScroll.current;
    prevScroll.current = currentScroll.current;
    const v = velocity.current;

    const { w, baseH, gap, amplitude, stripWidth, slotCount } = vp;
    const ampBoost = reducedMotion
      ? 1
      : 1 + Math.abs(v) * VELOCITY_AMP_COUPLING;
    const kVal = k.get();

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      if (!card) continue;

      if (i >= slotCount || itemCount === 0) {
        card.opacity.set(0);
        continue;
      }

      const base = i * gap;
      const wrapped =
        (((base - currentScroll.current) % stripWidth) + stripWidth) %
        stripWidth;
      const screenX = wrapped - (stripWidth - w) / 2 + HORIZONTAL_NUDGE * w;

      const n = screenX / w;
      const p = 1 - n;
      const xPhase = p - 0.5;

      const B =
        (reducedMotion ? 0 : Math.sin(time + xPhase * Math.PI * 2)) *
        amplitude *
        ampBoost;

      const E = baseH * DIAG_RATIO * xPhase + B;
      const D = (ROT_SLOPE * p + ROT_BASE) * kVal;

      const nClamped = n < 0 ? 0 : n > 1 ? 1 : n;
      const scale = SCALE_MIN + (SCALE_MAX - SCALE_MIN) * nClamped;

      card.transform.set(
        `translate3d(${screenX}px, ${E}px, 0) rotateY(${D}deg) scale(${scale})`
      );
      card.opacity.set(1);
    }
  });

  return {
    cards,
    layout,
    bindSurface: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endPointer,
      onPointerCancel: endPointer,
      onWheel,
    },
    ready,
  };
}

interface SlotMotionValues {
  transform: MotionValue<string>;
  opacity: MotionValue<number>;
}

function useMotionValuePool(size: number): SlotMotionValues[] {
  const pool: SlotMotionValues[] = [];
  for (let i = 0; i < size; i++) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const transform = useMotionValue(
      `translate3d(0px, 0px, 0) rotateY(${ROT_BASE}deg) scale(${SCALE_MIN})`
    );
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const opacity = useMotionValue(0);
    pool.push({ transform, opacity });
  }
  return pool;
}
