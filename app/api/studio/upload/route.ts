import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import os from "node:os";
import crypto from "node:crypto";
import sharp from "sharp";
import ffmpegPath from "ffmpeg-static";
import { isStudioAllowed } from "@/lib/studioGuard";

// sharp + ffmpeg-static ship native binaries and only run on Node (not Edge).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Video transcodes can take a while on long clips. Give the route enough
// budget; without this, Next.js' default would kill ffmpeg mid-encode.
export const maxDuration = 300;

const PROJECTS_DIR = path.join(process.cwd(), "public", "projects");

const IMAGE_EXT = new Set([".webp", ".png", ".jpg", ".jpeg", ".gif"]);
const VIDEO_EXT = new Set([".mp4", ".mov", ".webm"]);

function safeExt(filename: string): { ext: string; kind: "image" | "video" } | null {
  const ext = path.extname(filename).toLowerCase();
  if (IMAGE_EXT.has(ext)) return { ext, kind: "image" };
  if (VIDEO_EXT.has(ext)) return { ext, kind: "video" };
  return null;
}

function sanitize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 64);
}

// Compress an image buffer to WebP via sharp. Default quality (80), and
// WebP retains the alpha channel automatically when the source has one —
// no explicit flag required ("preserve transparent data" is implicit).
async function compressToWebp(input: Buffer): Promise<Buffer> {
  return sharp(input).webp().toBuffer();
}

// Compress a video buffer to mp4 (h264 + aac) via ffmpeg-static. CRF 28 +
// preset medium is a good "default" for web — usually 40–70% size reduction
// vs. an iPhone-recorded mov. ffmpeg can't operate on stdin for many input
// containers (mov atoms live at the end), so we round-trip through /tmp.
async function compressVideo(
  input: Buffer,
  inExt: string
): Promise<Buffer> {
  if (!ffmpegPath) {
    throw new Error("ffmpeg binary not available");
  }
  const id = crypto.randomBytes(8).toString("hex");
  const inPath = path.join(os.tmpdir(), `studio-in-${id}${inExt}`);
  const outPath = path.join(os.tmpdir(), `studio-out-${id}.mp4`);
  await fs.writeFile(inPath, input);
  try {
    await new Promise<void>((resolve, reject) => {
      const proc = spawn(ffmpegPath as string, [
        "-y",
        "-i",
        inPath,
        "-c:v",
        "libx264",
        "-crf",
        "28",
        "-preset",
        "medium",
        // `+faststart` moves the mp4 moov atom to the front so the file
        // starts playing before it's fully downloaded — important for
        // streaming the saved file from /public.
        "-movflags",
        "+faststart",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        outPath,
      ]);
      let stderr = "";
      proc.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });
      proc.on("error", reject);
      proc.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`ffmpeg exit ${code}: ${stderr.slice(-400)}`));
      });
    });
    return await fs.readFile(outPath);
  } finally {
    // Always clean up temp files, even on error.
    await Promise.allSettled([fs.unlink(inPath), fs.unlink(outPath)]);
  }
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
  const detected = safeExt(file.name);
  if (!detected) {
    return NextResponse.json(
      { error: "unsupported file type" },
      { status: 400 }
    );
  }
  await fs.mkdir(PROJECTS_DIR, { recursive: true });
  const inputBuf = Buffer.from(await file.arrayBuffer());
  // Images get rewritten to .webp via Squoosh. Videos pass through unchanged.
  let outBuf: Buffer;
  let outExt: string;
  if (detected.kind === "image") {
    try {
      outBuf = await compressToWebp(inputBuf);
      outExt = ".webp";
    } catch (e) {
      return NextResponse.json(
        {
          error:
            e instanceof Error
              ? `compress failed: ${e.message}`
              : "compress failed",
        },
        { status: 500 }
      );
    }
  } else {
    try {
      outBuf = await compressVideo(inputBuf, detected.ext);
      outExt = ".mp4";
    } catch (e) {
      return NextResponse.json(
        {
          error:
            e instanceof Error
              ? `video compress failed: ${e.message}`
              : "video compress failed",
        },
        { status: 500 }
      );
    }
  }
  // Tagged uploads (case-study section media) get `{slug}-{tag}.{ext}` so
  // multiple media per project don't clobber each other.
  const filename = tag ? `${slug}-${tag}${outExt}` : `${slug}${outExt}`;
  const fullPath = path.join(PROJECTS_DIR, filename);
  await fs.writeFile(fullPath, outBuf);
  return NextResponse.json({
    path: `/projects/${filename}`,
    kind: detected.kind,
  });
}
