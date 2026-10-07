/**
 * Real pixel dimensions of every product image under public/.
 *
 * Under `fill`, next/image pins the img to inset:0 and discards width/height,
 * so the surrounding frame's aspect-ratio is the only thing that decides the
 * crop. Every image here arrives as a path string, never a StaticImageData,
 * which leaves this table as the one place the real numbers can live.
 */
const SIZES: Record<string, [number, number]> = {
  '/products/ridelink-go.jpg': [1400, 1050],
  '/products/glosslink-beautiful.jpg': [647, 1400],
  '/products/pawly.jpg': [647, 1400],
  '/products/vibeholic.jpg': [1800, 1125],
  '/products/screens/glosslink-01-home.jpg': [554, 1200],
  '/products/screens/glosslink-02-search.jpg': [554, 1200],
  '/products/screens/glosslink-03-appointment.jpg': [554, 1200],
  '/products/screens/glosslink-04-booking.jpg': [554, 1200],
  '/products/screens/pawly-01-home.jpg': [554, 1200],
  '/products/screens/vibeholic-01-home.jpg': [1400, 875],
  '/products/screens/vibeholic-02.jpg': [1200, 758],
  '/products/screens/vibeholic-03.jpg': [1200, 758],
};

const FALLBACK_RATIO = 16 / 9;

/** width / height of the asset at `src`. Unknown paths fall back to 16:9. */
export function imageRatio(src: string): number {
  const size = SIZES[src];
  return size ? size[0] / size[1] : FALLBACK_RATIO;
}

/** True when the asset is taller than it is wide — the phone-screenshot case. */
export function isPortrait(src: string): boolean {
  return imageRatio(src) < 1;
}
