"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Navbar } from "./Navbar";
import type { Project } from "@/data/projects";

const PAGE_BG = "#000000";

function displaySite(url?: string) {
  if (!url) return "—";
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function CaseStudyCover({ project }: { project: Project }) {
  return (
    <section className="relative h-screen w-screen overflow-hidden bg-black">
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
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}
      <h1 className="absolute bottom-[20px] left-[20px] text-[24px] leading-none tracking-[-0.03em] text-white">
        {project.title}
      </h1>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-t border-white/10 py-[14px] text-[14px] leading-none">
      <span className="text-white/40">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}

function CaseStudyHero({ project }: { project: Project }) {
  return (
    <section className="relative px-[20px] py-[120px]">
      <div className="grid grid-cols-12 gap-x-[10px]">
        <div className="col-span-12 md:col-span-7">
          <p className="text-[14px] leading-none text-white/60">Introduction</p>
          <p className="mt-[60px] max-w-[720px] text-[24px] leading-[1.35] tracking-[-0.01em] text-white">
            {project.introduction ?? project.impact ?? project.title}
          </p>
        </div>

        <div className="col-span-12 md:col-span-3 md:col-start-10">
          <p className="text-[14px] leading-none text-white/60">Details</p>
          <div className="mt-[60px]">
            <DetailRow label="Project Name" value={project.title} />
            <DetailRow label="Year" value={project.image.year} />
            <DetailRow label="Type" value={project.category ?? "—"} />
            <DetailRow label="Site" value={displaySite(project.liveLink)} />
            <DetailRow label="Timeline" value={project.timeline ?? "—"} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function CaseStudy({ project }: { project: Project }) {
  useEffect(() => {
    const prevHtml = document.documentElement.style.cssText;
    const prevBody = document.body.style.cssText;
    document.documentElement.style.background = PAGE_BG;
    document.body.style.background = PAGE_BG;
    return () => {
      document.documentElement.style.cssText = prevHtml;
      document.body.style.cssText = prevBody;
    };
  }, []);

  return (
    <>
      <Navbar />
      <main
        className="relative min-h-screen w-full text-white"
        style={{ background: PAGE_BG }}
      >
        <CaseStudyCover project={project} />
        <CaseStudyHero project={project} />
      </main>
    </>
  );
}
