import archivesData from "./archives.json";

export type ArchiveItem = {
  src: string;
  alt?: string;
};

export type ArchivesFile = { items: ArchiveItem[] };

const file = archivesData as ArchivesFile;

export const archives: ArchiveItem[] = file.items;

// Derive an alt-text fallback from the file path's basename. Strips the
// extension and turns dashes/underscores into spaces, so
// "/archives/golden-hour-shoot.webp" → "golden hour shoot".
export function altFromPath(src: string): string {
  const base = src.split("/").pop() ?? "";
  const noExt = base.replace(/\.[a-z0-9]+$/i, "");
  return noExt.replace(/[-_]+/g, " ").trim();
}
