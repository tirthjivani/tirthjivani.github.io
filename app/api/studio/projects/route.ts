import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { isStudioAllowed } from "@/lib/studioGuard";
import type { ProjectSeedsFile } from "@/data/projects";

export const dynamic = "force-dynamic";

const SEEDS_PATH = path.join(process.cwd(), "data", "projects.seeds.json");

async function readSeeds(): Promise<ProjectSeedsFile> {
  const raw = await fs.readFile(SEEDS_PATH, "utf8");
  return JSON.parse(raw) as ProjectSeedsFile;
}

async function writeSeeds(next: ProjectSeedsFile): Promise<void> {
  const formatted = JSON.stringify(next, null, 2) + "\n";
  await fs.writeFile(SEEDS_PATH, formatted, "utf8");
}

export async function GET() {
  if (!(await isStudioAllowed())) {
    return new NextResponse("Not found", { status: 404 });
  }
  const data = await readSeeds();
  return NextResponse.json(data);
}

export async function PUT(req: Request) {
  if (!(await isStudioAllowed())) {
    return new NextResponse("Not found", { status: 404 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }
  const candidate = body as Partial<ProjectSeedsFile>;
  if (!Array.isArray(candidate.projects) || !Array.isArray(candidate.hidden)) {
    return NextResponse.json({ error: "invalid shape" }, { status: 400 });
  }
  // Light validation: every project needs at minimum slug + title + caseStudy.
  for (const p of candidate.projects) {
    if (!p || typeof p !== "object") {
      return NextResponse.json({ error: "invalid project" }, { status: 400 });
    }
    const pr = p as Record<string, unknown>;
    if (typeof pr.slug !== "string" || !pr.slug.trim()) {
      return NextResponse.json({ error: "project missing slug" }, { status: 400 });
    }
    if (typeof pr.title !== "string") {
      return NextResponse.json({ error: "project missing title" }, { status: 400 });
    }
    if (typeof pr.caseStudy !== "boolean") {
      return NextResponse.json({ error: "project missing caseStudy" }, { status: 400 });
    }
  }
  // Defense in depth: next/image rejects local src with query strings, so
  // strip ?…/#… from any path-like field before persisting.
  const cleaned = stripQueriesFromSeeds(candidate as ProjectSeedsFile);
  await writeSeeds(cleaned);
  return NextResponse.json({ ok: true });
}

function stripQuery(v: unknown): unknown {
  if (typeof v !== "string") return v;
  return v.replace(/[?#].*$/, "");
}

function stripQueriesFromSeeds(seeds: ProjectSeedsFile): ProjectSeedsFile {
  return {
    hidden: seeds.hidden,
    projects: seeds.projects.map((p) => {
      const next = { ...p };
      if (typeof next.src === "string") next.src = next.src.replace(/[?#].*$/, "");
      if (typeof next.video === "string")
        next.video = next.video.replace(/[?#].*$/, "");
      if (Array.isArray(next.sections)) {
        next.sections = next.sections.map((s) => {
          if (s.kind === "images") {
            return {
              ...s,
              items: s.items.map((it) => ({
                ...it,
                src: typeof it.src === "string" ? (stripQuery(it.src) as string) : it.src,
              })),
            };
          }
          return s;
        });
      }
      return next;
    }),
  };
}
