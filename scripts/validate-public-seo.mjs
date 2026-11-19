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

const isHttpsUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname) && !/\s/.test(value);
  } catch {
    return false;
  }
};

/** Parse robots.txt into per-agent rule groups so we judge the rules that apply. */
const parseRobotsGroups = (text) => {
  const groups = [];
  let current = null;
  for (const rawLine of text.split('\n')) {
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) continue;
    const match = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!match) continue;
    const field = match[1].toLowerCase();
    const value = match[2].trim();
    if (field === 'user-agent') {
      // A User-agent line right after rules starts a new group.
      if (!current || current.rules.length) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
    } else if (field === 'allow' || field === 'disallow') {
      if (!current) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.rules.push({ type: field, path: value });
    }
  }
  return groups;
};

/** Rules for one bot: its own group wins, otherwise the wildcard group applies. */
const rulesForBot = (groups, bot) => {
  const name = bot.toLowerCase();
  const specific = groups.filter((group) => group.agents.some((agent) => agent === name));
  if (specific.length) return specific.flatMap((group) => group.rules);
  const wildcard = groups.filter((group) => group.agents.some((agent) => agent === '*'));
  return wildcard.flatMap((group) => group.rules);
};

/** A bot may fetch "/" only when no rule blocks it; longer paths win over shorter. */
const allowsRoot = (rules) => {
  let decision = true;
  let bestLength = -1;
  for (const rule of rules) {
    if (rule.path === '') continue;
    const matches = '/'.startsWith(rule.path) || rule.path === '/';
    if (!matches) continue;
    if (rule.path.length > bestLength) {
      bestLength = rule.path.length;
      decision = rule.type === 'allow';
    }
  }
  return decision;
};

const sitemapDirectives = [...robots.matchAll(/^Sitemap:\s*(\S+)\s*$/gim)].map((match) => match[1]);
if (!sitemapDirectives.length) {
  errors.push('robots.txt must contain a Sitemap directive');
} else if (sitemapDirectives.some((url) => !isHttpsUrl(url))) {
  errors.push('robots.txt Sitemap directives must be absolute HTTPS URLs');
}

const robotsGroups = parseRobotsGroups(robots);
for (const bot of ['OAI-SearchBot', 'GPTBot']) {
  if (!robotsGroups.some((group) => group.agents.some((agent) => agent === bot.toLowerCase()))) {
    errors.push(`robots.txt should state an explicit rule for ${bot}`);
    continue;
  }
  if (!allowsRoot(rulesForBot(robotsGroups, bot))) {
    errors.push(`robots.txt must not block ${bot} from crawling the site`);
  }
}

const sitemapLocs = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((match) => match[1]);
if (!sitemapLocs.length) {
  errors.push('sitemap.xml contains no <loc> entries');
}
if (/Generated during deployment/i.test(sitemap)) {
  errors.push('sitemap.xml is still a placeholder');
}
const badSitemapUrls = sitemapLocs.filter((loc) => !isHttpsUrl(loc));
if (badSitemapUrls.length) {
  errors.push(`every sitemap.xml <loc> must be an absolute HTTPS URL, found: ${badSitemapUrls.slice(0, 3).join(', ')}`);
}

// Check every link, not just whether one of them happens to be HTTPS.
const rssLinks = [...rss.matchAll(/<link>([^<]*)<\/link>/g)].map((match) => match[1]);
if (!rssLinks.length) {
  errors.push('rss.xml contains no <link> entries');
}
const badRssUrls = rssLinks.filter((link) => !isHttpsUrl(link));
if (badRssUrls.length) {
  errors.push(`every rss.xml <link> must be an absolute HTTPS URL, found: ${badRssUrls.slice(0, 3).join(', ')}`);
}
if (/Generated during deployment/i.test(rss)) {
  errors.push('rss.xml is still a placeholder');
}

if (!/^#\s+/m.test(llms)) {
  errors.push('llms.txt must contain a Markdown heading');
}
const llmsLinks = [...llms.matchAll(/\]\(([^)\s]+)\)/g)].map((match) => match[1]);
if (!llmsLinks.length) {
  errors.push('llms.txt contains no Markdown links');
}
const badLlmsUrls = llmsLinks.filter((link) => !isHttpsUrl(link));
if (badLlmsUrls.length) {
  errors.push(`every llms.txt link must be an absolute HTTPS URL, found: ${badLlmsUrls.slice(0, 3).join(', ')}`);
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
