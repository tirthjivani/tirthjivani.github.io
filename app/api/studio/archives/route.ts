import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { isStudioAllowed } from "@/lib/studioGuard";
import type { ArchivesFile } from "@/data/archives";

export const dynamic = "force-dynamic";

const ARCHIVES_PATH = path.join(process.cwd(), "data", "archives.json");

async function readArchives(): Promise<ArchivesFile> {
  const raw = await fs.readFile(ARCHIVES_PATH, "utf8");
  return JSON.parse(raw) as ArchivesFile;
}

async function writeArchives(next: ArchivesFile): Promise<void> {
  const formatted = JSON.stringify(next, null, 2) + "\n";
  await fs.writeFile(ARCHIVES_PATH, formatted, "utf8");
}

export async function GET() {
  if (!(await isStudioAllowed())) {
    return new NextResponse("Not found", { status: 404 });
  }
  return NextResponse.json(await readArchives());
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
  const candidate = body as Partial<ArchivesFile>;
  if (!Array.isArray(candidate.items)) {
    return NextResponse.json({ error: "invalid shape" }, { status: 400 });
  }
  // Light validation: every item needs a src string. Strip any query string
  // (next/image rejects local sources with ?…/#…).
  const cleaned: ArchivesFile = {
    items: candidate.items.map((raw) => {
      if (!raw || typeof raw !== "object") {
        throw new Error("invalid item");
      }
      const it = raw as Record<string, unknown>;
      if (typeof it.src !== "string" || !it.src.trim()) {
        throw new Error("item missing src");
      }
      return {
        src: it.src.replace(/[?#].*$/, ""),
        alt: typeof it.alt === "string" ? it.alt : "",
      };
    }),
  };
  try {
    await writeArchives(cleaned);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "write failed" },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
