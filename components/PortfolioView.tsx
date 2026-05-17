"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { animate } from "motion/react";
import { Navbar, type ViewMode } from "./Navbar";
import { ProjectsIndex } from "./ProjectsIndex";
import { ProjectSidebar } from "./ProjectSidebar";
import { BottomBar } from "./BottomBar";
import { BottomBlur } from "./BottomBlur";
import { ListView } from "./ListView";
import { SurfCanvas } from "./SurfCanvas";
import { Preloader } from "./Preloader";
import { getLenis } from "@/lib/lenis";
import { getPhotoItems } from "@/data/photos";
import { useAvailablePhotos } from "@/lib/useAvailablePhotos";
import type { Project } from "@/data/projects";

const EASE_IN_OUT: [number, number, number, number] = [0.42, 0, 0.58, 1];

type Props = {
  projects: Project[];
};

function smoothScrollTo(y: number) {
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(y);
  else window.scrollTo({ top: y, behavior: "smooth" });
}

function SidebarPresence({
  visible,
  children,
}: {
  visible: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) setMounted(true);
  }, [visible]);

  useLayoutEffect(() => {
    if (!mounted || !ref.current) return;
    if (visible) {
      const controls = animate(
        ref.current,
        { opacity: [0, 1] },
        { duration: 0.9, ease: EASE_IN_OUT, delay: 0.7 }
      );
      return () => {
        controls.stop();
      };
    }
    const controls = animate(
      ref.current,
      { opacity: 0 },
      { duration: 0.4, ease: EASE_IN_OUT }
    );
    controls.then(() => setMounted(false)).catch(() => {});
    return () => {
      controls.stop();
    };
  }, [visible, mounted]);

  if (!mounted) return null;
  return (
    <div ref={ref} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

export function PortfolioView({ projects }: Props) {
  const total = projects.length;
  const [view, setView] = useState<ViewMode>("list");
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [preloading, setPreloading] = useState(true);

  const finishPreload = useCallback(() => {
    setPreloading(false);
  }, []);

  const SECTION_PX = 360;

  const navigateTo = useCallback(
    (target: number) => {
      const copyH = total * SECTION_PX;
      const curCopy = Math.floor(window.scrollY / copyH);
      smoothScrollTo(curCopy * copyH + target * SECTION_PX);
    },
    [total]
  );

  const handleViewChange = (next: ViewMode) => {
    if (next === view) return;
    // Each view positions itself to activeIndex on mount — keeps the user on
    // the same project across List / Grid / Surf.
    setView(next);
  };

  const handleSelectProject = (target: number) => {
    setActiveIndex(target);
    setView("list");
  };

  const safeCurrent = Math.min(Math.max(activeIndex, 0), Math.max(0, total - 1));
  const activeProject = projects[safeCurrent];
  const activeImage = useMemo(() => activeProject?.image, [activeProject]);
  const hoveredProject =
    hoveredIndex !== null ? projects[hoveredIndex] ?? null : null;

  const availablePhotos = useAvailablePhotos();
  const surfItems = useMemo(
    () => [...projects, ...getPhotoItems(availablePhotos)],
    [projects, availablePhotos]
  );

  return (
    <>
      {preloading && <Preloader />}
      <Navbar view={view} introReady={!preloading} />
      <main>
        {view === "list" ? (
          <ListView
            projects={projects}
            activeIndex={safeCurrent}
            onActiveChange={setActiveIndex}
            introReady={!preloading}
            intro={preloading}
            onIntroDone={finishPreload}
          />
        ) : view === "surf" ? (
          <SurfCanvas
            projects={surfItems}
            activeIndex={safeCurrent}
            onHoverProject={setHoveredIndex}
          />
        ) : (
          <ProjectsIndex
            projects={projects}
            activeIndex={safeCurrent}
            onSelectProject={handleSelectProject}
            onHoverProject={setHoveredIndex}
          />
        )}
      </main>
      <BottomBlur />
      <SidebarPresence visible={view === "list" && !preloading}>
        <ProjectSidebar
          projects={projects}
          activeIndex={safeCurrent}
          onNavigate={navigateTo}
        />
      </SidebarPresence>
      <BottomBar
        view={view}
        onViewChange={handleViewChange}
        activeProject={activeProject}
        activeImage={activeImage}
        activeIndex={safeCurrent}
        total={total}
        hoveredProject={hoveredProject}
        hoveredIndex={hoveredIndex}
        introReady={!preloading}
      />
    </>
  );
}
