const ASPECT = 1.6;
const STRIDE_FACTOR = 0.2;
const N_SLOTS = 60;
const WAVES_PER_CYCLE = 4;
const AMPLITUDE_FACTOR = 0.18;

export type SurfSlot = {
  index: number;
  projectIndex: number;
  width: number;
  height: number;
  yOffset: number;
  xWithinCycle: number;
};

export type SurfLayout = {
  slots: SurfSlot[];
  cycleWidth: number;
  height: number;
  stride: number;
  amplitude: number;
};

export function buildSurfLayout(opts: {
  projectCount: number;
  viewportHeight: number;
}): SurfLayout {
  const { projectCount, viewportHeight } = opts;
  const height = Math.min(viewportHeight * 0.36, 380);
  const width = height * ASPECT;
  const stride = width * STRIDE_FACTOR;
  const cycleWidth = N_SLOTS * stride;
  const amplitude = height * AMPLITUDE_FACTOR;
  const slots: SurfSlot[] = [];
  for (let i = 0; i < N_SLOTS; i++) {
    const x = i * stride;
    const phase = (x / cycleWidth) * Math.PI * 2 * WAVES_PER_CYCLE;
    const yOffset = -amplitude * Math.sin(phase);
    slots.push({
      index: i,
      projectIndex: projectCount > 0 ? i % projectCount : 0,
      width,
      height,
      yOffset,
      xWithinCycle: x,
    });
  }
  return { slots, cycleWidth, height, stride, amplitude };
}
