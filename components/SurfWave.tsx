"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { type SurfItem, useSurfWave } from "@/lib/useSurfWave";
import { posterFor } from "@/lib/posterFor";
import s from "./SurfWave.module.css";

export type { SurfItem } from "@/lib/useSurfWave";

export interface SurfWaveProps {
  items: SurfItem[];
  className?: string;
  onCardClick?: (index: number) => void;
  onHoverCard?: (index: number | null) => void;
  /** Project to centre on mount, so switching views keeps the user in place. */
  initialIndex?: number;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function SurfWave({
  items,
  className,
  onCardClick,
  onHoverCard,
  initialIndex = 0,
}: SurfWaveProps) {
  const reducedMotion = usePrefersReducedMotion();
  const { cards, layout, bindSurface, ready } = useSurfWave(
    items,
    reducedMotion,
    onCardClick,
    initialIndex
  );

  return (
    <div
      className={className ? `${s.container} ${className}` : s.container}
      role="region"
      aria-label="Project wave carousel. Drag, scroll, or use the left and right arrow keys to move."
      {...bindSurface}
    >
      <div className={s.stage} data-ready={ready}>
        {cards.map((card, i) => {
          const itemIdx = items.length > 0 ? i % items.length : 0;
          // The motion-value pool is a fixed MAX_SLOTS entries, but a given
          // viewport only ever positions `layout.slotCount` of them — the rest
          // are parked at opacity 0. Mounting their media anyway meant dozens
          // of off-stage <img>/<video> elements (and video decoders) for cards
          // that are never drawn.
          const inUse = layout.slotCount > 0 && i < layout.slotCount;
          // useSurfWave snapshots card.item once at pool init, so per-card
          // updates (aspect arriving after mount) never reach it. Re-resolve
          // from the live `items` prop each render instead.
          const item = items.length > 0 ? items[itemIdx] : card.item;
          // An item can occupy more than one slot when the strip is longer
          // than the item list. Only the first of those plays the video; the
          // duplicates show the poster still, so one clip is never decoded
          // several times over.
          const isPrimarySlot = i === itemIdx;
          // Per-card sizing: keep the row height constant and derive width
          // from the item's natural aspect so the frame fits the media
          // exactly (no letterbox, no crop). Fallback to the uniform layout
          // width while aspects load.
          const aspect = item.aspect ?? 0;
          const cardW =
            aspect > 0 ? layout.cardHeight * aspect : layout.cardWidth;
          const cardH = layout.cardHeight;
          return (
            <motion.div
              key={card.key}
              className={s.card}
              style={{
                width: cardW,
                height: cardH,
                marginLeft: -cardW / 2,
                marginTop: -cardH / 2,
                transform: card.transform,
                opacity: card.opacity,
              }}
              // Expose each project exactly once: parked slots and repeat
              // occurrences of an item are decorative duplicates.
              aria-hidden={!inUse || !isPrimarySlot ? true : undefined}
              onMouseEnter={() => onHoverCard?.(itemIdx)}
              onMouseLeave={() => onHoverCard?.(null)}
            >
              <div className={s.media}>
                {!inUse ? null : item.video ? (
                  isPrimarySlot ? (
                    <video
                      className={s.vid}
                      src={item.video}
                      poster={posterFor(item.video)}
                      aria-label={item.alt}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <img
                      className={s.img}
                      src={posterFor(item.video)}
                      alt=""
                      draggable={false}
                      decoding="async"
                    />
                  )
                ) : (
                  <img
                    className={s.img}
                    src={item.src}
                    alt={item.alt}
                    draggable={false}
                    loading="eager"
                    decoding="async"
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
