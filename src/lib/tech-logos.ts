const ALIAS: Record<string, string> = {
  'next.js': 'nextdotjs',
  'node.js': 'nodedotjs',
  postgres: 'postgresql',
  'github actions': 'githubactions',
  'tailwind css': 'tailwindcss',
  'react native': 'reactnative',
  swift: 'swift',
  swiftui: 'swift',
  'spring boot': 'spring',
  'kotlin multiplatform': 'kotlin',
};

export function techLogoSlug(name: string): string {
  const key = name.trim().toLowerCase();
  return ALIAS[key] ?? key.replace(/[^a-z0-9]/g, '');
}
