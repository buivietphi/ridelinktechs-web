import { prefersReducedMotion } from '@/lib/animations';

const inset = (track: HTMLElement) => parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;

const itemsOf = (track: HTMLElement, selector: string) =>
  Array.from(track.querySelectorAll<HTMLElement>(selector));

export function railGoTo(track: HTMLElement | null, selector: string, index: number): void {
  if (!track) return;
  const items = itemsOf(track, selector);
  const item = items[Math.max(0, Math.min(items.length - 1, index))];
  if (!item) return;
  track.scrollTo({
    left: item.offsetLeft - inset(track),
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
  });
}

export function railStep(track: HTMLElement | null, selector: string, dir: 1 | -1): void {
  if (!track) return;
  const edge = track.scrollLeft + inset(track) + 8;
  const current = itemsOf(track, selector).reduce(
    (found, item, i) => (item.offsetLeft <= edge ? i : found),
    0,
  );
  railGoTo(track, selector, current + dir);
}
