"use client";

import { useEffect, useRef, useState } from "react";
import { animate, type AnimationPlaybackControls } from "motion/react";
import { CharReveal } from "./CharReveal";
import { ThemeToggle } from "./ThemeToggle";

const EASE_IN_OUT: [number, number, number, number] = [0.42, 0, 0.58, 1];

export type ViewMode = "surf" | "list";

const EMAIL = "tirthjivani17@gmail.com";
const BIO =
  "Sr. Product Designer with 4+ years of experience designing AI SaaS products & scalable systems. Specialised in simplifying complex workflows into intuitive user experiences. Built & launched multiple 0→1 products across AI, automation, and analytics, contributing to ARR growth from $4M to $30M. Love experimenting with Claude Code.";

type Props = {
  view?: ViewMode;
  introReady?: boolean;
};

const LOGO_LARGE = { fontSize: "64px", letterSpacing: "-3.84px" };
const LOGO_SMALL = { fontSize: "14px", letterSpacing: "-0.42px" };

export function Navbar({ view = "list", introReady = true }: Props) {
  const isList = view === "list";
  // Top-nav links (Selected Work / Archives / About) persist across every
  // page/view once the intro finishes.
  const reveal = introReady;
  // BIO + social handles belong to the list view only; they hide when the
  // user switches to Grid or Surf and reveal again on return to Vertical.
  const revealBio = isList && introReady;
  const logoRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = logoRef.current;
    if (!el) return;
    let controls: AnimationPlaybackControls | null = null;
    const apply = () => {
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      const target = isList && isDesktop ? LOGO_LARGE : LOGO_SMALL;
      controls?.stop();
      controls = animate(
        el,
        {
          fontSize: target.fontSize,
          letterSpacing: target.letterSpacing,
        },
        { duration: 0.65, ease: EASE_IN_OUT }
      );
    };
    apply();
    const mq = window.matchMedia("(min-width: 768px)");
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      controls?.stop();
    };
  }, [isList]);

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = prev;
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <>
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{ mixBlendMode: "difference" }}
    >
      <div className="grid grid-cols-12 items-start gap-x-[10px] px-[16px] pt-[16px] text-white">
        <a
          ref={logoRef}
          href="/"
          className="col-start-1 col-span-4 inline-block font-medium leading-none whitespace-nowrap"
          style={{
            ...(isList ? LOGO_LARGE : LOGO_SMALL),
            transformOrigin: "top left",
            fontFamily: "var(--font-geist-pixel-circle)",
          }}
        >
          <CharReveal visible={reveal} delay={0.3}>Tirth J.</CharReveal>
        </a>

        <div className="col-start-10 col-span-2 hidden max-w-[340px] flex-col gap-[32px] text-[13px] leading-none md:flex">
          <div className="flex gap-[10px]">
            <a href="/" className="text-white">
              <CharReveal visible={reveal}>Selected Work</CharReveal>
            </a>
            <span className="opacity-30">
              <CharReveal visible={reveal} delay={0.05}>
                Archives
              </CharReveal>
            </span>
            <span className="opacity-30">
              <CharReveal visible={reveal} delay={0.1}>
                About
              </CharReveal>
            </span>
          </div>

          <p className="font-normal leading-[1.1]">
            <CharReveal visible={revealBio}>{BIO}</CharReveal>
          </p>

          <div className="flex flex-col gap-[4px]">
            <div className="flex gap-[4px] whitespace-nowrap">
              <CharReveal visible={revealBio} className="text-white/30">
                Email:
              </CharReveal>
              <a
                href={`mailto:${EMAIL}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                <CharReveal visible={revealBio}>{EMAIL}</CharReveal>
              </a>
            </div>
            <div className="flex flex-wrap gap-[4px] whitespace-nowrap">
              <CharReveal visible={revealBio} className="text-white/30">
                Insta:
              </CharReveal>
              <a
                href="https://instagram.com/tirth.design"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                <CharReveal visible={revealBio}>@tirth.design</CharReveal>
              </a>
              <a
                href="https://instagram.com/tirth.photos"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                <CharReveal visible={revealBio}>@tirth.photos</CharReveal>
              </a>
            </div>
            <div className="flex gap-[4px] whitespace-nowrap">
              <CharReveal visible={revealBio} className="text-white/30">
                Linkedin:
              </CharReveal>
              <a
                href="https://linkedin.com/in/tirthjivani"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                <CharReveal visible={revealBio}>/tirthjivani</CharReveal>
              </a>
            </div>
          </div>
        </div>

        <div className="col-start-12 col-span-1 flex items-center justify-end gap-[12px]">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="relative z-[60] text-[13px] leading-none text-white transition-opacity duration-150 md:hidden"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>
    </header>

    <div
      id="mobile-menu"
      aria-hidden={!menuOpen}
      style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
      className={`fixed inset-0 z-40 flex flex-col gap-[40px] px-[20px] pb-[40px] pt-[60px] transition-opacity duration-300 ease-out md:hidden ${
        menuOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
    >
        <nav className="flex flex-col gap-[20px] text-[28px] leading-none tracking-[-0.03em]">
          <a href="/" onClick={() => setMenuOpen(false)}>
            Selected Work
          </a>
          <span className="text-white/30">Archives</span>
          <span className="text-white/30">About</span>
        </nav>

        <p className="text-[16px] leading-[1.35] text-white/80">{BIO}</p>

        <div className="mt-auto flex flex-col gap-[12px] text-[15px] leading-none">
          <div className="flex gap-[6px]">
            <span className="text-white/30">Email:</span>
            <a
              href={`mailto:${EMAIL}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {EMAIL}
            </a>
          </div>
          <div className="flex flex-wrap gap-[6px]">
            <span className="text-white/30">Insta:</span>
            <a
              href="https://instagram.com/tirth.design"
              target="_blank"
              rel="noopener noreferrer"
            >
              @tirth.design
            </a>
            <a
              href="https://instagram.com/tirth.photos"
              target="_blank"
              rel="noopener noreferrer"
            >
              @tirth.photos
            </a>
          </div>
          <div className="flex gap-[6px]">
            <span className="text-white/30">Linkedin:</span>
            <a
              href="https://linkedin.com/in/tirthjivani"
              target="_blank"
              rel="noopener noreferrer"
            >
              /tirthjivani
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
