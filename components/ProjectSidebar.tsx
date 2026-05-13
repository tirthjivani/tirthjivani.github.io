"use client";

import { useMemo } from "react";
import type { Project } from "@/data/projects";

const ITEM_HEIGHT = 16;
const ITEM_GAP = 10;
const STEP = ITEM_HEIGHT + ITEM_GAP;
const VISIBLE_ROWS = 9;
const ASIDE_HEIGHT =
  VISIBLE_ROWS * ITEM_HEIGHT + (VISIBLE_ROWS - 1) * ITEM_GAP;

type Props = {
  projects: Project[];
  activeIndex: number;
};

export function ProjectSidebar({ projects, activeIndex }: Props) {
  const N = projects.length;
  const half = Math.floor(N / 2);

  const padded = useMemo(() => {
    const before = projects
      .slice(N - half)
      .map((project, i) => ({
        project,
        originalIndex: N - half + i,
        copy: "before" as const,
      }));
    const main = projects.map((project, i) => ({
      project,
      originalIndex: i,
      copy: "main" as const,
    }));
    const after = projects
      .slice(0, half)
      .map((project, i) => ({
        project,
        originalIndex: i,
        copy: "after" as const,
      }));
    return [...before, ...main, ...after];
  }, [projects, N, half]);

  const safeIndex = Math.max(0, Math.min(activeIndex, N - 1));
  const activeRenderIndex = half + safeIndex;
  const middleSlot = Math.floor(VISIBLE_ROWS / 2);
  const offset = (middleSlot - activeRenderIndex) * STEP;

  return (
    <aside
      className="pointer-events-none fixed left-[10px] top-1/2 z-30 hidden -translate-y-1/2 overflow-hidden md:block"
      style={{ height: `${ASIDE_HEIGHT}px` }}
    >
      <nav
        className="pointer-events-auto flex flex-col text-[16px] leading-none text-white transition-transform duration-500 ease-out"
        style={{
          gap: `${ITEM_GAP}px`,
          transform: `translateY(${offset}px)`,
        }}
      >
        {padded.map(({ project, originalIndex, copy }, renderIndex) => {
          const isActive = renderIndex === activeRenderIndex;
          return (
            <a
              key={`${project.id}-${copy}`}
              href={`#${project.id}`}
              aria-current={isActive ? "true" : undefined}
              className={`whitespace-nowrap transition-colors duration-300 ease-out ${
                isActive
                  ? "text-white"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              {project.title}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
