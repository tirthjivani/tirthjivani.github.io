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

const TOTAL_CELLS = 60;
const COPIES = 7;
const COPY_GAP = 80;
const ROW_GAP = 80;
const COL_GAP = 10;
const PROJECT_SLOTS = [
  0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56,
];

export function ProjectsIndex({
  projects,
  activeIndex = 0,
  onSelectProject,
  onHoverProject,
}: Props) {
  const slotToProject = useMemo(() => {
    const map = new Map<number, number>();
    PROJECT_SLOTS.forEach((slotIndex, projectIndex) => {
      if (projectIndex < projects.length) map.set(slotIndex, projectIndex);
    });
    return map;
  }, [projects.length]);

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
    const center = () => container.scrollHeight / 2;

    // Land scroll on the active project's image inside the middle copy so
    // switching from List/Surf keeps the user on the same project.
    const landOnActive = () => {
      const middleCopyIndex = Math.floor(COPIES / 2);
      const slotIndex = PROJECT_SLOTS[initialActiveRef.current];
      const fallback = () => jump(center());
      if (slotIndex === undefined) {
        fallback();
        return;
      }
      const target = first.querySelector(
        `[data-slot="${slotIndex}"]`
      ) as HTMLElement | null;
      if (!target) {
        fallback();
        return;
      }
      const middleCopyTop = (first.offsetHeight + COPY_GAP) * middleCopyIndex;
      const slotCenter = target.offsetTop + target.offsetHeight / 2;
      jump(middleCopyTop + slotCenter - window.innerHeight / 2);
    };

    const recenter = () => landOnActive();
    recenter();

    const onScroll = () => {
      if (adjustingRef.current) return;
      const s = stride();
      const c = center();
      const y = window.scrollY;
      if (y < c - s) {
        adjustingRef.current = true;
        jump(y + s);
        requestAnimationFrame(() => {
          adjustingRef.current = false;
        });
      } else if (y > c + s) {
        adjustingRef.current = true;
        jump(y - s);
        requestAnimationFrame(() => {
          adjustingRef.current = false;
        });
      }
    };

    const ro = new ResizeObserver(() => {
      // First-copy size may shift as images decode; re-center to keep
      // the wrap thresholds aligned with the (possibly new) stride.
      if (!adjustingRef.current) recenter();
    });
    ro.observe(first);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", recenter);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", recenter);
    };
  }, []);

  const renderCell = (cellIndex: number, copyKey: string) => {
    const num = cellIndex + 1;
    const projectIndex = slotToProject.get(cellIndex);
    const project = projectIndex !== undefined ? projects[projectIndex] : null;

    if (project) {
      const action = getProjectAction(project);
      const handleClick = () => {
        if (action) {
          if (action.external) {
            window.open(action.href, "_blank", "noopener,noreferrer");
          } else {
            router.push(action.href);
          }
        } else {
          onSelectProject(projectIndex!);
        }
      };
      return (
        <button
          type="button"
          key={`${copyKey}-${cellIndex}`}
          data-slot={cellIndex}
          onClick={handleClick}
          onMouseEnter={(e) => {
            playHover();
            onHoverProject?.(projectIndex!);
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
    }
    return (
      <div
        key={`${copyKey}-${cellIndex}`}
        data-slot={cellIndex}
        className="relative aspect-[16/10] w-full self-start overflow-hidden text-left"
      >
        <span className="absolute left-0 top-0 text-[14px] leading-none text-white/50">
          {String(num).padStart(2, "0")}
        </span>
      </div>
    );
  };

  const renderCopy = (copyKey: string) => (
    <div
      className="grid grid-cols-6 items-start"
      style={{ rowGap: ROW_GAP, columnGap: COL_GAP }}
    >
      {Array.from({ length: TOTAL_CELLS }, (_, i) => renderCell(i, copyKey))}
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
