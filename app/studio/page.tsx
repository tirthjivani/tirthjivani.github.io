import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isStudioAllowed } from "@/lib/studioGuard";
import { StudioClient } from "./StudioClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export default async function StudioPage() {
  if (!(await isStudioAllowed())) {
    notFound();
  }
  return <StudioClient />;
}
