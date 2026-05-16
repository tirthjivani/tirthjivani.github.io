import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CaseStudy } from "@/components/CaseStudy";
import { projects } from "@/data/projects";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return projects.filter((p) => p.caseStudy).map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);
  if (!project) return { title: "Not found" };
  return {
    title: `${project.title} - Tirth Jivani`,
    description:
      project.seoDescription ??
      project.introduction ??
      project.impact ??
      project.title,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);
  if (!project || !project.caseStudy) notFound();
  return <CaseStudy project={project} />;
}
