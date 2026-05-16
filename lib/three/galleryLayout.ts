export type GallerySlot = {
  index: number;
  projectIndex: number;
  position: [number, number, number];
  rotationZ: number;
  driftSeed: number;
};

export type GalleryLayout = {
  slots: GallerySlot[];
  spacing: number;
  startX: number;
  endX: number;
  cycleWidth: number;
};

// Tighter spacing because plane sizes shrank ~50%.
export const GALLERY_SPACING = 1.4;

// Target on-screen area of each plane (world units²).
export const PLANE_AREA = 0.95;

// Body scroll length per project — used to size the virtual scroll cycle.
export const SCROLL_PER_PROJECT = 240;

export function buildGalleryLayout(projectCount: number): GalleryLayout {
  const slots: GallerySlot[] = [];
  for (let i = 0; i < projectCount; i++) {
    const x = i * GALLERY_SPACING;
    const y =
      Math.sin(i * 0.83 + 0.4) * 0.45 +
      Math.sin(i * 0.31 + 1.1) * 0.18 -
      (i % 4 === 0 ? 0.1 : 0);
    const z =
      Math.sin(i * 1.07 + 0.7) * 0.7 -
      ((i + 1) % 3) * 0.14 -
      (i % 7 === 0 ? 0.35 : 0);
    const rotationZ = Math.sin(i * 1.21) * 0.05;
    slots.push({
      index: i,
      projectIndex: i,
      position: [x, y, z],
      rotationZ,
      driftSeed: i * 0.937,
    });
  }
  const endX = projectCount > 0 ? (projectCount - 1) * GALLERY_SPACING : 0;
  // cycleWidth = N * spacing so that slot N (next copy) sits at the same gap
  // from slot N-1 as any pair of consecutive slots — seamless wrap.
  const cycleWidth = projectCount * GALLERY_SPACING;
  return { slots, spacing: GALLERY_SPACING, startX: 0, endX, cycleWidth };
}

export function getCyclePx(projectCount: number): number {
  return Math.max(1200, projectCount * SCROLL_PER_PROJECT);
}
