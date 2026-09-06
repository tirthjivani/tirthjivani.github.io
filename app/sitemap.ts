import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";
import { SITE_URL } from "@/lib/siteUrl";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.8 },
    { url: `${SITE_URL}/archives`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    // Only projects with a case study have a page of their own; the rest link
    // straight out to their live site.
    ...projects
      .filter((p) => p.caseStudy)
      .map((p) => ({
        url: `${SITE_URL}/project/${p.id}`,
        lastModified: now,
        changeFrequency: "yearly" as const,
        priority: 0.7,
      })),
  ];
}
