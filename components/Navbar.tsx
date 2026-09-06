"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CharReveal } from "./CharReveal";
import { ThemeToggle } from "./ThemeToggle";
import { SoundToggle } from "./SoundToggle";

export type ViewMode = "surf" | "list";

const EMAIL = "tirthjivani17@gmail.com";
const BIO =
  "Sr. Product Designer with 4+ years of experience designing AI SaaS products & scalable systems. Specialised in simplifying complex workflows into intuitive user experiences. Built & launched multiple 0→1 products across AI, automation, and analytics, contributing to ARR growth from $4M to $30M. Love experimenting with Claude Code.";

type Props = {
  view?: ViewMode;
  introReady?: boolean;
  showBio?: boolean;
  /** Render nav text instantly (no char-reveal) — used on page transitions so
      the navbar / logo don't re-animate when navigating between pages. */
  staticReveal?: boolean;
};

export function Navbar({
  view = "list",
  introReady = true,
  showBio = true,
  staticReveal = false,
}: Props) {
  const isList = view === "list";
  // Top-nav links (Selected Work / Archives / About) persist across every
  // page/view once the intro finishes.
  const reveal = introReady;
  // BIO + social handles belong to the list view only; they hide when the
  // user switches to Grid or Surf and reveal again on return to Vertical.
  // `showBio={false}` suppresses them entirely (e.g. on the About page).
  const revealBio = isList && introReady && showBio;
  const logoRef = useRef<HTMLAnchorElement>(null);

  // Nav links behave like the Vertical/Surf toggle: the current page is full
  // white, the rest dimmed.
  const pathname = usePathname();
  const navLinkCls = (active: boolean) =>
    `transition-colors duration-150 ease-in-out ${
      active
        ? "text-white"
        : "text-white/30 hover:text-white/50 active:text-white/20"
    }`;

  // Logo sizing rules (desktop only — mobile stays small everywhere):
  //  - `/` (list view) keeps the large 64px logo regardless of scroll.
  //  - `/about` starts at 64px and lerps down to 14px over SHRINK_DIST so the
  //    giant footer signature can come into focus as you scroll.
  //  - `/archives` and everything else (e.g. surf view) stay small.
  //
  // Only the /about lerp needs JS; the rest is the responsive class on the
  // element. That matters because this effect writes el.style directly — when
  // React ALSO owned fontSize via the style prop, any unrelated re-render
  // (opening the mobile menu, a route change) snapped the logo back to 64px
  // until the next scroll event repainted it.
  useEffect(() => {
    const el = logoRef.current;
    if (!el) return;
    const shrinks = isList && pathname === "/about";
    const clear = () => {
      el.style.fontSize = "";
      el.style.letterSpacing = "";
    };
    if (!shrinks) {
      clear();
      return;
    }
    const mq = window.matchMedia("(min-width: 768px)");
    const SHRINK_DIST = 220;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const update = () => {
      if (!mq.matches) {
        // Hand sizing back to the class at mobile widths.
        clear();
        return;
      }
      const p = Math.min(1, Math.max(0, window.scrollY / SHRINK_DIST));
      el.style.fontSize = `${lerp(64, 14, p)}px`;
      el.style.letterSpacing = `${lerp(-3.84, -0.42, p)}px`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    mq.addEventListener("change", update);
    return () => {
      window.removeEventListener("scroll", update);
      mq.removeEventListener("change", update);
      clear();
    };
  }, [isList, pathname]);

  const [menuOpen, setMenuOpen] = useState(false);

  // Lock the body only while the menu is actually open, and only touch the
  // style in that window.
  //
  // This used to capture `prev` on every mount and re-apply it on unmount. The
  // Navbar mounts while the Preloader is holding `overflow: hidden`, so `prev`
  // was captured as "hidden" and then written back every time the Navbar
  // unmounted — leaving the body permanently locked from the first route
  // change onward.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
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
        <Link
          ref={logoRef}
          href="/"
          className={`col-start-1 col-span-4 inline-block font-medium leading-none whitespace-nowrap ${
            isList && (pathname === "/" || pathname === "/about")
              ? "text-[14px] tracking-[-0.42px] md:text-[64px] md:tracking-[-3.84px]"
              : "text-[14px] tracking-[-0.42px]"
          }`}
          style={{
            transformOrigin: "top left",
            fontFamily: "var(--font-geist-pixel-circle)",
          }}
        >
          <CharReveal visible={reveal} delay={0.3} instant={staticReveal}>
            Tirth J.
          </CharReveal>
        </Link>

        <div className="col-start-9 col-span-2 hidden max-w-[340px] flex-col gap-[32px] text-[13px] leading-none md:flex">
          <div className="flex gap-[10px]">
            <Link href="/" className={navLinkCls(pathname === "/")}>
              <CharReveal visible={reveal} instant={staticReveal}>
                Selected Work
              </CharReveal>
            </Link>
            <Link
              href="/archives"
              className={navLinkCls(pathname === "/archives")}
            >
              <CharReveal visible={reveal} delay={0.05} instant={staticReveal}>
                Archives
              </CharReveal>
            </Link>
            <Link href="/about" className={navLinkCls(pathname === "/about")}>
              <CharReveal visible={reveal} delay={0.1} instant={staticReveal}>
                About
              </CharReveal>
            </Link>
          </div>

          {showBio && (
            <>
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
            </>
          )}
        </div>

        <div className="col-start-12 col-span-1 flex items-center justify-end gap-[12px]">
          <SoundToggle />
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
      className={`fixed inset-0 z-40 flex flex-col gap-[40px] px-[20px] pb-[40px] transition-opacity duration-300 ease-out md:hidden ${
        menuOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
    >
        {/* Nav block sits ~25% from the top of the viewport. */}
        <nav
          className="flex flex-col gap-[20px] text-[28px] leading-none tracking-[-0.03em]"
          style={{ marginTop: "25vh" }}
        >
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className={navLinkCls(pathname === "/")}
          >
            Selected Work
          </Link>
          <Link
            href="/archives"
            onClick={() => setMenuOpen(false)}
            className={navLinkCls(pathname === "/archives")}
          >
            Archives
          </Link>
          <Link
            href="/about"
            onClick={() => setMenuOpen(false)}
            className={navLinkCls(pathname === "/about")}
          >
            About
          </Link>
        </nav>

        <div className="mt-auto flex flex-col gap-[20px]">
          <p className="text-[16px] leading-[1.35] text-white/80">{BIO}</p>

          <div className="flex flex-col gap-[12px] text-[15px] leading-none">
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
      </div>
    </>
  );
}
