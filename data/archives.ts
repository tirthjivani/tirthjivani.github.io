import archivesData from "./archives.json";

export type ArchiveItem = {
  src: string;
  alt?: string;
};

export type ArchivesFile = { items: ArchiveItem[] };

const file = archivesData as ArchivesFile;

export const archives: ArchiveItem[] = file.items;
