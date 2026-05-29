"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { animate } from "motion/react";
import { Navbar, type ViewMode } from "./Navbar";
import { ProjectSidebar } from "./ProjectSidebar";
import { BottomBar } from "./BottomBar";
import { ListView } from "./ListView";
import { SurfCanvas } from "./SurfCanvas";
import { Preloader } from "./Preloader";
import { IntroOverlay } from "./IntroOverlay";
import { getLenis } from "@/lib/lenis";
import type { Project } from "@/data/projects";

const EASE_IN_OUT: [number, number, number, number] = [0.42, 0, 0.58, 1];

// Plays the preloader only on a real fresh load (reload / hard refresh / first
// visit). Internal nav (clicking "Selected Work" or the logo, even from a
// different page like /about) skips it. sessionStorage survives cross-route
// SPA navs; a separate INIT flag ensures the `reload` clear-out runs exactly
// once per page-load, not on every PortfolioView remount — otherwise revisiting
// / from /about would re-clear INTRO_FLAG (because nav.type stays "reload"
// for the lifetime of the document) and replay the intro every time.
const INTRO_FLAG = "portfolio:introPlayed";
const INIT_FLAG = "portfolio:introInitialized";
function readIntroSeen(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem(INIT_FLAG) !== "1") {
      const nav = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming | undefined;
      if (nav?.type === "reload") {
        sessionStorage.removeItem(INTRO_FLAG);
      }
      sessionStorage.setItem(INIT_FLAG, "1");
    }
    return sessionStorage.getItem(INTRO_FLAG) === "1";
  } catch {
    return false;
  }
}

type Props = {
  projects: Project[];
};

function smoothScrollTo(y: number) {
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(y);
  else window.scrollTo({ top: y, behavior: "smooth" });
}

function SidebarPresence({
  visible,
  children,
}: {
  visible: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) setMounted(true);
  }, [visible]);

  useLayoutEffect(() => {
    if (!mounted || !ref.current) return;
    if (visible) {
      const controls = animate(
        ref.current,
        { opacity: [0, 1] },
        { duration: 0.9, ease: EASE_IN_OUT, delay: 0.7 }
      );
      return () => {
        controls.stop();
      };
    }
    const controls = animate(
      ref.current,
      { opacity: 0 },
      { duration: 0.4, ease: EASE_IN_OUT }
    );
    controls.then(() => setMounted(false)).catch(() => {});
    return () => {
      controls.stop();
    };
  }, [visible, mounted]);

  if (!mounted) return null;
  return (
    <div ref={ref} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

export function PortfolioView({ projects }: Props) {
  const total = projects.length;
  const [view, setView] = useState<ViewMode>("list");
  const [activeIndex, setActiveIndex] = useState(0);
  const [, setHoveredIndex] = useState<number | null>(null);
  // Two-stage intro: `preloading` blocks interaction + keeps Preloader mounted
  // until the whole animation finishes; `textReady` flips earlier, the moment
  // the stack starts scrolling up, so navbar / sidebar / bottombar text reveal
  // alongside the upward translate instead of after it. The preloader plays on
  // every load — no caching / skip.
  // Initialise with `false` on the server so SSR matches everywhere; on the
  // client we read sessionStorage in a layout effect (before paint).
  const [preloading, setPreloading] = useState(true);
  const [textReady, setTextReady] = useState(false);
  const [introSeen, setIntroSeen] = useState(false);
  useLayoutEffect(() => {
    if (readIntroSeen()) {
      setPreloading(false);
      setTextReady(true);
      setIntroSeen(true);
    }
  }, []);

  const revealText = useCallback(() => {
    setTextReady(true);
  }, []);

  const finishPreload = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_FLAG, "1");
    } catch {}
    setIntroSeen(true);
    setPreloading(false);
    setTextReady(true);
  }, []);

  const SECTION_PX = 360;

  const navigateTo = useCallback(
    (target: number) => {
      const copyH = total * SECTION_PX;
      const curCopy = Math.floor(window.scrollY / copyH);
      smoothScrollTo(curCopy * copyH + target * SECTION_PX);
    },
    [total]
  );

  const handleViewChange = (next: ViewMode) => {
    if (next === view) return;
    // Each view positions itself to activeIndex on mount — keeps the user on
    // the same project across List / Surf.
    setView(next);
  };

  const safeCurrent = Math.min(Math.max(activeIndex, 0), Math.max(0, total - 1));

  return (
    <>
      {preloading && <Preloader />}
      {preloading && view === "list" && (
        <IntroOverlay
          projects={projects}
          onReveal={revealText}
          onDone={finishPreload}
        />
      )}
      <Navbar view={view} introReady={textReady} staticReveal={introSeen} />
      <main>
        {view === "list" ? (
          <ListView
            projects={projects}
            activeIndex={safeCurrent}
            onActiveChange={setActiveIndex}
            introReady={textReady}
            intro={false}
            onIntroReveal={revealText}
            onIntroDone={finishPreload}
          />
        ) : (
          <SurfCanvas
            projects={projects}
            activeIndex={safeCurrent}
            onHoverProject={setHoveredIndex}
          />
        )}
      </main>
      <SidebarPresence visible={view === "list" && textReady}>
        <ProjectSidebar
          projects={projects}
          activeIndex={safeCurrent}
          onNavigate={navigateTo}
        />
      </SidebarPresence>
      <BottomBar
        view={view}
        onViewChange={handleViewChange}
        introReady={textReady}
      />
    </>
  );
}
