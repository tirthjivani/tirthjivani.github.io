"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Navbar, type ViewMode } from "./Navbar";
import { ProjectsCanvas } from "./ProjectsCanvas";
import { ProjectSidebar } from "./ProjectSidebar";
import { BottomBar } from "./BottomBar";
import { BottomBlur } from "./BottomBlur";
import { Slideshow, type SlideDirection } from "./Slideshow";
import type { Project } from "@/data/projects";

type Props = {
  projects: Project[];
};

const NAV_COOLDOWN = 1700;

export function PortfolioView({ projects }: Props) {
  const total = projects.length;
  const [view, setView] = useState<ViewMode>("list");
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<SlideDirection>("next");
  const lastNavRef = useRef(0);
  const wheelAccumRef = useRef(0);
  const touchStartRef = useRef(0);

  const navigateTo = useCallback(
    (target: number) => {
      if (target === current) return;
      const now = Date.now();
      if (now - lastNavRef.current < NAV_COOLDOWN) return;
      lastNavRef.current = now;

      const goingForward =
        current < target
          ? !(current === 0 && target === total - 1)
          : current === total - 1 && target === 0;
      setDirection(goingForward ? "next" : "prev");
      setCurrent(target);
    },
    [current, total]
  );

  const step = useCallback(
    (dir: SlideDirection) => {
      const now = Date.now();
      if (now - lastNavRef.current < NAV_COOLDOWN) return;
      lastNavRef.current = now;
      setDirection(dir);
      setCurrent((c) => {
        if (dir === "next") return c < total - 1 ? c + 1 : 0;
        return c > 0 ? c - 1 : total - 1;
      });
    },
    [total]
  );

  useEffect(() => {
    if (view !== "list") return;
    const body = document.body;
    const prev = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = prev;
    };
  }, [view]);

  useEffect(() => {
    if (view !== "list") return;
    const TOLERANCE = 10;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastNavRef.current < NAV_COOLDOWN) {
        wheelAccumRef.current = 0;
        return;
      }
      wheelAccumRef.current += e.deltaY;
      if (Math.abs(wheelAccumRef.current) >= TOLERANCE) {
        const dir: SlideDirection = wheelAccumRef.current > 0 ? "next" : "prev";
        wheelAccumRef.current = 0;
        step(dir);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartRef.current = e.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    const onTouchEnd = (e: TouchEvent) => {
      const endY = e.changedTouches[0]?.clientY ?? 0;
      const delta = touchStartRef.current - endY;
      if (Math.abs(delta) < 30) return;
      step(delta > 0 ? "next" : "prev");
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ")
        step("next");
      else if (e.key === "ArrowUp" || e.key === "PageUp") step("prev");
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, [view, step]);

  const handleViewChange = (next: ViewMode) => {
    if (next === view) return;
    if (next === "grid") window.scrollTo({ top: 0, behavior: "auto" });
    setView(next);
  };

  const handleSelectFromGrid = (target: number) => {
    setDirection("next");
    setCurrent(target);
    setView("list");
  };

  const safeCurrent = Math.min(Math.max(current, 0), Math.max(0, total - 1));
  const activeProject = projects[safeCurrent];
  const activeImage = useMemo(() => activeProject?.image, [activeProject]);

  return (
    <>
      <Navbar />
      <main>
        {view === "list" ? (
          <Slideshow
            projects={projects}
            current={safeCurrent}
            direction={direction}
          />
        ) : (
          <ProjectsCanvas
            projects={projects}
            view={view}
            onSelectProject={handleSelectFromGrid}
          />
        )}
      </main>
      <BottomBlur />
      <AnimatePresence>
        {view === "list" && (
          <motion.div
            key="sidebar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <ProjectSidebar
              projects={projects}
              activeIndex={safeCurrent}
              onNavigate={navigateTo}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <BottomBar
        view={view}
        onViewChange={handleViewChange}
        activeProject={activeProject}
        activeImage={activeImage}
        activeIndex={safeCurrent}
        total={total}
      />
    </>
  );
}
