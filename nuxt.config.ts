import { fileURLToPath } from 'node:url';

const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || process.env.VITE_SITE_URL || process.env.SITE_URL || '';
const hasSiteUrl = Boolean(siteUrl);

// A production build without a public origin silently bakes `http://localhost`
// into every prerendered canonical and og:url. Crawlers would then be told the
// canonical address is localhost, which is worse than a build that refuses to
// run — so fail loudly, unless the caller explicitly accepts a local origin.
//
// The command has to be read from argv: `nuxt prepare` also runs with
// NODE_ENV=production, so keying off NODE_ENV would block type checking and
// every tool that prepares .nuxt before doing real work.
const nuxtCommand = process.argv[2];
const isBuildCommand = nuxtCommand === 'build' || nuxtCommand === 'generate';

if (isBuildCommand && !hasSiteUrl && process.env.NUXT_ALLOW_LOCAL_ORIGIN !== '1') {
  throw new Error(
    [
      'NUXT_PUBLIC_SITE_URL is required for a production build.',
      '',
      'Set it to the public HTTPS origin, e.g. NUXT_PUBLIC_SITE_URL=https://blog.example.com,',
      'so canonical, og:url, sitemap.xml and rss.xml never point at localhost.',
      'On Cloudflare Pages, add it under Settings → Environment variables.',
      'For a throwaway local build, set NUXT_ALLOW_LOCAL_ORIGIN=1.',
    ].join('\n'),
  );
}

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
  // Nuxt 的 tsconfig 会带上仓库根的 *.d.ts，而其中 components.d.ts /
  // auto-imports.d.ts 属于 Vite 应用，会把 src/ 下同名的 ReadingProgress、
  // ThemeToggle 也声明进来，与 Nuxt 自动导入的组件打架。这里在生成类型时
  // 把它们排除，让 Nuxt 只认自己 components/ 下的版本。
  hooks: {
    'prepare:types': ({ tsConfig }) => {
      const excluded = ['../components.d.ts', '../auto-imports.d.ts'];
      tsConfig.exclude = Array.from(new Set([...(tsConfig.exclude ?? []), ...excluded]));
    },
  },
  devtools: { enabled: false },
  css: ['~/../src/assets/css/visual-system.css'],
  app: {
    // Unified, mochi-soft route transitions defined in visual-system.css.
    pageTransition: { name: 'page-mochi', mode: 'out-in' },
    head: {
      // Runs before first paint so a dark-mode visitor never sees a white
      // flash. Kept inline and tiny on purpose: it must not be a request, and
      // it must tolerate localStorage being unavailable.
      script: [
        {
          key: 'bs-theme-boot',
          tagPosition: 'head',
          innerHTML: `(function(){try{var m=localStorage.getItem('blackstar-theme')||'system';var d=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;if(d)r.classList.add('bs-dark');r.dataset.themeMode=m;if(localStorage.getItem('blackstar-motion')==='reduced')r.classList.add('bs-reduced-motion');}catch(e){}})();`,
        },
      ],
    },
  },
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
    // 留言是用户生成内容，任何一层缓存都会让新留言迟迟不出现。
    '/api/messages': { cache: false },
    '/api/messages/**': { cache: false },
  },
  nitro: {
    serverAssets: [{ baseName: 'articles', dir: 'content/articles' }],
    prerender: {
      routes: [
        '/',
        '/archive',
        '/categories',
        '/tags',
        '/about',
        '/friend',
        '/message',
        ...(hasSiteUrl ? crawlerRoutes : []),
      ],
    },
  },
});
