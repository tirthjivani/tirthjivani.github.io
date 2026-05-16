"use client";

import { createContext, useContext, type MutableRefObject } from "react";

export type ScrollState = {
  target: number;
  current: number;
  velocity: number;
};

export type ParallaxState = {
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
};

export type RigRefs = {
  scroll: MutableRefObject<ScrollState>;
  parallax: MutableRefObject<ParallaxState>;
};

export const RigContext = createContext<RigRefs | null>(null);

export function useRig(): RigRefs {
  const ctx = useContext(RigContext);
  if (!ctx) throw new Error("useRig must be used inside <RigContext.Provider>");
  return ctx;
}
