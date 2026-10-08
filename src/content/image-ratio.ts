const SIZES: Record<string, [number, number]> = {
  '/products/glosslink-beautiful.jpg': [647, 1400],
  '/products/pawly.jpg': [647, 1400],
  '/products/vibeholic.jpg': [1800, 1125],
  '/products/screens/ridelink-go-01-home.jpg': [554, 1200],
  '/products/screens/ridelink-go-02-search.jpg': [554, 1200],
  '/products/screens/ridelink-go-03-booking.jpg': [554, 1200],
  '/products/screens/ridelink-go-04-account.jpg': [554, 1200],
  '/products/screens/ridelink-go-05-activity.jpg': [554, 1200],
  '/products/screens/ridelink-go-06-trips.jpg': [554, 1200],
  '/products/screens/ridelink-go-07-driver.jpg': [554, 1200],
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

export function imageRatio(src: string): number {
  const size = SIZES[src];
  return size ? size[0] / size[1] : FALLBACK_RATIO;
}

export function isPortrait(src: string): boolean {
  return imageRatio(src) < 1;
}
