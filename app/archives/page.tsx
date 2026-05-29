"use client";

import { useLayoutEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { archives as ARCHIVES } from "@/data/archives";
import { getLenis } from "@/lib/lenis";

export default function ArchivesPage() {
  // Match /about: lenis preserves scroll across SPA navs, so reset to top so
  // the page never opens mid-scroll.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    getLenis()?.scrollTo(0, { immediate: true });
  }, []);

  return (
    <>
      <Navbar view="list" showBio={false} staticReveal />
      <main className="relative z-10 min-h-screen px-[16px] pb-[16px] pt-[140px] md:pt-[180px]">
        {/* CSS multi-column masonry: columns flow images top-to-bottom, with
            `break-inside: avoid` keeping each image atomic. Column count
            scales with viewport so the gutter stays tight on every breakpoint. */}
        <div
          className="[column-gap:10px] columns-1 md:columns-2 lg:columns-3"
          style={{ columnFill: "balance" }}
        >
          {ARCHIVES.map((item, i) => (
            <div
              key={i}
              className="mb-[10px] inline-block w-full overflow-hidden"
              style={{ breakInside: "avoid" }}
            >
              <img
                src={item.src}
                alt={item.alt ?? ""}
                draggable={false}
                loading="lazy"
                decoding="async"
                className="block h-auto w-full object-cover"
              />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
