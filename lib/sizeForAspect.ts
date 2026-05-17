// Target on-screen area per image (px²) — calibrated so each card lands
// visually the same size regardless of its aspect ratio. Max bounds keep
// extreme aspects in check.
export const LIST_IMG_TARGET_AREA = 280 * 280;
export const LIST_IMG_MAX_WIDTH = 380;
export const LIST_IMG_MAX_HEIGHT = 320;

export function sizeForAspect(aspect: number): { w: number; h: number } {
  const safe = Math.max(0.5, Math.min(3, aspect));
  let h = Math.sqrt(LIST_IMG_TARGET_AREA / safe);
  let w = safe * h;
  if (w > LIST_IMG_MAX_WIDTH) {
    w = LIST_IMG_MAX_WIDTH;
    h = w / safe;
  }
  if (h > LIST_IMG_MAX_HEIGHT) {
    h = LIST_IMG_MAX_HEIGHT;
    w = h * safe;
  }
  return { w, h };
}
