import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { isStudioAllowed } from "@/lib/studioGuard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Renames are constrained to /public/archives and /public/projects — the
// rest of /public is leave-alone (fonts, fx audio, etc.).
const PUBLIC_ROOT = path.join(process.cwd(), "public");
const ALLOWED_ROOTS = ["archives", "projects"];

function sanitizeBasename(s: string): string {
  // Only keep filesystem-safe chars; collapse dashes.
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96);
}

export async function POST(req: Request) {
  if (!(await isStudioAllowed())) {
    return new NextResponse("Not found", { status: 404 });
  }
  let body: { oldPath?: string; newName?: string };
  try {
    body = (await req.json()) as { oldPath?: string; newName?: string };
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const oldPathRaw = body.oldPath;
  const newName = body.newName;
  if (typeof oldPathRaw !== "string" || !oldPathRaw.trim()) {
    return NextResponse.json({ error: "missing oldPath" }, { status: 400 });
  }
  if (typeof newName !== "string" || !newName.trim()) {
    return NextResponse.json({ error: "missing newName" }, { status: 400 });
  }
  // Normalize the source path: must point into /public/<allowed>/...
  const cleanOld = oldPathRaw.split("?")[0].replace(/^\/+/, "");
  const oldAbs = path.resolve(PUBLIC_ROOT, cleanOld);
  if (!oldAbs.startsWith(PUBLIC_ROOT + path.sep)) {
    return NextResponse.json({ error: "out-of-bounds path" }, { status: 400 });
  }
  const rel = path.relative(PUBLIC_ROOT, oldAbs);
  const root = rel.split(path.sep)[0];
  if (!ALLOWED_ROOTS.includes(root)) {
    return NextResponse.json(
      { error: `rename only allowed under ${ALLOWED_ROOTS.join(", ")}` },
      { status: 400 }
    );
  }
  try {
    await fs.access(oldAbs);
  } catch {
    return NextResponse.json({ error: "source not found" }, { status: 404 });
  }
  // Preserve the original extension — renaming a .webp into .png on disk
  // without re-encoding would break the actual format.
  const oldExt = path.extname(oldAbs);
  // Allow the user to include an extension in newName, but force it back to
  // the original — sanitize and strip any extension the user typed.
  const newBase = sanitizeBasename(newName.replace(/\.[a-z0-9]+$/i, ""));
  if (!newBase) {
    return NextResponse.json({ error: "invalid newName" }, { status: 400 });
  }
  const dir = path.dirname(oldAbs);
  const newAbs = path.join(dir, `${newBase}${oldExt}`);
  if (newAbs === oldAbs) {
    // No-op rename — return the original path.
    return NextResponse.json({ path: `/${rel.split(path.sep).join("/")}` });
  }
  // Refuse to clobber an existing file with the same name.
  try {
    await fs.access(newAbs);
    return NextResponse.json(
      { error: "a file with that name already exists" },
      { status: 409 }
    );
  } catch {
    // Good — target doesn't exist.
  }
  await fs.rename(oldAbs, newAbs);
  // Videos carry a sibling poster still (`clip.mp4` → `clip-poster.webp`, see
  // lib/posterFor.ts). Carry it along, or the renamed clip resolves to a
  // poster that no longer exists.
  if (/\.(mp4|mov|webm)$/i.test(oldExt)) {
    const oldPoster = oldAbs.replace(/\.[a-z0-9]+$/i, "-poster.webp");
    const newPoster = newAbs.replace(/\.[a-z0-9]+$/i, "-poster.webp");
    try {
      await fs.rename(oldPoster, newPoster);
    } catch {
      // No poster on disk (pre-convention upload) — nothing to move.
    }
  }
  const newRel = path.relative(PUBLIC_ROOT, newAbs).split(path.sep).join("/");
  return NextResponse.json({ path: `/${newRel}` });
}
