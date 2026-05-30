import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import path from "node:path";
import { isStudioAllowed } from "@/lib/studioGuard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Studio-managed paths. The publish flow only stages files under these so
// random source-tree edits don't get bundled into the CMS commit.
const TRACKED_PATHS = [
  "data/projects.seeds.json",
  "data/archives.json",
  "public/projects",
  "public/archives",
];

type ChangedFile = {
  path: string;
  status: "added" | "modified" | "deleted" | "renamed" | "untracked";
};

function runGit(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn("git", args, { cwd: process.cwd() });
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (c) => {
      stdout += c.toString();
    });
    proc.stderr.on("data", (c) => {
      stderr += c.toString();
    });
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) resolve(stdout);
      else
        reject(
          new Error(
            stderr.trim() || stdout.trim() || `git ${args.join(" ")} failed (${code})`
          )
        );
    });
  });
}

// Parse the porcelain v1 format: "XY path" where X is index status and Y
// is worktree status. Special-case `??` for untracked.
function parsePorcelain(out: string): ChangedFile[] {
  const lines = out.split("\n").filter(Boolean);
  const result: ChangedFile[] = [];
  for (const raw of lines) {
    const code = raw.slice(0, 2);
    const file = raw.slice(3).trim();
    if (!file) continue;
    let status: ChangedFile["status"];
    if (code === "??") status = "untracked";
    else if (code.includes("A")) status = "added";
    else if (code.includes("D")) status = "deleted";
    else if (code.includes("R")) status = "renamed";
    else status = "modified";
    result.push({ path: file, status });
  }
  return result;
}

function withinTracked(file: string): boolean {
  return TRACKED_PATHS.some((root) => {
    if (file === root) return true;
    return file.startsWith(`${root}${path.sep}`) || file.startsWith(`${root}/`);
  });
}

// Working-tree changes (uncommitted) within the tracked paths only.
async function listChanges(): Promise<ChangedFile[]> {
  const out = await runGit(["status", "--porcelain", "--", ...TRACKED_PATHS]);
  return parsePorcelain(out).filter((f) => withinTracked(f.path));
}

export async function GET() {
  if (!(await isStudioAllowed())) {
    return new NextResponse("Not found", { status: 404 });
  }
  try {
    const files = await listChanges();
    // Branch + commits ahead of upstream so the client can show whether
    // there's something already committed that hasn't shipped yet.
    let ahead = 0;
    let branch = "";
    try {
      branch = (await runGit(["rev-parse", "--abbrev-ref", "HEAD"])).trim();
      const aheadStr = (await runGit([
        "rev-list",
        "--count",
        "@{u}..HEAD",
      ])).trim();
      ahead = Number.parseInt(aheadStr, 10) || 0;
    } catch {
      // Branch has no upstream yet; leave defaults.
    }
    return NextResponse.json({ files, ahead, branch });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "status failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  if (!(await isStudioAllowed())) {
    return new NextResponse("Not found", { status: 404 });
  }
  let body: { message?: string } = {};
  try {
    body = (await req.json()) as { message?: string };
  } catch {
    // Empty body is fine — fall back to default message.
  }
  const message = body.message?.trim() || "studio: cms update";
  try {
    const files = await listChanges();
    if (files.length === 0) {
      // Still try to push committed-but-unpushed work.
      try {
        await runGit(["push"]);
      } catch (e) {
        return NextResponse.json(
          { error: e instanceof Error ? e.message : "push failed" },
          { status: 500 }
        );
      }
      return NextResponse.json({ ok: true, committed: false, pushed: true });
    }
    await runGit(["add", "--", ...TRACKED_PATHS]);
    await runGit(["commit", "-m", message]);
    await runGit(["push"]);
    return NextResponse.json({ ok: true, committed: true, pushed: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "publish failed" },
      { status: 500 }
    );
  }
}
