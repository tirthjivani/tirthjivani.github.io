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
//
// Returns "" for machine-generated names (upload timestamps, "slot-3-empty"
// and friends). Reading out "archive 1780044319555 2" is worse than no alt at
// all, so the caller substitutes a neutral positional label instead.
export function altFromPath(src: string): string {
  const base = src.split("/").pop() ?? "";
  const noExt = base.replace(/\.[a-z0-9]+$/i, "");
  const words = noExt.replace(/[-_]+/g, " ").trim();
  if (!words) return "";
  // Any run of 4+ digits, or a bare "archive"/"slot"/"screen" prefix, means
  // the filename carries no description.
  if (/\d{4,}/.test(words)) return "";
  if (/^(archive|slot|screen|img|image|untitled|dsc|photo)\b/i.test(words)) {
    return "";
  }
  return words;
}
