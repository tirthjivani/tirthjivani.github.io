"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { animate, stagger, type AnimationPlaybackControls } from "motion/react";

type Props = {
  children: string;
  visible: boolean;
  className?: string;
  delay?: number;
  enterStagger?: number;
  exitStagger?: number;
};

const EASE_OUT: [number, number, number, number] = [0, 0, 0.58, 1];

/**
 * Row reveal/hide animation, text split by character.
 * - On show: each char rises from y=12, opacity 0 → 1, staggered.
 * - On hide: each char rises further (y=-10) and fades to 0, staggered.
 * Words are kept atomically inline-block so natural line wrapping still works.
 */
export function CharReveal({
  children,
  visible,
  className,
  delay = 0,
  enterStagger = 0.004,
  exitStagger = 0.003,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const firstRef = useRef(true);
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const chars = Array.from(
      root.querySelectorAll<HTMLElement>("[data-rc]")
    );
    if (chars.length === 0) return;
    controlsRef.current?.stop();
    const isFirst = firstRef.current;
    firstRef.current = false;
    if (visible) {
      controlsRef.current = animate(
        chars,
        { y: [12, 0], opacity: [0, 1] },
        {
          duration: 0.45,
          ease: EASE_OUT,
          delay: stagger(enterStagger, { startDelay: delay }),
        }
      );
    } else if (isFirst) {
      // Snap to hidden on initial mount so the text never flashes before the
      // intro reveal triggers it.
      for (const c of chars) {
        c.style.transform = "translateY(12px)";
        c.style.opacity = "0";
      }
    } else {
      controlsRef.current = animate(
        chars,
        { y: [null, -10], opacity: [null, 0] },
        {
          duration: 0.32,
          ease: EASE_OUT,
          delay: stagger(exitStagger, { startDelay: delay }),
        }
      );
    }
    return () => {
      controlsRef.current?.stop();
    };
  }, [visible, children, delay, enterStagger, exitStagger]);

  const words = children.split(" ");
  const out: ReactNode[] = [];
  words.forEach((word, w) => {
    if (w > 0) out.push(" ");
    out.push(
      <span key={`w${w}`} className="inline-block">
        {Array.from(word).map((c, i) => (
          <span
            key={i}
            data-rc
            className="inline-block"
            style={{ willChange: "transform, opacity" }}
          >
            {c}
          </span>
        ))}
      </span>
    );
  });

  return (
    <span ref={ref} className={className} aria-label={children}>
      {out}
    </span>
  );
}
