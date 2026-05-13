"use client";

import { useEffect, useMemo, useState } from "react";
import { ProjectBlock } from "./ProjectBlock";
import { ProjectSidebar } from "./ProjectSidebar";
import { MetaPanel } from "./MetaPanel";
import { Compass } from "./Compass";
import type { Project } from "@/data/projects";

const NAV_HEIGHT = 36;
const HALF_IMG = "(25vw - 5px) * 240 / 348";
const TOP_PAD = `calc(50vh - ${HALF_IMG} - ${NAV_HEIGHT}px)`;
const BOTTOM_PAD = `calc(50vh - ${HALF_IMG})`;

export function ProjectList({ projects }: { projects: Project[] }) {
  const images = useMemo(
    () => projects.flatMap((p) => p.images),
    [projects]
  );

  const [activeImageId, setActiveImageId] = useState<string>(
    images[0]?.id ?? ""
  );

  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-image-id]")
    );
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
      {
        rootMargin: "-45% 0px -45% 0px",
        threshold: [0, 0.5, 1],
      }
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [projects]);

  const activeImage =
    images.find((img) => img.id === activeImageId) ?? images[0];
  const activeProjectIndex = projects.findIndex((p) =>
    p.images.some((img) => img.id === activeImageId)
  );

  return (
    <>
      <ProjectSidebar
        projects={projects}
        activeIndex={Math.max(0, activeProjectIndex)}
      />
      <MetaPanel activeImage={activeImage} />
      <Compass
        activeIndex={Math.max(0, activeProjectIndex)}
        total={projects.length}
      />
      <div
        className="flex flex-col gap-[10px]"
        style={{ paddingTop: TOP_PAD, paddingBottom: BOTTOM_PAD }}
      >
        {projects.map((project) => (
          <ProjectBlock key={project.id} project={project} />
        ))}
      </div>
    </>
  );
}
