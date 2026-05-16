import type { Project } from "./projects";

// Photos live at /public/photos/img{1..N}.png. Update PHOTO_COUNT to match the
// number of files on disk; PHOTO_PATHS is the canonical list used everywhere
// (the /photos page, grid empty-cell fills, and the Surf gallery).
const PHOTO_COUNT = 12;

export const PHOTO_PATHS: string[] = Array.from(
  { length: PHOTO_COUNT },
  (_, i) => `/photos/img${i + 1}.png`
);

export function getPhotoItems(paths: string[] = PHOTO_PATHS): Project[] {
  return paths.map((src, i) => ({
    id: `photo-${i + 1}`,
    title: "",
    caseStudy: false,
    image: {
      id: `photo-${i + 1}`,
      src,
      client: "",
      role: "Photo",
      category: "Photography",
      year: "",
    },
  }));
}
