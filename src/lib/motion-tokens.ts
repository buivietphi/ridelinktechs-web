export const DURATIONS = {
  fast: 0.18,
  base: 0.32,
  slow: 0.56,
  curtain: 1.1,
} as const;

export const EASINGS = {
  outQuint: 'power4.out',
  inOut: 'power2.inOut',
  snap: 'power3.out',
} as const;

export type Duration = keyof typeof DURATIONS;
export type Easing = keyof typeof EASINGS;
