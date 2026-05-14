"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Navbar, type ViewMode } from "./Navbar";
import { ProjectsCanvas } from "./ProjectsCanvas";
import { ProjectSidebar } from "./ProjectSidebar";
import { MetaPanel } from "./MetaPanel";
import { Compass } from "./Compass";
import type { Project } from "@/data/projects";

type Props = {
  projects: Project[];
};

export function PortfolioView({ projects }: Props) {
  const [view, setView] = useState<ViewMode>("list");
  const images = useMemo(() => projects.flatMap((p) => p.images), [projects]);
  const [activeImageId, setActiveImageId] = useState(images[0]?.id ?? "");

  useEffect(() => {
    if (view !== "list") return;
    const nodes = Array.from(document.querySelectorAll("[data-image-id]"));
    if (nodes.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0];
        if (top) {
          const id = top.target.getAttribute("data-image-id");
          if (id) setActiveImageId(id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.5, 1] }
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [view, projects]);

  const activeImage =
    images.find((img) => img.id === activeImageId) ?? images[0];
  const activeProjectIndex = projects.findIndex((p) =>
    p.images.some((img) => img.id === activeImageId)
  );

  const handleViewChange = (next: ViewMode) => {
    if (next === view) return;
    window.scrollTo({ top: 0, behavior: "auto" });
    setView(next);
  };

  return (
    <>
      <Navbar view={view} onViewChange={handleViewChange} />
      <main>
        <ProjectsCanvas projects={projects} view={view} />
      </main>
      <AnimatePresence>
        {view === "list" && (
          <motion.div
            key="chrome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <ProjectSidebar
              projects={projects}
              activeIndex={Math.max(0, activeProjectIndex)}
            />
            <MetaPanel activeImage={activeImage} />
            <Compass
              activeIndex={Math.max(0, activeProjectIndex)}
              total={projects.length}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
