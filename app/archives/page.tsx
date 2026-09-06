"use client";

import { useLayoutEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { archives as ARCHIVES, altFromPath } from "@/data/archives";
import { getLenis } from "@/lib/lenis";

export default function ArchivesPage() {
  // Match /about: lenis preserves scroll across SPA navs, so reset to top so
  // the page never opens mid-scroll.
  useLayoutEffect(() => {
    // Reset twice: once now, and once after the browser has settled the new
    // (much shorter) document. Leaving `/` mid-scroll leaves a scroll offset
    // that outlives the route change — the browser clamps it to this page's
    // max and lenis re-syncs to that, which landed you at the BOTTOM of the
    // page instead of the top.
    const reset = () => {
      window.scrollTo(0, 0);
      getLenis()?.scrollTo(0, { immediate: true, force: true });
    };
    reset();
    const raf = requestAnimationFrame(reset);
    return () => cancelAnimationFrame(raf);
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
                alt={
                  item.alt?.trim() ||
                  altFromPath(item.src) ||
                  `Archive image ${i + 1}`
                }
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
