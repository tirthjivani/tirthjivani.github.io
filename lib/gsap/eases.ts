// Cubic-bezier easing that mirrors Framer Motion's named curves exactly.
// Framer's named eases map to standard CSS cubic-bezier values:
//   easeIn    = cubic-bezier(0.42, 0, 1,    1)
//   easeOut   = cubic-bezier(0,    0, 0.58, 1)
//   easeInOut = cubic-bezier(0.42, 0, 0.58, 1)

function cubicBezier(p1x: number, p1y: number, p2x: number, p2y: number) {
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  const solveX = (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const fx = sampleX(t) - x;
      const dx = sampleDX(t);
      if (Math.abs(dx) < 1e-6) break;
      t -= fx / dx;
    }
    return Math.min(1, Math.max(0, t));
  };

  return (p: number) => sampleY(solveX(p));
}

export const EASE_OUT = cubicBezier(0, 0, 0.58, 1);
export const EASE_IN_OUT = cubicBezier(0.42, 0, 0.58, 1);
export const EASE_IN = cubicBezier(0.42, 0, 1, 1);
