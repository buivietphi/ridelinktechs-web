import type { MetadataRoute } from 'next';

const SITE = 'https://ridelinktechs.com';

/**
 * AI crawlers are allowed on purpose: answer engines can only cite the
 * company if they can read it. The `*` rule already covered them, listing
 * them explicitly documents the intent and keeps working if `*` is narrowed.
 */
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'meta-externalagent',
  'Bytespider',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: '/' })),
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
