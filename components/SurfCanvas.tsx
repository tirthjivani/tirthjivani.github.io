"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { getLenis } from "@/lib/lenis";
import { getProjectAction } from "@/lib/projectAction";
import { getCyclePx } from "@/lib/three/galleryLayout";
import type { Project } from "@/data/projects";

const Scene = dynamic(
  () => import("./three/Scene").then((m) => m.Scene),
  {
    ssr: false,
    loading: () => null,
  }
);

type Props = {
  projects: Project[];
  activeIndex?: number;
  onHoverProject?: (index: number | null) => void;
};

type HoverPayload = { x: number; y: number; index: number } | null;

export function SurfCanvas({ projects, activeIndex = 0, onHoverProject }: Props) {
  const router = useRouter();
  const [hover, setHover] = useState<HoverPayload>(null);
  const [mounted, setMounted] = useState(false);
  const wrappingRef = useRef(false);

  const cyclePx = useMemo(() => getCyclePx(projects.length), [projects.length]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const prevHtml = document.documentElement.style.cssText;
    const prevBody = document.body.style.cssText;
    const total = 3 * cyclePx + window.innerHeight;
    document.documentElement.style.background = "#000000";
    document.body.style.background = "#000000";
    document.body.style.minHeight = `${total}px`;
    document.body.style.position = "relative";

    const lenis = getLenis();
    const startAt = cyclePx;
    if (lenis) {
      lenis.scrollTo(startAt, { immediate: true });
      lenis.resize();
    } else {
      window.scrollTo({ top: startAt, behavior: "auto" });
    }

    const wrap = () => {
      if (wrappingRef.current) return;
      const y = window.scrollY;
      let target: number | null = null;
      if (y < cyclePx * 0.5) target = y + cyclePx;
      else if (y > cyclePx * 2.5) target = y - cyclePx;
      if (target === null) return;
      wrappingRef.current = true;
      const l = getLenis();
      if (l) l.scrollTo(target, { immediate: true });
      else window.scrollTo({ top: target, behavior: "auto" });
      requestAnimationFrame(() => {
        wrappingRef.current = false;
      });
    };

    if (lenis) {
      lenis.on("scroll", wrap);
    } else {
      window.addEventListener("scroll", wrap, { passive: true });
    }

    return () => {
      document.documentElement.style.cssText = prevHtml;
      document.body.style.cssText = prevBody;
      const l = getLenis();
      if (l) {
        l.off("scroll", wrap);
        l.resize();
      } else {
        window.removeEventListener("scroll", wrap);
      }
    };
  }, [cyclePx]);

  useEffect(() => {
    onHoverProject?.(hover ? hover.index : null);
  }, [hover, onHoverProject]);

  const handleSelect = (project: Project) => {
    const action = getProjectAction(project);
    if (!action) return;
    if (action.external) {
      window.open(action.href, "_blank", "noopener,noreferrer");
    } else {
      router.push(action.href);
    }
  };

  const hoveredProject =
    hover && projects[hover.index] ? projects[hover.index] : null;
  const hoveredAction = hoveredProject
    ? getProjectAction(hoveredProject)
    : null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-10"
      aria-label="Surf gallery"
    >
      <div className="absolute inset-0 bg-black" />
      <div className="pointer-events-auto absolute inset-0 z-10">
        <Scene
          projects={projects}
          cyclePx={cyclePx}
          initialOffset={
            projects.length > 0 ? activeIndex / projects.length : 0
          }
          onHoverChange={setHover}
          onSelect={handleSelect}
        />
      </div>
      {mounted &&
        hover &&
        hoveredAction &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[60] flex items-center justify-center rounded-full bg-white px-[10px] py-[5px] text-[12px] leading-none tracking-[-0.02em] text-black"
            style={{ left: hover.x + 18, top: hover.y + 18 }}
          >
            {hoveredAction.text}
          </div>,
          document.body
        )}
    </div>
  );
}
