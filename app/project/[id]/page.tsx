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
  // The root layout's title template appends " - Tirth Jivani", so the title
  // here is just the project name.
  const description =
    project.seoDescription ??
    project.introduction ??
    project.impact ??
    project.title;
  return {
    title: project.title,
    description,
    alternates: { canonical: `/project/${project.id}` },
    openGraph: {
      type: "article",
      title: `${project.title} - Tirth Jivani`,
      description,
      url: `/project/${project.id}`,
      // Local project shots are absolutised against metadataBase; the picsum
      // placeholders are already absolute.
      images: [{ url: project.image.src }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} - Tirth Jivani`,
      description,
      images: [project.image.src],
    },
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
