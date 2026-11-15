export default defineNuxtConfig({
  // Parallel migration mode: the current Vite app remains the default build.
  srcDir: 'nuxt/',
  components: [
    { path: '~/components', pathPrefix: false },
  ],
  devtools: { enabled: false },
  css: ['~/../src/assets/css/visual-system.css'],
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || process.env.VITE_SITE_URL || '',
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
    '/robots.txt': { prerender: true },
    '/sitemap.xml': { prerender: true },
    '/rss.xml': { prerender: true },
    '/llms.txt': { prerender: true },
    '/api/articles': { cache: { maxAge: 300 } },
    '/api/articles/**': { cache: { maxAge: 300 } },
    '/api/categories/**': { cache: { maxAge: 900 } },
    '/api/tags/**': { cache: { maxAge: 900 } },
    '/api/search': { cache: false },
    '/api/health': { cache: false },
  },
  nitro: {
    prerender: {
      routes: ['/', '/archive', '/categories', '/tags', '/about', '/friend', '/search', '/robots.txt', '/sitemap.xml', '/rss.xml', '/llms.txt'],
    },
  },
});
