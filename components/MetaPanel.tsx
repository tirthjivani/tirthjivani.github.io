"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ImageEntry } from "@/data/projects";

type Props = {
  activeImage: ImageEntry;
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-[10px] whitespace-nowrap text-[16px] leading-none text-white">
      <span className="w-[72px] shrink-0 text-white/30">{label}</span>
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

export function MetaPanel({ activeImage }: Props) {
  return (
    <aside className="pointer-events-none fixed left-1/2 top-1/2 z-20 hidden -translate-y-1/2 md:block">
      <div className="ml-[5px]">
        <div className="flex flex-col gap-[9px]">
          <Row label="Client" value={activeImage.client} />
          <Row label="Role" value={activeImage.role} />
          <Row label="Category" value={activeImage.category} />
          <Row label="Year" value={activeImage.year} />
        </div>
      </div>
    </aside>
  );
}
