"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getLenis } from "@/lib/lenis";
import { getProjectAction } from "@/lib/projectAction";
import type { Project } from "@/data/projects";

type Props = {
  projects: Project[];
  activeIndex?: number;
  onSelectProject: (index: number) => void;
  onHoverProject?: (index: number | null) => void;
};

const COLS = 6;
const COPIES = 3;
const MIDDLE_COPY = 1;
const ROW_GAP = 80;
const COL_GAP = 10;
// Make the inter-copy spacing match the inter-row spacing so the wrap point
// reads as just another row of the grid — no visible boundary between copies.
const COPY_GAP = ROW_GAP;

export function ProjectsIndex({
  projects,
  activeIndex = 0,
  onSelectProject,
  onHoverProject,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstCopyRef = useRef<HTMLDivElement>(null);
  const adjustingRef = useRef(false);
  const hoverAudioRef = useRef<HTMLAudioElement | null>(null);
  const [cursor, setCursor] = useState<
    { x: number; y: number; text: string } | null
  >(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const audio = new Audio("/fx.mp3");
    audio.preload = "auto";
    audio.volume = 0.5;
    hoverAudioRef.current = audio;
    return () => {
      hoverAudioRef.current = null;
    };
  }, []);

  const playHover = () => {
    const a = hoverAudioRef.current;
    if (!a) return;
    a.currentTime = 0;
    a.play().catch(() => {});
  };

  const initialActiveRef = useRef(activeIndex);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const first = firstCopyRef.current;
    if (!container || !first) return;

    const jump = (y: number) => {
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(y, { immediate: true });
      else window.scrollTo({ top: y, behavior: "auto" });
    };

    const stride = () => first.offsetHeight + COPY_GAP;

    // Land scroll on the active project's tile inside the middle copy so
    // switching from List/Surf keeps the user on the same project.
    const landOnActive = () => {
      const s = stride();
      const middleCopyTop = s * MIDDLE_COPY;
      const target = first.querySelector(
        `[data-project="${initialActiveRef.current}"]`
      ) as HTMLElement | null;
      if (!target) {
        jump(middleCopyTop);
        return;
      }
      const tileCenter = target.offsetTop + target.offsetHeight / 2;
      jump(middleCopyTop + tileCenter - window.innerHeight / 2);
    };

    landOnActive();

    const wrap = () => {
      if (adjustingRef.current) return;
      const s = stride();
      const y = window.scrollY;
      let target: number | null = null;
      if (y < s * 0.5) target = y + s;
      else if (y > s * 2.5) target = y - s;
      if (target === null) return;
      adjustingRef.current = true;
      jump(target);
      requestAnimationFrame(() => {
        adjustingRef.current = false;
      });
    };

    const ro = new ResizeObserver(() => {
      if (!adjustingRef.current) landOnActive();
    });
    ro.observe(first);

    const lenis = getLenis();
    if (lenis) {
      lenis.on("scroll", wrap);
    } else {
      window.addEventListener("scroll", wrap, { passive: true });
    }
    window.addEventListener("resize", landOnActive);
    return () => {
      ro.disconnect();
      const l = getLenis();
      if (l) l.off("scroll", wrap);
      else window.removeEventListener("scroll", wrap);
      window.removeEventListener("resize", landOnActive);
    };
  }, []);

  const renderProject = (
    project: Project,
    projectIndex: number,
    copyKey: string
  ) => {
    const action = getProjectAction(project);
    const handleClick = () => {
      if (action) {
        if (action.external) {
          window.open(action.href, "_blank", "noopener,noreferrer");
        } else {
          router.push(action.href);
        }
      } else {
        onSelectProject(projectIndex);
      }
    };
    return (
      <button
        type="button"
        key={`${copyKey}-${projectIndex}`}
        data-project={projectIndex}
        onClick={handleClick}
        onMouseEnter={(e) => {
          playHover();
          onHoverProject?.(projectIndex);
          if (action) {
            setCursor({ x: e.clientX, y: e.clientY, text: action.text });
          }
        }}
        onMouseMove={(e) => {
          if (action) {
            setCursor({ x: e.clientX, y: e.clientY, text: action.text });
          }
        }}
        onMouseLeave={() => {
          onHoverProject?.(null);
          setCursor(null);
        }}
        className="relative block w-full self-start overflow-hidden text-left"
      >
        {project.video ? (
          <video
            src={project.video}
            autoPlay
            loop
            muted
            playsInline
            width={2880}
            height={1800}
            className="block h-auto w-full"
          />
        ) : (
          <Image
            src={project.image.src}
            alt={project.title}
            width={2880}
            height={1800}
            sizes="16vw"
            className="block h-auto w-full"
          />
        )}
      </button>
    );
  };

  const renderCopy = (copyKey: string) => (
    <div
      className="grid items-start"
      style={{
        gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
        rowGap: ROW_GAP,
        columnGap: COL_GAP,
      }}
    >
      {projects.map((p, i) => renderProject(p, i, copyKey))}
    </div>
  );

  return (
    <>
      <div ref={containerRef} className="px-[20px] py-[80px]">
        {Array.from({ length: COPIES }, (_, copy) => (
          <div
            key={copy}
            ref={copy === 0 ? firstCopyRef : undefined}
            style={{ marginTop: copy > 0 ? COPY_GAP : 0 }}
          >
            {renderCopy(`c${copy}`)}
          </div>
        ))}
      </div>
      {mounted &&
        cursor &&
        cursor.x >= window.innerWidth * 0.1 &&
        createPortal(
          <div
            className="pointer-events-none fixed z-50 flex items-center justify-center rounded-full bg-white px-[8px] py-[4px] text-[14px] leading-none tracking-[-0.42px] text-black"
            style={{ left: cursor.x + 20, top: cursor.y + 20 }}
          >
            {cursor.text}
          </div>,
          document.body
        )}
    </>
  );
}
