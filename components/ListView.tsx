"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis } from "@/lib/lenis";
import { getProjectAction } from "@/lib/projectAction";
import { Compass } from "./Compass";
import { sizeForAspect } from "./three/list/BendingPlane";
import type { Project } from "@/data/projects";

const ListCanvas = dynamic(
  () => import("./three/list/ListCanvas").then((m) => m.ListCanvas),
  { ssr: false, loading: () => null }
);

const COPIES = 3;
const MIDDLE = 1;
const SECTION_HEIGHT = 360;
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
      style={{ height: SECTION_HEIGHT }}
    >
      <div
        style={{ width: w, height: h, background: "#0b0b0b" }}
        className={action ? "cursor-pointer" : ""}
        onClick={action ? onClick : undefined}
        onMouseEnter={(e) =>
          action && setCursor({ x: e.clientX, y: e.clientY, text: action.text })
        }
        onMouseMove={(e) =>
          action && setCursor({ x: e.clientX, y: e.clientY, text: action.text })
        }
        onMouseLeave={() => setCursor(null)}
        aria-label={project.title}
      />
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

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    const copyH = total * SECTION_HEIGHT;
    const target = copyH * MIDDLE + initialActiveRef.current * SECTION_HEIGHT;
    jumpTo(target);
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [total]);

  useEffect(() => {
    const onScroll = () => {
      if (total === 0) return;
      const copyH = total * SECTION_HEIGHT;
      const center = window.scrollY + window.innerHeight / 2;
      const idx = Math.floor(center / SECTION_HEIGHT);
      const wrapped = ((idx % total) + total) % total;
      onActiveChange(wrapped);

      if (adjustingRef.current) return;
      const sy = window.scrollY;
      if (sy < copyH * 0.5) {
        adjustingRef.current = true;
        jumpTo(sy + copyH);
        requestAnimationFrame(() => {
          adjustingRef.current = false;
        });
      } else if (sy > copyH * (COPIES - 0.5)) {
        adjustingRef.current = true;
        jumpTo(sy - copyH);
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

      <ListCanvas
        projects={projects}
        aspects={aspects}
        sectionHeight={SECTION_HEIGHT}
      />

      {activeProject && (
        <div
          className="pointer-events-none fixed left-0 right-0 top-1/2 z-20 -translate-y-1/2 px-[16px]"
          style={{ mixBlendMode: "difference" }}
        >
          <div className="grid grid-cols-12 gap-x-[10px] text-[14px] leading-none text-white">
            <span className="col-start-3 col-span-3 whitespace-nowrap">
              {activeProject.category ?? "—"}
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
