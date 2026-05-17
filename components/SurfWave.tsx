"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { type SurfItem, useSurfWave } from "@/lib/useSurfWave";
import s from "./SurfWave.module.css";

export type { SurfItem } from "@/lib/useSurfWave";

export interface SurfWaveProps {
  items: SurfItem[];
  className?: string;
  onCardClick?: (index: number) => void;
  onHoverCard?: (index: number | null) => void;
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
}: SurfWaveProps) {
  const reducedMotion = usePrefersReducedMotion();
  const { cards, layout, bindSurface, ready } = useSurfWave(
    items,
    reducedMotion,
    onCardClick
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
          return (
            <motion.div
              key={card.key}
              className={s.card}
              style={{
                width: layout.cardWidth,
                height: layout.cardHeight,
                marginLeft: -layout.cardWidth / 2,
                marginTop: -layout.cardHeight / 2,
                transform: card.transform,
                opacity: card.opacity,
              }}
              onMouseEnter={() => onHoverCard?.(itemIdx)}
              onMouseLeave={() => onHoverCard?.(null)}
            >
              <div className={s.media}>
                {card.item.video ? (
                  <video
                    className={s.vid}
                    src={card.item.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    className={s.img}
                    src={card.item.src}
                    alt={card.item.alt}
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
