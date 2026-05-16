"use client";

import { useEffect, useRef } from "react";

export function ClickSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/click.mp3");
    audio.preload = "auto";
    audio.volume = 0.5;
    audioRef.current = audio;

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest("a, button, [role='button']");
      if (!interactive) return;
      const a = audioRef.current;
      if (!a) return;
      a.currentTime = 0;
      a.play().catch(() => {});
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
