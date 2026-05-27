"use client";

import type { Project } from "@/data/projects";

const ITEM_HEIGHT = 13;
const ITEM_GAP = 4;
const STEP = ITEM_HEIGHT + ITEM_GAP;

type Props = {
  projects: Project[];
  activeIndex: number;
  onNavigate: (index: number) => void;
};

function computeSlot(i: number, active: number, N: number, half: number) {
  return ((i - active + half + N) % N) - half;
}

export function ProjectSidebar({ projects, activeIndex, onNavigate }: Props) {
  const N = projects.length;
  const half = Math.floor(N / 2);
  const safeIndex = Math.max(0, Math.min(activeIndex, N - 1));

  const asideHeight = N * ITEM_HEIGHT + (N - 1) * ITEM_GAP;
  const neutralTop = (asideHeight - ITEM_HEIGHT) / 2;

  return (
    <aside
      className="pointer-events-none fixed left-[20px] top-1/2 z-30 hidden -translate-y-1/2 md:block"
      style={{ height: `${asideHeight}px` }}
    >
      <div className="relative h-full w-[200px]">
        {projects.map((project, i) => {
          const slot = computeSlot(i, safeIndex, N, half);
          const isActive = i === safeIndex;
          return (
            <button
              key={project.id}
              type="button"
              onClick={() => onNavigate(i)}
              aria-current={isActive ? "true" : undefined}
              style={{
                position: "absolute",
                top: neutralTop,
                left: 0,
                transform: `translateY(${slot * STEP}px)`,
              }}
              className={`pointer-events-auto whitespace-nowrap text-left text-[13px] leading-none tracking-[-0.03em] ${
                isActive ? "text-white" : "text-white/30 hover:text-white/60"
              }`}
            >
              {project.title}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
