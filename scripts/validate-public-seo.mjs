import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Validates the crawler-facing artifacts of a real build.
 *
 * Both build paths publish these files to `dist/`: the legacy Vite build copies
 * them from the gitignored `public-seo/` staging directory, and the Nuxt build
 * prerenders them there through Nitro. Checking `dist` therefore covers both,
 * and — unlike checking the staging directory — it can only pass when the
 * artifact a crawler actually receives is correct.
 */
const root = process.cwd();
const dir = path.resolve(process.env.SEO_DIR || path.join(root, 'dist'));

const read = async (file) => {
  try {
    return await fs.readFile(path.join(dir, file), 'utf8');
  } catch {
    throw new Error(`${path.relative(root, dir) || '.'}/${file} is missing. Build first: "npm run build:cf" (Nuxt SSR) or "SITE_URL=https://… npm run build:with-seo" (Vite).`);
  }
};

const sources = {};
try {
  [sources.robots, sources.sitemap, sources.rss, sources.llms] = await Promise.all([
    read('robots.txt'),
    read('sitemap.xml'),
    read('rss.xml'),
    read('llms.txt'),
  ]);
} catch (error) {
  console.error('Public SEO validation failed:');
  console.error(`- ${error.message}`);
  process.exit(1);
}

const { robots, sitemap, rss, llms } = sources;
const errors = [];

if (!/^Sitemap:\s*https:\/\//mi.test(robots)) {
  errors.push('robots.txt must contain an absolute HTTPS Sitemap URL');
}
if (!/User-agent:\s*OAI-SearchBot/im.test(robots)) {
  errors.push('robots.txt should explicitly allow OAI-SearchBot');
}

const sitemapLocs = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((match) => match[1]);
if (!sitemapLocs.length) {
  errors.push('sitemap.xml contains no <loc> entries');
}
if (/Generated during deployment/i.test(sitemap)) {
  errors.push('sitemap.xml is still a placeholder');
}
if (sitemapLocs.some((loc) => !loc.startsWith('https://'))) {
  errors.push('every sitemap.xml <loc> must be an absolute HTTPS URL');
}

const rssLinks = [...rss.matchAll(/<link>([^<]*)<\/link>/g)].map((match) => match[1]);
if (!rssLinks.some((link) => link.startsWith('https://'))) {
  errors.push('rss.xml must contain an absolute HTTPS <link>');
}
if (/Generated during deployment/i.test(rss)) {
  errors.push('rss.xml is still a placeholder');
}

if (!/^#\s+/m.test(llms) || !/https:\/\//i.test(llms)) {
  errors.push('llms.txt must contain a heading and absolute HTTPS links');
}

// A build that silently baked the local origin would otherwise ship canonical
// URLs and crawler files pointing at a machine nobody else can reach.
const localOrigin = /https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?/i;
for (const [file, content] of [['robots.txt', robots], ['sitemap.xml', sitemap], ['rss.xml', rss], ['llms.txt', llms]]) {
  if (localOrigin.test(content)) {
    errors.push(`${file} contains a local origin; set NUXT_PUBLIC_SITE_URL to the public HTTPS origin and rebuild`);
  }
}

// Non-ASCII characters are legal XML but invalid in a URL. CJK taxonomy slugs
// must be percent-encoded, so flag them rather than letting crawlers guess.
const rawNonAsciiUrl = (urls) => urls.filter((url) => /[^\x20-\x7E]/.test(url));
const unencoded = rawNonAsciiUrl(sitemapLocs).concat(rawNonAsciiUrl(rssLinks));
if (unencoded.length) {
  errors.push(`URLs must be percent-encoded, found: ${unencoded.slice(0, 3).join(', ')}`);
}

if (errors.length) {
  console.error('Public SEO validation failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Public SEO artifacts in ${path.relative(root, dir) || '.'} look deployable (${sitemapLocs.length} sitemap URLs).`);
}
