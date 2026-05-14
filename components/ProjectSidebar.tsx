"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import type { Project } from "@/data/projects";

const ITEM_HEIGHT = 14;
const ITEM_GAP = 8;
const STEP = ITEM_HEIGHT + ITEM_GAP;
const TRANSITION = { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const };

type Props = {
  projects: Project[];
  activeIndex: number;
  onNavigate: (index: number) => void;
};

function computeSlot(i: number, active: number, N: number, half: number) {
  return (((i - active + half + N) % N) - half);
}

export function ProjectSidebar({ projects, activeIndex, onNavigate }: Props) {
  const N = projects.length;
  const half = Math.floor(N / 2);
  const safeIndex = Math.max(0, Math.min(activeIndex, N - 1));

  const asideHeight = N * ITEM_HEIGHT + (N - 1) * ITEM_GAP;
  const neutralTop = (asideHeight - ITEM_HEIGHT) / 2;

  const prevSlotsRef = useRef<Record<string, number>>({});

  const slots: Record<string, number> = {};
  for (let i = 0; i < N; i++) {
    slots[projects[i].id] = computeSlot(i, safeIndex, N, half);
  }

  useEffect(() => {
    prevSlotsRef.current = { ...slots };
  });

  return (
    <aside
      className="pointer-events-none fixed left-[20px] top-1/2 z-30 hidden -translate-y-1/2 md:block"
      style={{ height: `${asideHeight}px` }}
    >
      <div className="relative h-full w-[200px]">
        {projects.map((project, i) => {
          const slot = slots[project.id];
          const prevSlot = prevSlotsRef.current[project.id];
          const isWrap =
            prevSlot !== undefined && Math.abs(slot - prevSlot) > half;
          const isActive = i === safeIndex;

          return (
            <motion.button
              key={project.id}
              type="button"
              onClick={() => onNavigate(i)}
              aria-current={isActive ? "true" : undefined}
              initial={false}
              animate={{ y: slot * STEP }}
              transition={isWrap ? { duration: 0 } : TRANSITION}
              style={{
                position: "absolute",
                top: neutralTop,
                left: 0,
              }}
              className={`pointer-events-auto whitespace-nowrap text-left text-[14px] leading-none tracking-[-0.03em] transition-colors duration-300 ease-out ${
                isActive ? "text-white" : "text-white/30 hover:text-white/60"
              }`}
            >
              {project.title}
            </motion.button>
          );
        })}
      </div>
    </aside>
  );
}
