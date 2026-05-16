"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getProjectAction } from "@/lib/projectAction";
import type { Project } from "@/data/projects";

const PARALLAX_PX = 50;
const COPIES = 3;

function ProjectSection({ project }: { project: Project }) {
  const sectionRef = useRef<HTMLElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const action = getProjectAction(project);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!sectionRef.current || !layerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        layerRef.current,
        { y: -PARALLAX_PX },
        {
          y: PARALLAX_PX,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleClick = () => {
    if (!action) return;
    if (action.external) {
      window.open(action.href, "_blank", "noopener,noreferrer");
    } else {
      router.push(action.href);
    }
  };

  return (
    <section ref={sectionRef} className="relative h-screen w-screen overflow-hidden">
      <div
        ref={layerRef}
        style={{ top: `-${PARALLAX_PX}px`, bottom: `-${PARALLAX_PX}px` }}
        className={`absolute left-0 right-0 will-change-transform ${
          action ? "cursor-pointer" : ""
        }`}
        onClick={action ? handleClick : undefined}
        onMouseEnter={
          action ? (e) => setCursor({ x: e.clientX, y: e.clientY }) : undefined
        }
        onMouseMove={
          action ? (e) => setCursor({ x: e.clientX, y: e.clientY }) : undefined
        }
        onMouseLeave={() => setCursor(null)}
      >
        {project.video ? (
          <video
            src={project.video}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <Image
            src={project.image.src}
            alt={project.title}
            fill
            sizes="100vw"
            className="object-cover"
          />
        )}
      </div>
      {mounted &&
        cursor &&
        action &&
        cursor.x >= window.innerWidth * 0.1 &&
        createPortal(
          <div
            className="pointer-events-none fixed z-50 flex items-center justify-center rounded-full bg-white px-[8px] py-[4px] text-[14px] leading-none tracking-[-0.42px] text-black"
            style={{ left: cursor.x + 20, top: cursor.y + 20 }}
          >
            {action.text}
          </div>,
          document.body
        )}
    </section>
  );
}

export function Slideshow({ projects }: { projects: Project[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure ScrollTrigger picks up the new content height after mount.
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, []);

  // Unused but keeps a stable mount lifecycle for ScrollTrigger
  void wrapRef;

  return (
    <div ref={wrapRef}>
      {Array.from({ length: COPIES }, (_, copy) =>
        projects.map((project) => (
          <ProjectSection key={`${copy}-${project.id}`} project={project} />
        ))
      )}
    </div>
  );
}
