"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion } from "motion/react";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function ThemeToggle() {
  // Initial value is locked to `true` (dark) on BOTH server and first client
  // render, even when the persisted theme is light — reading the html class
  // in the useState initializer would diverge from SSR and throw a hydration
  // mismatch warning. A useEffect right after mount reads the actual theme
  // and updates state. The visible icon flash is hidden because the
  // pre-hydration script in layout.tsx has already set the html background
  // to the correct theme color, and the toggle icon uses `mix-blend-mode:
  // difference` so it inverts to stay visible against either bg.
  const [isDark, setIsDark] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [hover, setHover] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const animatingRef = useRef(false);

  useEffect(() => {
    setIsDark(!document.documentElement.classList.contains("light"));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    if (isDark) root.classList.remove("light");
    else root.classList.add("light");
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {
      // Storage may be blocked (private mode, quota); fall through silently.
    }
  }, [isDark, hydrated]);

  // Truth table: light + !hover = circle, light + hover = moon,
  // dark + !hover = moon, dark + hover = circle → moon = (isDark !== hover).
  const moonShown = isDark !== hover;

  const onClick = () => {
    if (animatingRef.current) return;
    const btn = btnRef.current;
    const nextDark = !isDark;
    // Overlay paints in the destination theme color. The theme itself flips
    // once the circle has fully covered the viewport so the swap happens
    // hidden under the overlay — the reveal is the circle itself.
    const nextBg = nextDark ? "#000000" : "#ffffff";
    if (!btn) {
      setIsDark(nextDark);
      return;
    }

    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const r = Math.hypot(Math.max(cx, vw - cx), Math.max(cy, vh - cy));

    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      left: `${cx - r}px`,
      top: `${cy - r}px`,
      width: `${r * 2}px`,
      height: `${r * 2}px`,
      borderRadius: "50%",
      background: nextBg,
      filter: "blur(14px)",
      transform: "scale(0)",
      transformOrigin: "center",
      zIndex: "9998",
      pointerEvents: "none",
      willChange: "transform, opacity",
      opacity: "1",
    });
    document.body.appendChild(overlay);

    animatingRef.current = true;
    // Circle scales out at full opacity. Once it covers the viewport, swap
    // theme underneath and remove the overlay in the same tick so the page
    // reveals the new theme without any flash.
    animate(
      overlay,
      { transform: ["scale(0)", "scale(1.1)"] },
      { duration: 1.0, ease: EASE_OUT }
    )
      .then(() => {
        setIsDark(nextDark);
        overlay.remove();
        animatingRef.current = false;
      })
      .catch(() => {
        setIsDark(nextDark);
        overlay.remove();
        animatingRef.current = false;
      });
  };

  return (
    <button
      ref={btnRef}
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      className="inline-flex h-[12px] w-[12px] items-center justify-center text-white"
      style={{ mixBlendMode: "difference" }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
        <defs>
          <mask id="theme-toggle-mask">
            <rect width="12" height="12" fill="white" />
            <motion.circle
              r={4.3}
              fill="black"
              initial={false}
              animate={{
                cx: moonShown ? 9.4 : 16,
                cy: moonShown ? 2.6 : -4,
              }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
            />
          </mask>
        </defs>
        <circle
          cx={6}
          cy={6}
          r={6}
          fill="currentColor"
          mask="url(#theme-toggle-mask)"
        />
      </svg>
    </button>
  );
}
