"use client";

import Image from "next/image";
import { motion } from "motion/react";
import type { Project } from "@/data/projects";
import type { ViewMode } from "./Navbar";

const GRID_COL_START = ["col-start-1", "col-start-5", "col-start-9"] as const;

type Props = {
  projects: Project[];
  view: ViewMode;
  onSelectProject: (index: number) => void;
};

export function ProjectsCanvas({ projects, onSelectProject }: Props) {
  return (
    <div className="grid grid-cols-12 gap-y-[40px] px-[20px] pt-[100px] pb-[250px]">
      {projects.map((project, i) => (
        <motion.div
          key={project.id}
          className={`${GRID_COL_START[i % 3]} col-span-3`}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.15 + i * 0.04,
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          <button
            type="button"
            onClick={() => onSelectProject(i)}
            className="flex w-full flex-col gap-[10px] text-left"
          >
            <motion.div
              layoutId={project.image.id}
              className="relative w-full overflow-hidden bg-[#1a1a1a]"
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
                  sizes="33vw"
                  className="block h-auto w-full"
                />
              )}
            </motion.div>
            <p className="text-[16px] leading-none text-white">
              {project.title}
            </p>
          </button>
        </motion.div>
      ))}
    </div>
  );
}
