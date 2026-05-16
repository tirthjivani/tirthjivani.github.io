"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Navbar } from "./Navbar";
import { CharReveal } from "./CharReveal";
import type {
  CaseStudyImage,
  CaseStudyLink,
  CaseStudySection,
  Project,
} from "@/data/projects";

const PAGE_BG = "#000000";

function displaySite(url?: string) {
  if (!url) return "-";
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function Reveal({
  children,
  delay = 0,
  className,
  immediate = false,
}: {
  children: string;
  delay?: number;
  className?: string;
  immediate?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(immediate);

  useEffect(() => {
    if (immediate) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [immediate]);

  return (
    <span ref={ref} className="inline-block">
      <CharReveal visible={inView} delay={delay} className={className}>
        {children}
      </CharReveal>
    </span>
  );
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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[240px]"
      >
        <div
          className="absolute inset-0 backdrop-blur-[2px]"
          style={{
            WebkitMaskImage:
              "linear-gradient(to top, black 55%, transparent 100%)",
            maskImage: "linear-gradient(to top, black 55%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0 backdrop-blur-[8px]"
          style={{
            WebkitMaskImage:
              "linear-gradient(to top, black 25%, transparent 70%)",
            maskImage: "linear-gradient(to top, black 25%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 backdrop-blur-[18px]"
          style={{
            WebkitMaskImage:
              "linear-gradient(to top, black 0%, transparent 40%)",
            maskImage: "linear-gradient(to top, black 0%, transparent 40%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)",
          }}
        />
      </div>
      <h1 className="absolute bottom-[20px] left-[20px] text-[28px] leading-none tracking-[-0.03em] text-white md:left-[40px] md:text-[40px]">
        <Reveal immediate delay={0.1}>{project.title}</Reveal>
      </h1>
    </section>
  );
}

function DetailRow({
  label,
  value,
  delay = 0,
}: {
  label: string;
  value: string;
  delay?: number;
}) {
  return (
    <div className="flex items-center justify-between border-t border-white/10 py-[14px] text-[14px] leading-none">
      <Reveal delay={delay} className="text-white/40">{label}</Reveal>
      <Reveal delay={delay + 0.04} className="text-white">{value}</Reveal>
    </div>
  );
}

function CaseStudyHero({ project }: { project: Project }) {
  return (
    <section className="relative px-[20px] py-[80px] md:px-[40px] md:py-[120px]">
      <div className="grid grid-cols-12 gap-x-[10px]">
        <div className="col-span-12 md:col-span-7">
          <p className="text-[14px] leading-none text-white/60">
            <Reveal>Introduction</Reveal>
          </p>
          <p className="mt-[60px] max-w-[720px] text-[24px] leading-[1.35] tracking-[-0.01em] text-white">
            <Reveal delay={0.08}>
              {project.introduction ?? project.impact ?? project.title}
            </Reveal>
          </p>
        </div>

        <div className="col-span-12 md:col-span-3 md:col-start-10">
          <p className="text-[14px] leading-none text-white/60">
            <Reveal delay={0.16}>Details</Reveal>
          </p>
          <div className="mt-[60px]">
            <DetailRow label="Project Name" value={project.title} delay={0.2} />
            <DetailRow label="Year" value={project.image.year} delay={0.24} />
            <DetailRow label="Type" value={project.category ?? "-"} delay={0.28} />
            <DetailRow
              label="Site"
              value={displaySite(project.liveLink)}
              delay={0.32}
            />
            <DetailRow
              label="Timeline"
              value={project.timeline ?? "-"}
              delay={0.36}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function CaseStudyArrowIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 256 256"
      fill="none"
      aria-hidden
      className="block text-white"
    >
      <line
        x1="40"
        y1="128"
        x2="216"
        y2="128"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
      />
      <polyline
        points="144 56 216 128 144 200"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
      />
    </svg>
  );
}

function CaseStudyDeckRow({
  title,
  href,
  index,
}: {
  title: string;
  href?: string;
  index: number;
}) {
  const num = String(index).padStart(2, "0");
  const content = (
    <div className="flex items-center justify-between border-t border-white/10 py-[24px] transition-colors duration-200 ease-out group-hover:border-white">
      <div className="relative">
        <span
          aria-hidden
          className="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
        >
          <CaseStudyArrowIcon />
        </span>
        <span className="block text-[24px] leading-none tracking-[-0.02em] text-white transition-transform duration-300 ease-out group-hover:translate-x-[40px]">
          {title}
        </span>
      </div>
      <span className="text-[14px] leading-none text-white/40">{num}</span>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        {content}
      </a>
    );
  }
  return <div className="group block">{content}</div>;
}

function CaseStudiesList({ items }: { items: CaseStudyLink[] }) {
  const sectionTitle = items.length === 1 ? "Case Study" : "Case Studies";
  return (
    <section className="relative px-[20px] pt-[40px] pb-[80px] md:px-[40px] md:pb-[120px]">
      <div className="grid grid-cols-12 gap-x-[10px]">
        <p className="col-span-12 mb-[40px] text-[14px] leading-none text-white/60">
          <Reveal>{sectionTitle}</Reveal>
        </p>
        <div className="col-span-12">
          {items.map((item, i) => (
            <CaseStudyDeckRow
              key={i}
              title={item.title}
              href={item.href}
              index={i + 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CaseStudyBody({ text }: { text: string }) {
  return (
    <section className="relative px-[20px] py-[40px] md:px-[40px] md:py-[60px]">
      <div className="grid grid-cols-12 gap-x-[10px]">
        <p className="col-span-12 max-w-[920px] text-[20px] leading-[1.45] tracking-[-0.01em] text-white md:col-start-3 md:col-span-8">
          <Reveal>{text}</Reveal>
        </p>
      </div>
    </section>
  );
}

function CaseStudyIntro({ label, heading }: { label: string; heading: string }) {
  return (
    <section className="relative px-[20px] py-[40px] md:px-[40px] md:py-[60px]">
      <div className="grid grid-cols-12 gap-x-[10px]">
        <p className="col-span-12 text-[14px] leading-none text-white/40 md:col-start-3 md:col-span-8">
          <Reveal>{label}</Reveal>
        </p>
        <p className="col-span-12 mt-[40px] max-w-[1100px] text-[32px] leading-[1.25] tracking-[-0.02em] text-white md:col-start-3 md:col-span-9">
          <Reveal delay={0.08}>{heading}</Reveal>
        </p>
      </div>
    </section>
  );
}

function CaseStudyImageCell({ image }: { image: CaseStudyImage }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -10% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const colStart = image.colStart;
  const colSpan = image.colSpan ?? 12;
  const rowSpan = image.rowSpan ?? 1;
  const aspect = image.aspect ?? 16 / 9;

  const gridColumn = colStart
    ? `${colStart} / span ${colSpan}`
    : `span ${colSpan} / span ${colSpan}`;
  const gridRow = rowSpan > 1 ? `span ${rowSpan} / span ${rowSpan}` : undefined;

  return (
    <div style={{ gridColumn, gridRow }}>
      <div
        ref={ref}
        className="relative overflow-hidden bg-white/[0.04]"
        style={{
          aspectRatio: `${aspect}`,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
        }}
      >
        {image.video ? (
          <video
            src={image.src}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <Image
            src={image.src}
            alt={image.alt ?? ""}
            fill
            sizes="100vw"
            className="object-cover"
          />
        )}
      </div>
      {image.caption ? (
        <p className="mt-[10px] text-[14px] leading-[1.4] text-white/40">
          {image.caption}
        </p>
      ) : null}
    </div>
  );
}

function CaseStudyImages({
  items,
  gap = 10,
}: {
  items: CaseStudyImage[];
  gap?: number;
}) {
  return (
    <section className="relative px-[20px] py-[40px]">
      <div
        className="grid grid-cols-12"
        style={{ columnGap: `${gap}px`, rowGap: `${gap}px` }}
      >
        {items.map((image, i) => (
          <CaseStudyImageCell key={i} image={image} />
        ))}
      </div>
    </section>
  );
}

function CaseStudySections({ sections }: { sections: CaseStudySection[] }) {
  return (
    <>
      {sections.map((section, i) => {
        if (section.kind === "body") {
          return <CaseStudyBody key={i} text={section.text} />;
        }
        if (section.kind === "intro") {
          return (
            <CaseStudyIntro
              key={i}
              label={section.label}
              heading={section.heading}
            />
          );
        }
        if (section.kind === "images") {
          return (
            <CaseStudyImages key={i} items={section.items} gap={section.gap} />
          );
        }
        return null;
      })}
    </>
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
      <Navbar view="index" />
      <main
        className="relative min-h-screen w-full text-white"
        style={{ background: PAGE_BG }}
      >
        <CaseStudyCover project={project} />
        <CaseStudyHero project={project} />
        {project.caseStudies && project.caseStudies.length > 0 ? (
          <CaseStudiesList items={project.caseStudies} />
        ) : null}
        {project.sections && project.sections.length > 0 ? (
          <CaseStudySections sections={project.sections} />
        ) : null}
      </main>
    </>
  );
}
