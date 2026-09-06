import seedsData from "./projects.seeds.json";

export type ImageEntry = {
  id: string;
  src: string;
  client: string;
  role: string;
  category: string;
  year: string;
  // Intrinsic size of the media this project renders in the list (the video
  // when there is one, otherwise the image). Baked into the seeds so the list
  // and the intro can lay themselves out without first downloading anything —
  // see lib/useImageAspects.ts.
  width?: number;
  height?: number;
};

export type CaseStudyImage = {
  src: string;
  alt?: string;
  // 12-column grid. Defaults: colStart auto-flow, colSpan 12, rowSpan 1.
  colStart?: number;
  colSpan?: number;
  rowSpan?: number;
  // width/height ratio used to size the cell (e.g. 16/9 = 1.78). Default 16/9.
  aspect?: number;
  video?: boolean;
  // optional caption rendered below the image
  caption?: string;
};

export type CaseStudySection =
  | { kind: "body"; text: string }
  | { kind: "intro"; label: string; heading: string }
  | { kind: "images"; items: CaseStudyImage[]; gap?: number };

export type CaseStudyLink = { title: string; href?: string };

export type Project = {
  id: string;
  title: string;
  category?: string;
  liveLink?: string;
  caseStudy: boolean;
  impact?: string;
  video?: string;
  introduction?: string;
  seoDescription?: string;
  timeline?: string;
  caseStudies?: CaseStudyLink[];
  sections?: CaseStudySection[];
  image: ImageEntry;
};

export type ProjectSeed = {
  slug: string;
  title: string;
  client: string;
  role: string;
  year: string;
  caseStudy: boolean;
  category?: string;
  liveLink?: string;
  impact?: string;
  src?: string;
  video?: string;
  introduction?: string;
  seoDescription?: string;
  timeline?: string;
  caseStudies?: CaseStudyLink[];
  sections?: CaseStudySection[];
  /** Intrinsic size of the rendered media (video if present, else image). */
  width?: number;
  height?: number;
};

export type ProjectSeedsFile = {
  hidden: string[];
  projects: ProjectSeed[];
};

const seeds = seedsData as ProjectSeedsFile;

export const make = (seed: ProjectSeed): Project => ({
  id: seed.slug,
  title: seed.title,
  category: seed.category,
  liveLink: seed.liveLink,
  caseStudy: seed.caseStudy,
  impact: seed.impact,
  video: seed.video,
  introduction: seed.introduction,
  seoDescription: seed.seoDescription,
  timeline: seed.timeline,
  caseStudies: seed.caseStudies,
  sections: seed.sections,
  image: {
    id: seed.slug,
    src: seed.src ?? `https://picsum.photos/seed/${seed.slug}/1920/1080`,
    client: seed.client,
    role: seed.role,
    category: seed.category ?? "-",
    year: seed.year,
    width: seed.width,
    height: seed.height,
  },
});

function latestYear(yearStr: string): number {
  const matches = yearStr.match(/\d{4}/g);
  if (!matches) return -Infinity;
  return Math.max(...matches.map(Number));
}

const HIDDEN = new Set<string>(seeds.hidden);
const allProjects: Project[] = seeds.projects.map(make);

export const projects: Project[] = allProjects
  .filter((p) => !HIDDEN.has(p.id))
  .sort((a, b) => latestYear(b.image.year) - latestYear(a.image.year));

export const allProjectSeeds: ProjectSeed[] = seeds.projects;
export const hiddenSlugs: string[] = seeds.hidden;
