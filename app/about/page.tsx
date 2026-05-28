"use client";

import { useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { ScrollFlipImage } from "@/components/ScrollFlipImage";
import { CharReveal } from "@/components/CharReveal";

// First / Last bookend the sequence; the middle frames flip in source order.
const ME_FRAMES = [
  "/me/01-first.jpg",
  "/me/02.jpg",
  "/me/03.jpg",
  "/me/04.jpg",
  "/me/05.jpg",
  "/me/06.jpg",
  "/me/07.jpg",
  "/me/08.jpg",
  "/me/09.jpg",
  "/me/10.jpg",
  "/me/11.jpg",
  "/me/12-last.jpg",
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

// TODO: replace the "#" placeholders once the real Dribbble / Figma / X URLs
// are provided. LinkedIn + Instagram are the handles already used in the nav.
const SOCIALS = [
  { label: "LinkedIn", href: "https://linkedin.com/in/tirthjivani" },
  { label: "Instagram", href: "https://instagram.com/tirth.design" },
  { label: "Dribbble", href: "#" },
  { label: "Figma", href: "#" },
  { label: "X", href: "#" },
];

const TYPOGRAPHY = ["Circular Std", "Geist Pixel"];

function Details({ includeServices = false }: { includeServices?: boolean }) {
  return (
    <>
      {includeServices && (
        <>
          <span className="text-white/30">Services</span>
          <p className="mt-[12px] leading-[1.4]">{SERVICES.join(", ")}</p>
          <span className="mt-[28px] block text-white/30">Experiences</span>
        </>
      )}
      {!includeServices && (
        <span className="text-white/30">Experiences</span>
      )}
      <div className="mt-[12px] flex flex-col gap-[8px]">
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
      <div className="mt-[12px] flex flex-col gap-[8px]">
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
      <div className="mt-[12px] flex flex-col gap-[8px]">
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
  return (
    <>
      <Navbar view="list" showBio={false} staticReveal />
      <main className="relative z-10 min-h-screen px-[16px] pb-[16px] pt-[140px] md:pt-[180px]">
        <div className="relative z-[2] grid grid-cols-12 gap-x-[10px]">
          <p
            className="col-span-12 font-normal leading-[1.4] tracking-[-0.02em] text-[18px] text-[color:var(--fg)] md:col-start-1 md:col-span-8 md:text-[42px] md:leading-[1.2]"
          >
            {ABOUT_HEAD}
            <span ref={flipStartRef}>{ABOUT_MARK}</span>
            {ABOUT_TAIL}
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
            <p className="mt-[12px]">{SERVICES.join(", ")}</p>
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

        {/* Giant footer signature — same pixel font as the navbar logo, sized
            so "Tirth J." spans the content area edge-to-edge with the same
            16px gutters as the page (left + right + bottom all match). */}
        <div
          className="mt-[100px] w-full font-medium leading-[0.85] text-[color:var(--fg)]"
          style={{
            fontFamily: "var(--font-geist-pixel-circle)",
            fontSize: "clamp(80px, 31.5vw, 720px)",
            letterSpacing: "-0.06em",
          }}
        >
          <CharReveal visible>Tirth J.</CharReveal>
        </div>
      </main>
    </>
  );
}
