"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Image URLs in order — first frame at top, last at bottom of scroll range. */
  frames: string[];
  /** Tailwind width classes (responsive ok) on the container. */
  className?: string;
  /** Fixed aspect ratio of the framed container (w/h). */
  aspect?: number;
  /** When set, flip progress ends the moment this element's BOTTOM enters the
      viewport (instead of mapping to the full page scroll range). */
  endTarget?: React.RefObject<HTMLElement | null>;
  /** When set, flip progress starts only after this element's BOTTOM scrolls
      off the top of the viewport. Until then, the first frame is held. */
  startTarget?: React.RefObject<HTMLElement | null>;
  /** Parallax lag: 0 = scrolls with the page (no effect), 0.3 = the image
      visually moves at 70% of the page's scroll speed. */
  parallax?: number;
};

// Scroll-stepped image: as the user scrolls past the container, the visible
// frame snaps to a different image — like flipping through a stack. Plays the
// global UI click sound on every change (respecting the mute toggle). All
// frames render in a fixed-aspect container with grayscale + object-cover so
// portrait + landscape art share one footprint and feel uniform.
export function ScrollFlipImage({
  frames,
  className = "w-[45vw]",
  aspect = 4 / 5,
  endTarget,
  startTarget,
  parallax = 0.6,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (typeof Audio === "undefined") return;
    const a = new Audio("/fx.mp3");
    a.preload = "auto";
    a.volume = 0.5;
    audioRef.current = a;
  }, []);

  const lastActiveRef = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      // Flip progress maps scrollY ∈ [startY, endY] → frame 0 .. last.
      //   startY: doc-y where startTarget's BOTTOM crosses the viewport TOP
      //           (i.e. the moment that element scrolls off the top). 0 if
      //           no startTarget — flips start at the top of the page.
      //   endY:   doc-y where endTarget's BOTTOM enters the viewport BOTTOM
      //           (i.e. that element fully visible). Falls back to page end.
      let startY = 0;
      const startEl = startTarget?.current;
      if (startEl) {
        const r = startEl.getBoundingClientRect();
        startY = r.bottom + window.scrollY;
      }
      let endY = document.documentElement.scrollHeight - window.innerHeight;
      const endEl = endTarget?.current;
      if (endEl) {
        const r = endEl.getBoundingClientRect();
        endY = Math.max(startY, r.bottom + window.scrollY - window.innerHeight);
      }
      const range = endY - startY;
      const p =
        range > 0
          ? Math.min(1, Math.max(0, (window.scrollY - startY) / range))
          : 0;
      const idx = Math.min(
        frames.length - 1,
        Math.max(0, Math.floor(p * frames.length))
      );
      if (idx !== lastActiveRef.current) {
        lastActiveRef.current = idx;
        setActive(idx);
        // Click sound on every flip, mute-aware.
        try {
          if (localStorage.getItem("sound") !== "off") {
            const a = audioRef.current;
            if (a) {
              a.currentTime = 0;
              a.play().catch(() => {});
            }
          }
        } catch {}
      }

      // Parallax — translate the frame stack so it lags page scroll. Drift is
      // centred around the wrapper's natural in-view position: -drift/2 when
      // the wrapper is just entering the viewport, +drift/2 when it's leaving.
      // Net effect: the image appears to scroll slower than the surrounding
      // page content. Drift scales with viewport height × parallax factor.
      const frame = frameRef.current;
      const wrap = wrapperRef.current;
      if (frame && wrap && parallax > 0) {
        const wrapRect = wrap.getBoundingClientRect();
        const vh = window.innerHeight;
        // 0 when wrapper top is at viewport bottom (just entering),
        // 1 when wrapper bottom is at viewport top (just leaving).
        const total = wrapRect.height + vh;
        const visProgress = Math.min(
          1,
          Math.max(0, (vh - wrapRect.top) / total)
        );
        const drift = vh * parallax;
        const ty = drift * (0.5 - visProgress);
        frame.style.transform = `translate3d(0, ${ty}px, 0)`;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [frames.length, endTarget, startTarget, parallax]);

  return (
    <div ref={wrapperRef} className={`mx-auto ${className}`}>
      <div
        ref={frameRef}
        className="relative overflow-hidden will-change-transform"
        style={{ aspectRatio: aspect }}
      >
        {frames.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            aria-hidden
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover grayscale"
            style={{ opacity: i === active ? 1 : 0 }}
          />
        ))}
        {/* Mode-aware tint, applied to the whole stack. */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{ backgroundColor: "var(--bg)" }}
        />
      </div>
    </div>
  );
}
