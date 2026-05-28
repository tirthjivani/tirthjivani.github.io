"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const BARS = 5;
const MIN = 2;
const MAX = 12;
// Random but stable wave heights per mount — feels organic, not symmetric.
function makeWave() {
  return Array.from(
    { length: BARS },
    () => Math.round(MIN + 1 + Math.random() * (MAX - MIN - 1))
  );
}

// Mutes/unmutes the global UI click sound. State lives in localStorage under
// "sound" ("on" | "off"); ClickSound reads it live on each click. Icon is a
// 5-bar waveform: a wave when on, flat-minimal when muted.
export function SoundToggle() {
  const [muted, setMuted] = useState(false);
  // Lock in one random wave per mount so re-renders don't reshuffle the bars.
  // SSR uses a fixed seed (returns the same heights every server render); the
  // client useEffect below replaces it with a fresh random set after hydration
  // so different sessions still look different and React doesn't hydrate-mismatch.
  const [wave, setWave] = useState<number[]>(() => [5, 10, 3, 11, 7]);
  useEffect(() => {
    setWave(makeWave());
  }, []);

  useEffect(() => {
    try {
      setMuted(localStorage.getItem("sound") === "off");
    } catch {}
  }, []);

  const toggle = () => {
    setMuted((m) => {
      const next = !m;
      try {
        localStorage.setItem("sound", next ? "off" : "on");
      } catch {}
      return next;
    });
  };

  return (
    <button
      type="button"
      aria-label={muted ? "Unmute UI sound" : "Mute UI sound"}
      aria-pressed={muted}
      onClick={toggle}
      className="inline-flex h-[12px] items-center justify-center gap-[1.5px] text-white"
      style={{ mixBlendMode: "difference" }}
    >
      {wave.map((h, i) => (
        <motion.span
          key={i}
          className="w-[1.5px] rounded-full bg-current"
          initial={false}
          animate={{ height: muted ? MIN : h }}
          transition={{ duration: 0.28, ease: EASE_OUT }}
        />
      ))}
    </button>
  );
}
