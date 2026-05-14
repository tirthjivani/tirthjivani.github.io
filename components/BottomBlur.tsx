"use client";

import { motion } from "motion/react";

export function BottomBlur() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      aria-hidden
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-20 hidden h-[240px] md:block"
    >
      <div
        className="absolute inset-0 backdrop-blur-[2px]"
        style={{
          WebkitMaskImage:
            "linear-gradient(to top, black 55%, transparent 100%)",
          maskImage: "linear-gradient(to top, black 55%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-0 backdrop-blur-[8px]"
        style={{
          WebkitMaskImage:
            "linear-gradient(to top, black 25%, transparent 70%)",
          maskImage: "linear-gradient(to top, black 25%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 backdrop-blur-[18px]"
        style={{
          WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 40%)",
          maskImage: "linear-gradient(to top, black 0%, transparent 40%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)",
        }}
      />
    </motion.div>
  );
}
