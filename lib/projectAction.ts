import type { Project } from "@/data/projects";

export type ProjectAction = {
  text: string;
  href: string;
  external: boolean;
};

export function getProjectAction(project: Project): ProjectAction | null {
  if (project.caseStudy) {
    return {
      text: "View Case Study",
      href: `/project/${project.id}`,
      external: false,
    };
  }
  if (project.liveLink) {
    return {
      text: "View Live",
      href: project.liveLink,
      external: true,
    };
  }
  return null;
}
