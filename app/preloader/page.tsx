import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PreloaderStep } from "@/components/PreloaderStep";
import { projects } from "@/data/projects";
import { isStudioAllowed } from "@/lib/studioGuard";

// Design study for the intro animation — same dev+localhost guard as /studio,
// so it isn't a reachable page in production.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Preloader study",
  robots: { index: false, follow: false },
};

export default async function PreloaderPage() {
  if (!(await isStudioAllowed())) notFound();
  return <PreloaderStep projects={projects} />;
}
