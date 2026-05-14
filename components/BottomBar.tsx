"use client";

import { AnimatePresence, motion } from "motion/react";
import { Compass } from "./Compass";
import type { ViewMode } from "./Navbar";
import type { ImageEntry, Project } from "@/data/projects";

type Props = {
  view: ViewMode;
  onViewChange: (next: ViewMode) => void;
  activeProject: Project | undefined;
  activeImage: ImageEntry | undefined;
  activeIndex: number;
  total: number;
};

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-[10px] whitespace-nowrap text-[16px] leading-none">
      <span className="text-white/30">{label}</span>
      <span className="relative inline-flex">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={value}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="inline-block whitespace-nowrap"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}

export function BottomBar({
  view,
  onViewChange,
  activeProject,
  activeImage,
  activeIndex,
  total,
}: Props) {
  const showListChrome = view === "list";

  return (
    <div className="pointer-events-none fixed bottom-[20px] left-0 right-0 z-30 hidden md:block">
      <div className="grid grid-cols-12 items-end px-[20px] text-[16px] leading-none tracking-[-0.03em] text-white">
        <div className="pointer-events-auto col-start-1 col-span-3 flex gap-[10px]">
          <button
            type="button"
            onClick={() => onViewChange("list")}
            className={`transition-colors duration-300 ease-in-out ${
              view === "list" ? "text-white" : "text-white/30 hover:text-white/60"
            }`}
          >
            List
          </button>
          <button
            type="button"
            onClick={() => onViewChange("grid")}
            className={`transition-colors duration-300 ease-in-out ${
              view === "grid" ? "text-white" : "text-white/30 hover:text-white/60"
            }`}
          >
            Grids
          </button>
          <span className="text-white/30">Index</span>
        </div>

        <AnimatePresence>
          {showListChrome && activeImage && activeProject && (
            <motion.div
              key="chrome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="contents"
            >
              <div className="col-start-4 col-span-3 max-w-[160px] text-[16px] leading-[1.4]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={activeProject.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {activeProject.impact ?? ""}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="col-start-7 col-span-3 flex flex-col gap-[10px]">
                <Pair label="Role" value={activeImage.role} />
                <Pair label="Category" value={activeImage.category} />
              </div>

              <div className="col-start-10 col-span-2 flex flex-col gap-[10px]">
                <Pair label="Client" value={activeImage.client} />
                <Pair label="Year" value={activeImage.year} />
              </div>

              <div className="col-start-12 col-span-1 flex justify-end">
                <Compass activeIndex={activeIndex} total={total} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
