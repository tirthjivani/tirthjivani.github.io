"use client";

import Image from "next/image";
import { motion } from "motion/react";
import type { Project } from "@/data/projects";
import type { ViewMode } from "./Navbar";

const NAV_HEIGHT = 36;
const HALF_IMG = "(25vw - 5px) * 240 / 348";
const TOP_PAD = `calc(50vh - ${HALF_IMG} - ${NAV_HEIGHT}px)`;
const BOTTOM_PAD = `calc(50vh - ${HALF_IMG})`;

const SHARED_TRANSITION = { duration: 0.7, ease: [0.4, 0, 0.2, 1] as const };

const GRID_COL_START = [
  "col-start-1",
  "col-start-4",
  "col-start-7",
  "col-start-10",
] as const;

type Props = {
  projects: Project[];
  view: ViewMode;
};

export function ProjectsCanvas({ projects, view }: Props) {
  if (view === "grid") {
    const cards = projects.flatMap((p) =>
      p.images.map((img) => ({ img, project: p }))
    );
    return (
      <div className="grid grid-cols-12 gap-y-[40px] px-[10px] pt-[56px] pb-[40px]">
        {cards.map(({ img, project }, i) => (
          <a
            key={img.id}
            href={`#${project.id}`}
            className={`${GRID_COL_START[i % 4]} col-span-2 flex flex-col gap-[10px]`}
          >
            <motion.div
              layoutId={img.id}
              transition={SHARED_TRANSITION}
              data-image-id={img.id}
              className="relative aspect-[228/252] w-full overflow-hidden bg-[#1a1a1a]"
            >
              <Image
                src={img.src}
                alt={project.title}
                fill
                sizes="25vw"
                className="object-cover"
              />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.25, ease: "easeOut" }}
              className="text-[16px] leading-none text-white"
            >
              {project.title}
            </motion.p>
          </a>
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-[10px]"
      style={{ paddingTop: TOP_PAD, paddingBottom: BOTTOM_PAD }}
    >
      {projects.map((project) => (
        <section
          key={project.id}
          id={project.id}
          data-project-id={project.id}
          className="grid grid-cols-12 px-[10px] [scroll-margin-top:calc(50vh-(25vw-5px)*240/348)]"
        >
          <div className="col-start-3 col-span-3 flex flex-col gap-[10px]">
            {project.images.map((img, i) => (
              <motion.div
                key={img.id}
                layoutId={img.id}
                transition={SHARED_TRANSITION}
                data-image-id={img.id}
                className="relative aspect-[348/480] w-full overflow-hidden bg-[#1a1a1a]"
              >
                <Image
                  src={img.src}
                  alt={`${project.title} — image ${i + 1}`}
                  fill
                  sizes="(min-width: 768px) 25vw, 90vw"
                  className="object-cover"
                />
              </motion.div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
