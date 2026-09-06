"use client";

import { useLayoutEffect, useRef } from "react";
import { animate, stagger } from "motion/react";
import { Navbar } from "@/components/Navbar";
import { ScrollFlipImage } from "@/components/ScrollFlipImage";
import { CharReveal } from "@/components/CharReveal";
import { getLenis } from "@/lib/lenis";

// First / Last bookend the sequence; the middle frames flip in source order.
const ME_FRAMES = [
  "/me/01-first.webp",
  "/me/02.webp",
  "/me/03.webp",
  "/me/04.webp",
  "/me/05.webp",
  "/me/06.webp",
  "/me/07.webp",
  "/me/08.webp",
  "/me/09.webp",
  "/me/10.webp",
  "/me/11.webp",
  "/me/12-last.webp",
];

// Split around "Bangalore, India" so we can attach a ref to that marker and
// trigger the image flip the moment it scrolls off the top of the viewport.
const ABOUT_HEAD =
  "Tirth Jivani is a sr. product designer, engineer, and photographer based in ";
const ABOUT_MARK = "Bangalore, India";
const ABOUT_TAIL =
  ". I design products that grow fast and scale clean. I work across UX, design systems, and AI to turn early ideas into real businesses. I've helped take Zapmail to $25M+ ARR, reduced UX complexity by 70% at ReachInbox to improve retention, and built 10+ SaaS products across B2B and B2C from zero to launch. I've also shaped the brand and workspace at Outbox Labs, and presented a product at Google I/O through the ONDC x Google collaboration. I care about making things simple, useful, and built to last. For me, good design is not just how it looks, it is how clearly it works and how well it drives outcomes.";

const EXPERIENCES = [
  { company: "Outbox Labs", years: "2024 - Present" },
  { company: "SellerApp", years: "2021 - 2024" },
  { company: "Truein", years: "2021" },
  { company: "IIRS, ISRO", years: "2019" },
];

const SERVICES = [
  "Creative Direction",
  "Web Design",
  "Web Development",
  "Product Design",
  "Brand Identity",
  "Motion Design",
];

// Entries with a "#" href are placeholders and are filtered out at render —
// fill in a real URL to bring one back. (A live "#" link just opens a blank
// tab onto the same page.)
const SOCIALS = [
  { label: "LinkedIn", href: "https://linkedin.com/in/tirthjivani" },
  { label: "Instagram", href: "https://instagram.com/tirth.design" },
  { label: "Dribbble", href: "#" },
  { label: "Figma", href: "#" },
  { label: "X", href: "#" },
].filter((s) => s.href !== "#");

const TYPOGRAPHY = ["Circular Std", "Geist Pixel"];

// Pixel-letter SVGs that compose the giant "Tirth J." footer signature.
// Each glyph is 358 units tall (dot is 57 — sits on the baseline). Widths
// from the source SVG viewBoxes; tweaking these per-char shifts the kerning.
// `gap` adds units of empty space AFTER this char (used for the word space
// between "Tirth" and "J." plus the small gap before the period).
const SIG_GLYPH_H = 358;
const SIG_LETTER_GAP = 24;
const SIG_WORD_GAP = 140;
type SigChar = { src: string; w: number; h: number; gap: number; alt: string };
const SIG_CHARS: SigChar[] = [
  { src: "/sigchars/T.svg",   w: 264, h: 358, gap: SIG_LETTER_GAP, alt: "T" },
  { src: "/sigchars/I.svg",   w: 38,  h: 358, gap: SIG_LETTER_GAP, alt: "i" },
  { src: "/sigchars/R.svg",   w: 245, h: 358, gap: SIG_LETTER_GAP, alt: "r" },
  { src: "/sigchars/T-1.svg", w: 264, h: 358, gap: SIG_LETTER_GAP, alt: "t" },
  { src: "/sigchars/H.svg",   w: 264, h: 358, gap: SIG_WORD_GAP,   alt: "h" },
  { src: "/sigchars/J.svg",   w: 227, h: 358, gap: SIG_LETTER_GAP, alt: "J" },
  { src: "/sigchars/dot.svg", w: 57,  h: 57,  gap: 0,              alt: "." },
];
const SIG_TOTAL_W = SIG_CHARS.reduce((s, c) => s + c.w + c.gap, 0);

function Details({ includeServices = false }: { includeServices?: boolean }) {
  return (
    <>
      {includeServices && (
        <>
          <span className="text-white/30">Services</span>
          <p className="mt-[6px] leading-[1.4]">{SERVICES.join(", ")}</p>
          <span className="mt-[28px] block text-white/30">Experiences</span>
        </>
      )}
      {!includeServices && (
        <span className="text-white/30">Experiences</span>
      )}
      <div className="mt-[6px] flex flex-col gap-[8px]">
        {EXPERIENCES.map((e) => (
          <div
            key={e.company}
            className="flex items-baseline justify-between gap-x-[10px]"
          >
            <span>{e.company}</span>
            <span className="text-white/50">{e.years}</span>
          </div>
        ))}
      </div>

      <span className="mt-[28px] block text-white/30">Socials</span>
      <div className="mt-[6px] flex flex-col gap-[8px]">
        {SOCIALS.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/60"
          >
            {s.label}
          </a>
        ))}
      </div>

      <span className="mt-[28px] block text-white/30">Typography</span>
      <div className="mt-[6px] flex flex-col gap-[8px]">
        {TYPOGRAPHY.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </>
  );
}

export default function AboutPage() {
  const socialsEndRef = useRef<HTMLDivElement | null>(null);
  const flipStartRef = useRef<HTMLSpanElement | null>(null);
  const sigRef = useRef<HTMLDivElement | null>(null);

  // Lenis preserves scrollY across route changes — when arriving here from
  // the (long) list page, that meant landing pre-scrolled to the bottom. Pin
  // /about to the top on mount, syncing both window and lenis state so the
  // smooth-scroll layer doesn't immediately animate back to its prior value.
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

  // Reveal each pixel glyph by sliding it UP from below the text baseline —
  // every char starts at `translateY(rowHeight)` (one container-height below
  // its slot, fully clipped by the wrap's `overflow-hidden` mask) and rises
  // into place. Stagger 0.12 per glyph for a clear one-after-the-other beat.
  // Fires the first time the footer enters the viewport (IntersectionObserver,
  // one-shot). Re-measures the start offset on resize until it plays.
  useLayoutEffect(() => {
    const root = sigRef.current;
    if (!root) return;
    const items = Array.from(
      root.querySelectorAll<HTMLElement>("[data-sigchar]")
    );
    if (items.length === 0) return;
    let played = false;
    let startY = root.clientHeight;
    const setInitial = () => {
      for (const el of items) {
        el.style.transform = `translateY(${startY}px)`;
        el.style.opacity = "1";
      }
    };
    setInitial();
    const ro = new ResizeObserver(() => {
      if (played) return;
      startY = root.clientHeight;
      setInitial();
    });
    ro.observe(root);
    let controls: ReturnType<typeof animate> | null = null;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !played) {
            played = true;
            ro.disconnect();
            controls = animate(
              items,
              { y: [startY, 0] },
              {
                duration: 0.9,
                ease: [0.16, 1, 0.3, 1],
                delay: stagger(0.12, { startDelay: 0.05 }),
              }
            );
            obs.disconnect();
          }
        }
      },
      { threshold: 0.05 }
    );
    obs.observe(root);
    return () => {
      obs.disconnect();
      ro.disconnect();
      controls?.stop();
    };
  }, []);

  return (
    <>
      <Navbar view="list" showBio={false} staticReveal />
      <main className="relative z-10 min-h-screen px-[16px] pb-[16px] pt-[140px] md:pt-[180px]">
        <div className="relative z-[2] grid grid-cols-12 gap-x-[10px]">
          <p
            className="col-span-12 font-normal leading-[1.4] tracking-[-0.02em] text-[18px] text-[color:var(--fg)] md:col-start-1 md:col-span-8 md:text-[42px] md:leading-[1.2]"
          >
            <CharReveal visible enterStagger={0.008}>
              {ABOUT_HEAD}
            </CharReveal>
            <span ref={flipStartRef}>
              <CharReveal
                visible
                enterStagger={0.008}
                delay={ABOUT_HEAD.length * 0.008}
              >
                {ABOUT_MARK}
              </CharReveal>
            </span>
            <CharReveal
              visible
              enterStagger={0.008}
              delay={(ABOUT_HEAD.length + ABOUT_MARK.length) * 0.008}
            >
              {ABOUT_TAIL}
            </CharReveal>
          </p>
        </div>

        {/* Image column: full-width on phones; 45vw, centered on desktop,
            pulled up to the 2nd-to-last text line and BEHIND the copy
            (z-0 vs text z-2). Services list is absolutely positioned at the
            image's bottom-left (no flow impact, so the row below stays at
            image bottom). */}
        <div className="relative z-0 mx-auto mt-[40px] w-full md:mt-[-101px] md:w-[45vw]">
          <ScrollFlipImage
            frames={ME_FRAMES}
            className="w-full"
            startTarget={flipStartRef}
            endTarget={socialsEndRef}
          />
          <div
            className="absolute left-0 hidden max-w-[280px] text-[13px] leading-[1.4] text-white md:block"
            style={{
              top: "100%",
              transform: "translateY(-30px)",
              mixBlendMode: "difference",
            }}
          >
            <span className="text-white/30">Services</span>
            <p className="mt-[6px]">{SERVICES.join(", ")}</p>
          </div>
        </div>

        {/* Phone: details stacked right below the image. */}
        <div className="mt-[40px] text-[13px] leading-none text-white md:hidden">
          <Details includeServices />
        </div>

        {/* Desktop: Experiences/Socials right-aligned under the "Selected
            Work" tab col, sharing the same `marginTop: -30px` as the absolute-
            positioned Services on the left, so both sit at the same y. */}
        <div
          className="relative z-[2] hidden grid-cols-12 gap-x-[10px] text-[13px] leading-none text-white md:grid"
          style={{ marginTop: "-30px", mixBlendMode: "difference" }}
        >
          <div ref={socialsEndRef} className="col-start-10 col-span-3">
            <Details />
          </div>
        </div>

        {/* Giant footer signature — composed from per-glyph pixel SVGs in
            /public/sigchars. The row uses the page's content width (matching
            the navbar's 16px gutter on all sides: main already has px-[16px]
            + pb-[16px]; the wrap stays `w-full` instead of full-bleed). Each
            char is sized by percentage of the total natural-width sum so the
            line kisses both content edges at every breakpoint. The dot sits
            on the baseline via `items-end`. */}
        <div
          ref={sigRef}
          className="mt-[120px] md:mt-[200px] lg:mt-[320px] flex w-full items-end overflow-hidden text-[color:var(--fg)]"
          aria-label="Tirth J."
          style={{
            aspectRatio: `${SIG_TOTAL_W} / ${SIG_GLYPH_H}`,
          }}
        >
          {SIG_CHARS.flatMap((c, i) => {
            const nodes = [
              // CSS mask + bg-current is what makes the glyph follow the
              // current text color (theme-aware). An <img src=".svg"> would
              // render the SVG's baked fill instead of inheriting via
              // `currentColor`.
              <span
                key={`g-${i}`}
                data-sigchar
                aria-label={c.alt}
                className="block bg-current"
                style={{
                  width: `${(c.w / SIG_TOTAL_W) * 100}%`,
                  height: `${(c.h / SIG_GLYPH_H) * 100}%`,
                  flexShrink: 0,
                  WebkitMaskImage: `url(${c.src})`,
                  maskImage: `url(${c.src})`,
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskSize: "100% 100%",
                  maskSize: "100% 100%",
                  willChange: "transform, opacity",
                }}
              />,
            ];
            if (c.gap > 0) {
              nodes.push(
                <span
                  key={`s-${i}`}
                  aria-hidden
                  className="block"
                  style={{
                    width: `${(c.gap / SIG_TOTAL_W) * 100}%`,
                    height: "1px",
                    flexShrink: 0,
                  }}
                />
              );
            }
            return nodes;
          })}
        </div>
      </main>
    </>
  );
}
