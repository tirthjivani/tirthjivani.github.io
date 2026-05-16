"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { getLenis } from "@/lib/lenis";
import { getProjectAction } from "@/lib/projectAction";
import { Compass } from "./Compass";
import { sizeForAspect } from "./three/list/BendingPlane";
import type { Project } from "@/data/projects";

const COPIES = 3;
const MIDDLE = 1;
const GAP = 20;
const DEFAULT_ASPECT = 1.6;

type Cursor = { x: number; y: number; text: string } | null;

type Props = {
  projects: Project[];
  activeIndex: number;
  onActiveChange: (idx: number) => void;
};

function jumpTo(y: number) {
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(y, { immediate: true });
  else window.scrollTo({ top: y, behavior: "auto" });
}

function useImageAspects(projects: Project[]): Record<string, number> {
  const [map, setMap] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    projects.forEach((p) => {
      if (p.video) {
        const v = document.createElement("video");
        v.src = p.video;
        v.preload = "metadata";
        v.muted = true;
        const onMeta = () => {
          if (!cancelled && v.videoWidth && v.videoHeight) {
            setMap((prev) =>
              prev[p.id]
                ? prev
                : { ...prev, [p.id]: v.videoWidth / v.videoHeight }
            );
          }
        };
        v.addEventListener("loadedmetadata", onMeta, { once: true });
      } else {
        const img = new window.Image();
        if (p.image.src.startsWith("http")) img.crossOrigin = "anonymous";
        img.src = p.image.src;
        img.onload = () => {
          if (!cancelled && img.naturalWidth && img.naturalHeight) {
            setMap((prev) =>
              prev[p.id]
                ? prev
                : { ...prev, [p.id]: img.naturalWidth / img.naturalHeight }
            );
          }
        };
      }
    });
    return () => {
      cancelled = true;
    };
  }, [projects]);

  return map;
}

function ProjectSection({
  project,
  aspect,
  onClick,
  setCursor,
}: {
  project: Project;
  aspect: number;
  onClick: () => void;
  setCursor: (c: Cursor) => void;
}) {
  const action = getProjectAction(project);
  const { w, h } = sizeForAspect(aspect);

  return (
    <section
      className="relative flex items-center justify-center"
      style={{ height: h, marginBottom: GAP }}
    >
      <div
        style={{
          width: w,
          height: h,
          transform: "scaleY(var(--list-vel-scale, 1))",
          willChange: "transform",
        }}
        className={`relative overflow-hidden bg-[#0b0b0b] ${
          action ? "cursor-pointer" : ""
        }`}
        onClick={action ? onClick : undefined}
        onMouseEnter={(e) =>
          action && setCursor({ x: e.clientX, y: e.clientY, text: action.text })
        }
        onMouseMove={(e) =>
          action && setCursor({ x: e.clientX, y: e.clientY, text: action.text })
        }
        onMouseLeave={() => setCursor(null)}
        aria-label={project.title}
      >
        {project.video ? (
          <video
            src={project.video}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <img
            src={project.image.src}
            alt={project.title}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>
    </section>
  );
}

export function ListView({ projects, activeIndex, onActiveChange }: Props) {
  const total = projects.length;
  const adjustingRef = useRef(false);
  const router = useRouter();
  const [cursor, setCursor] = useState<Cursor>(null);
  const [mounted, setMounted] = useState(false);
  const initialActiveRef = useRef(activeIndex);

  const aspects = useImageAspects(projects);

  // Per-project image heights and their tops within one copy (height + 10px gap each).
  const { sectionTops, copyH } = useMemo(() => {
    const tops: number[] = [];
    let acc = 0;
    projects.forEach((p) => {
      tops.push(acc);
      const h = sizeForAspect(aspects[p.id] ?? DEFAULT_ASPECT).h;
      acc += h + GAP;
    });
    return { sectionTops: tops, copyH: acc };
  }, [projects, aspects]);

  // Keep latest geometry in refs for scroll handler without re-binding listeners.
  const geomRef = useRef({ sectionTops, copyH });
  geomRef.current = { sectionTops, copyH };

  useEffect(() => setMounted(true), []);

  // Drive a CSS variable from lenis scroll velocity so each tile subtly
  // stretches with motion and settles back as velocity decays to zero.
  // The raf keeps lerping after lenis stops emitting so the tail is smooth.
  useEffect(() => {
    const root = document.documentElement;
    let rafId = 0;
    let smoothed = 0;
    let target = 0;
    const lenis = getLenis();
    const onLenisScroll = ({ velocity }: { velocity: number }) => {
      target = velocity;
    };
    const onWheel = (e: WheelEvent) => {
      // Without lenis, fall back to deltaY as a velocity proxy
      target = e.deltaY;
    };
    if (lenis) lenis.on("scroll", onLenisScroll);
    else window.addEventListener("wheel", onWheel, { passive: true });

    const tick = () => {
      smoothed += (target - smoothed) * 0.18;
      if (Math.abs(smoothed) < 0.01 && Math.abs(target) < 0.01) {
        smoothed = 0;
        target = 0;
      }
      // Decay target so non-lenis wheel pulses fade
      target *= 0.9;
      const scale = 1 + smoothed * 0.0008;
      root.style.setProperty("--list-vel-scale", scale.toFixed(4));
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      const l = getLenis();
      if (l) l.off("scroll", onLenisScroll);
      else window.removeEventListener("wheel", onWheel);
      root.style.setProperty("--list-vel-scale", "1");
    };
  }, []);

  useLayoutEffect(() => {
    if (copyH === 0) return;
    const target =
      copyH * MIDDLE + (sectionTops[initialActiveRef.current] ?? 0);
    jumpTo(target);
  }, [total, copyH, sectionTops]);

  useEffect(() => {
    const onScroll = () => {
      const { sectionTops: tops, copyH: cH } = geomRef.current;
      if (total === 0 || cH === 0) return;
      const center = window.scrollY + window.innerHeight / 2;
      const wrappedY = ((center % cH) + cH) % cH;
      let idx = 0;
      for (let i = tops.length - 1; i >= 0; i--) {
        if (tops[i] <= wrappedY) {
          idx = i;
          break;
        }
      }
      onActiveChange(idx);

      if (adjustingRef.current) return;
      const sy = window.scrollY;
      if (sy < cH * 0.5) {
        adjustingRef.current = true;
        jumpTo(sy + cH);
        requestAnimationFrame(() => {
          adjustingRef.current = false;
        });
      } else if (sy > cH * (COPIES - 0.5)) {
        adjustingRef.current = true;
        jumpTo(sy - cH);
        requestAnimationFrame(() => {
          adjustingRef.current = false;
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [total, onActiveChange]);

  const activeProject = projects[Math.min(activeIndex, total - 1)];

  const handleClick = (project: Project) => {
    const action = getProjectAction(project);
    if (!action) return;
    if (action.external) {
      window.open(action.href, "_blank", "noopener,noreferrer");
    } else {
      router.push(action.href);
    }
  };

  const sections = useMemo(
    () =>
      Array.from({ length: COPIES }).flatMap((_, copy) =>
        projects.map((project) => ({
          key: `${copy}-${project.id}`,
          project,
        }))
      ),
    [projects]
  );

  return (
    <>
      <div>
        {sections.map(({ key, project }) => (
          <ProjectSection
            key={key}
            project={project}
            aspect={aspects[project.id] ?? DEFAULT_ASPECT}
            onClick={() => handleClick(project)}
            setCursor={setCursor}
          />
        ))}
      </div>

      {activeProject && (
        <div
          className="pointer-events-none fixed left-0 right-0 top-1/2 z-20 hidden -translate-y-1/2 px-[16px] md:block"
          style={{ mixBlendMode: "difference" }}
        >
          <div className="grid grid-cols-12 gap-x-[10px] text-[14px] leading-none text-white">
            <span className="col-start-3 col-span-3 whitespace-nowrap">
              {activeProject.category ?? "-"}
            </span>
            <span className="col-start-9 col-span-2 whitespace-nowrap">
              {activeProject.image.role}
            </span>
            <span className="col-start-12 col-span-1 justify-self-end whitespace-nowrap">
              {activeProject.image.year}
            </span>
          </div>
        </div>
      )}

      <div
        className="pointer-events-none fixed right-[20px] bottom-[20px] z-30"
        style={{ mixBlendMode: "difference" }}
      >
        <Compass activeIndex={activeIndex} total={total} />
      </div>

      {mounted &&
        cursor &&
        createPortal(
          <div
            className="pointer-events-none fixed z-50 rounded-full bg-white px-[8px] py-[4px] text-[12px] leading-none tracking-[-0.02em] text-black"
            style={{ left: cursor.x + 18, top: cursor.y + 18 }}
          >
            {cursor.text}
          </div>,
          document.body
        )}
    </>
  );
}
