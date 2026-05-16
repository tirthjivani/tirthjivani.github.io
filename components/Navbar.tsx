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
    const target = isList ? LOGO_LARGE : LOGO_SMALL;
    const t = gsap.to(el, {
      fontSize: target.fontSize,
      letterSpacing: target.letterSpacing,
      duration: 0.65,
      ease: EASE_IN_OUT,
    });
    return () => {
      t.kill();
    };
  }, [isList]);

  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleContact = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      // ignore — still flash "Copied!" so the affordance feels responsive
    }
    setCopied(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(false), 1500);
  };

  return (
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

        <div className="col-start-9 col-span-3 flex max-w-[340px] flex-col gap-[32px] text-[14px] leading-none">
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
            className="text-[14px] leading-none text-white/30 transition-opacity duration-150 hover:text-white"
          >
            {copied ? "Copied!" : "Contact"}
          </button>
        </div>
      </div>
    </header>
  );
}
