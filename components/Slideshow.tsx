"use client";

import Image from "next/image";
import { AnimatePresence, motion, type Variants } from "motion/react";
import type { Project } from "@/data/projects";

export type SlideDirection = "next" | "prev";

const DURATION = 1.6;
const EASE = [0.65, 0, 0.35, 1] as const;
const TRANSITION = { duration: DURATION, ease: EASE } as const;

const outerVariants: Variants = {
  enter: (dir: SlideDirection) => ({
    y: dir === "next" ? "100%" : "-100%",
  }),
  center: { y: "0%" },
  exit: (dir: SlideDirection) => ({
    y: dir === "next" ? "-100%" : "100%",
  }),
};

const innerVariants: Variants = {
  enter: (dir: SlideDirection) => ({
    y: dir === "next" ? "-100%" : "100%",
  }),
  center: { y: "0%" },
  exit: { y: "0%" },
};

const imgVariants: Variants = {
  enter: (dir: SlideDirection) => ({
    scaleY: 2,
    transformOrigin: dir === "next" ? "50% 0%" : "50% 100%",
  }),
  center: (dir: SlideDirection) => ({
    scaleY: 1,
    transformOrigin: dir === "next" ? "50% 0%" : "50% 100%",
  }),
  exit: (dir: SlideDirection) => ({
    scaleY: 2,
    transformOrigin: dir === "next" ? "50% 0%" : "50% 100%",
  }),
};

type Props = {
  projects: Project[];
  current: number;
  direction: SlideDirection;
};

export function Slideshow({ projects, current, direction }: Props) {
  const project = projects[current];
  if (!project) return null;

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <AnimatePresence custom={direction} initial={false} mode="sync">
        <motion.div
          key={project.id}
          custom={direction}
          variants={outerVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={TRANSITION}
          className="absolute inset-0 overflow-hidden will-change-transform"
        >
          <motion.div
            custom={direction}
            variants={innerVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={TRANSITION}
            className="absolute inset-0 overflow-hidden will-change-transform"
          >
            <motion.div
              custom={direction}
              variants={imgVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={TRANSITION}
              className="absolute inset-0 will-change-transform"
            >
              <motion.div
                layoutId={project.image.id}
                className="absolute inset-0"
              >
                {project.video ? (
                  <video
                    src={project.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    src={project.image.src}
                    alt={project.title}
                    fill
                    sizes="100vw"
                    priority
                    className="object-cover"
                  />
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
