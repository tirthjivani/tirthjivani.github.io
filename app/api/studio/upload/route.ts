import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { isStudioAllowed } from "@/lib/studioGuard";

export const dynamic = "force-dynamic";

const PROJECTS_DIR = path.join(process.cwd(), "public", "projects");

const ALLOWED_EXT = new Set([
  ".webp",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".mp4",
  ".mov",
  ".webm",
]);

function safeExt(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXT.has(ext) ? ext : "";
}

function sanitize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 64);
}

export async function POST(req: Request) {
  if (!(await isStudioAllowed())) {
    return new NextResponse("Not found", { status: 404 });
  }
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid form" }, { status: 400 });
  }
  const file = form.get("file");
  const slugRaw = form.get("slug");
  const tagRaw = form.get("tag");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing file" }, { status: 400 });
  }
  if (typeof slugRaw !== "string" || !slugRaw.trim()) {
    return NextResponse.json({ error: "missing slug" }, { status: 400 });
  }
  const slug = sanitize(slugRaw);
  if (!slug) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  }
  const tag = typeof tagRaw === "string" ? sanitize(tagRaw) : "";
  const ext = safeExt(file.name);
  if (!ext) {
    return NextResponse.json(
      { error: "unsupported file type" },
      { status: 400 }
    );
  }
  await fs.mkdir(PROJECTS_DIR, { recursive: true });
  // Tagged uploads (case-study section media) get `{slug}-{tag}.{ext}` so
  // multiple media per project don't clobber each other.
  const filename = tag ? `${slug}-${tag}${ext}` : `${slug}${ext}`;
  const fullPath = path.join(PROJECTS_DIR, filename);
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(fullPath, buf);
  return NextResponse.json({
    path: `/projects/${filename}`,
    kind: ext.match(/\.(mp4|mov|webm)$/) ? "video" : "image",
  });
}
