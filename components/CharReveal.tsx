"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { EASE_OUT } from "@/lib/gsap/eases";

type Props = {
  children: string;
  visible: boolean;
  className?: string;
  delay?: number;
  enterStagger?: number;
  exitStagger?: number;
};

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

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const chars = root.querySelectorAll<HTMLElement>("[data-rc]");
    if (chars.length === 0) return;
    gsap.killTweensOf(chars);
    if (visible) {
      gsap.fromTo(
        chars,
        { y: 12, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.45,
          ease: EASE_OUT,
          stagger: enterStagger,
          delay,
        }
      );
    } else {
      gsap.to(chars, {
        y: -10,
        opacity: 0,
        duration: 0.32,
        ease: EASE_OUT,
        stagger: exitStagger,
        delay,
      });
    }
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
