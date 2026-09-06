"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { getProjectAction } from "@/lib/projectAction";
import type { Project } from "@/data/projects";
import { SurfWave, type SurfItem } from "./SurfWave";
import { useImageAspects } from "@/lib/useImageAspects";

type Props = {
  projects: Project[];
  /** Project the user was last on in the list, centred on mount. */
  activeIndex?: number;
};

type Cursor = { x: number; y: number; text: string } | null;

export function SurfCanvas({ projects, activeIndex = 0 }: Props) {
  const router = useRouter();
  const [cursor, setCursor] = useState<Cursor>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    // Surf view owns the screen — lock body scroll for the duration.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const aspects = useImageAspects(projects);
  const items = useMemo<SurfItem[]>(
    () =>
      projects.map((p) => ({
        src: p.image.src,
        video: p.video,
        alt: p.title || "Project",
        aspect: aspects[p.id],
      })),
    [projects, aspects]
  );

  const handleCardClick = (idx: number) => {
    const project = projects[idx];
    if (!project) return;
    const action = getProjectAction(project);
    if (!action) return;
    if (action.external) {
      window.open(action.href, "_blank", "noopener,noreferrer");
    } else {
      router.push(action.href);
    }
  };

  const trackPointer = (e: React.PointerEvent) => {
    if (hoverIdx === null) return;
    const project = projects[hoverIdx];
    if (!project) return;
    const action = getProjectAction(project);
    if (!action) return;
    setCursor({ x: e.clientX, y: e.clientY, text: action.text });
  };

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-10"
      style={{ backgroundColor: "var(--bg)" }}
      onPointerMove={trackPointer}
      onPointerLeave={() => setCursor(null)}
    >
      <SurfWave
        items={items}
        initialIndex={activeIndex}
        onCardClick={handleCardClick}
        onHoverCard={(idx) => {
          setHoverIdx(idx);
          if (idx === null) setCursor(null);
        }}
      />
      {mounted &&
        cursor &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[60] flex items-center justify-center rounded-full px-[10px] py-[5px] text-[12px] leading-none tracking-[-0.02em]"
            style={{
              left: cursor.x + 18,
              top: cursor.y + 18,
              // Inverted against the page so the pill reads in both themes.
              backgroundColor: "var(--fg)",
              color: "var(--bg)",
            }}
          >
            {cursor.text}
          </div>,
          document.body
        )}
    </div>
  );
}
