// Every project image is fitted inside one square box so its longest side is
// LIST_IMG_BOX. This is the SAME sizing the intro preloader (IntroOverlay) uses,
// so the overlay hands off to the live list with zero size jump.
export const LIST_IMG_BOX = 240;

export function sizeForAspect(aspect: number): { w: number; h: number } {
  const safe = Math.max(0.5, Math.min(3, aspect));
  return safe >= 1
    ? { w: LIST_IMG_BOX, h: LIST_IMG_BOX / safe }
    : { w: LIST_IMG_BOX * safe, h: LIST_IMG_BOX };
}
