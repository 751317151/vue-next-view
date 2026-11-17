import { fileURLToPath } from 'node:url';

const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || process.env.VITE_SITE_URL || process.env.SITE_URL || '';
const hasSiteUrl = Boolean(siteUrl);

// Crawler files are served by Nitro at request time by default. When a public
// site URL exists they can be prerendered safely; without one, prerendering
// would bake http://localhost into the sitemap and robots.txt.
const crawlerRoutes = ['/robots.txt', '/sitemap.xml', '/rss.xml', '/llms.txt'];
const crawlerRouteRules = Object.fromEntries(
  crawlerRoutes.map((route) => [route, hasSiteUrl ? { prerender: true } : { cache: false }])
);

export default defineNuxtConfig({
  // Parallel migration mode: the Vite app is deployed separately while Nuxt
  // progressively takes over the public blog.
  srcDir: 'nuxt/',
  // Legacy shared components and stores still import from the Vite root (`src/`).
  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url)),
  },
  components: [
    { path: '~/components', pathPrefix: false },
  ],
  devtools: { enabled: false },
  css: ['~/../src/assets/css/visual-system.css'],
  runtimeConfig: {
    public: {
      siteUrl,
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
    },
  },
  routeRules: {
    '/': { prerender: true },
    '/archive': { prerender: true },
    '/categories/**': { swr: 3600 },
    '/tags/**': { swr: 3600 },
    '/article/**': { swr: 3600 },
    '/admin/**': { ssr: false },
    // The search page reads ?q= and must never be baked as a static shell.
    '/search': { prerender: false },
    ...crawlerRouteRules,
    '/api/articles': { cache: { maxAge: 300 } },
    '/api/articles/**': { cache: { maxAge: 300 } },
    '/api/categories/**': { cache: { maxAge: 900 } },
    '/api/tags/**': { cache: { maxAge: 900 } },
    '/api/search': { cache: false },
    '/api/health': { cache: false },
  },
  nitro: {
    prerender: {
      routes: [
        '/',
        '/archive',
        '/categories',
        '/tags',
        '/about',
        '/friend',
        ...(hasSiteUrl ? crawlerRoutes : []),
      ],
    },
  },
});
