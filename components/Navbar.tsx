"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { EASE_IN_OUT } from "@/lib/gsap/eases";
import { CharReveal } from "./CharReveal";

export type ViewMode = "surf" | "list" | "index";

const EMAIL = "tirthjivani17@gmail.com";
const BIO =
  "Sr. Product Designer with 4+ years of experience designing AI SaaS products & scalable systems. Specialised in simplifying complex workflows into intuitive user experiences. Built & launched multiple 0→1 products across AI, automation, and analytics, contributing to ARR growth from $4M to $30M. Love experimenting with Claude Code.";

type Props = {
  view?: ViewMode;
};

const LOGO_LARGE = { fontSize: "64px", letterSpacing: "-3.84px" };
const LOGO_SMALL = { fontSize: "14px", letterSpacing: "-0.42px" };

export function Navbar({ view = "list" }: Props) {
  const isList = view === "list";
  const logoRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = logoRef.current;
    if (!el) return;
    const apply = () => {
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      const target = isList && isDesktop ? LOGO_LARGE : LOGO_SMALL;
      gsap.to(el, {
        fontSize: target.fontSize,
        letterSpacing: target.letterSpacing,
        duration: 0.65,
        ease: EASE_IN_OUT,
        overwrite: "auto",
      });
    };
    apply();
    const mq = window.matchMedia("(min-width: 768px)");
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      gsap.killTweensOf(el);
    };
  }, [isList]);

  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = prev;
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const handleContact = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      // ignore - still flash "Copied!" so the affordance feels responsive
    }
    setCopied(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(false), 1500);
  };

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
          className="col-start-1 col-span-4 inline-block font-bold leading-none whitespace-nowrap"
          style={{ ...LOGO_SMALL, transformOrigin: "top left" }}
        >
          TIRTH J.
        </a>

        <div className="col-start-9 col-span-3 hidden max-w-[340px] flex-col gap-[32px] text-[14px] leading-none md:flex">
          <div className="flex gap-[10px]">
            <a href="/" className="text-white">
              Selected Work
            </a>
            <span className="opacity-30">Archives</span>
            <span className="opacity-30">About</span>
          </div>

          <p className="font-normal leading-[1.1]">
            <CharReveal visible={isList}>{BIO}</CharReveal>
          </p>

          <div className="flex flex-col gap-[4px]">
            <div className="flex gap-[4px] whitespace-nowrap">
              <CharReveal visible={isList} className="text-white/30">
                Email:
              </CharReveal>
              <a
                href={`mailto:${EMAIL}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                <CharReveal visible={isList}>{EMAIL}</CharReveal>
              </a>
            </div>
            <div className="flex flex-wrap gap-[4px] whitespace-nowrap">
              <CharReveal visible={isList} className="text-white/30">
                Insta:
              </CharReveal>
              <a
                href="https://instagram.com/tirth.design"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                <CharReveal visible={isList}>@tirth.design</CharReveal>
              </a>
              <a
                href="https://instagram.com/tirth.photos"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                <CharReveal visible={isList}>@tirth.photos</CharReveal>
              </a>
            </div>
            <div className="flex gap-[4px] whitespace-nowrap">
              <CharReveal visible={isList} className="text-white/30">
                Linkedin:
              </CharReveal>
              <a
                href="https://linkedin.com/in/tirthjivani"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                <CharReveal visible={isList}>/tirthjivani</CharReveal>
              </a>
            </div>
          </div>
        </div>

        <div className="col-start-12 col-span-1 flex justify-end">
          <button
            type="button"
            onClick={handleContact}
            className="hidden text-[14px] leading-none text-white/30 transition-opacity duration-150 hover:text-white md:inline-block"
          >
            {copied ? "Copied!" : "Contact"}
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="relative z-[60] text-[14px] leading-none text-white transition-opacity duration-150 md:hidden"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>
    </header>

    <div
      id="mobile-menu"
      aria-hidden={!menuOpen}
      className={`fixed inset-0 z-40 flex flex-col gap-[40px] bg-black px-[20px] pb-[40px] pt-[60px] text-white transition-opacity duration-300 ease-out md:hidden ${
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
