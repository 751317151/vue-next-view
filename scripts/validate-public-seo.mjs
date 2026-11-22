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
  [sources.robots, sources.sitemap, sources.rss, sources.llms, sources.llmsFull] = await Promise.all([
    read('robots.txt'),
    read('sitemap.xml'),
    read('rss.xml'),
    read('llms.txt'),
    read('llms-full.txt'),
  ]);
} catch (error) {
  console.error('Public SEO validation failed:');
  console.error(`- ${error.message}`);
  process.exit(1);
}

const { robots, sitemap, rss, llms, llmsFull } = sources;
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
const glintDetailRoutes = sitemapLocs
  .map((loc) => new URL(loc).pathname)
  .filter((pathname) => pathname.startsWith('/glints/') && pathname !== '/glints/');
if (!glintDetailRoutes.length) {
  errors.push('sitemap.xml should include at least one permanent /glints/<slug> page');
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
const rssGlintLinks = rssLinks.filter((link) => new URL(link).pathname.startsWith('/glints/'));
if (!rssGlintLinks.length) {
  errors.push('rss.xml should link glints to their permanent /glints/<slug> pages');
}
const rssHashGlintLinks = rssGlintLinks.filter((link) => new URL(link).hash || /%23/i.test(link));
if (rssHashGlintLinks.length) {
  errors.push(`rss.xml glint links must use path slugs without hashes, found: ${rssHashGlintLinks.slice(0, 3).join(', ')}`);
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

// llms-full.txt 是喂给生成式引擎的整站语料，一旦坏掉，模型引用到的就是
// 残缺内容。它此前完全没有被校验，所以单独检查：标题、站点绝对地址、
// 以及每篇文章是否真的带上了正文（而不仅仅是标题）。
if (!/^#\s+/m.test(llmsFull)) {
  errors.push('llms-full.txt must contain a Markdown heading');
}
if (llmsFull.trim().length < 800) {
  errors.push(`llms-full.txt looks truncated (${llmsFull.trim().length} chars); it should carry the full article bodies`);
}

const allCorpus = { 'llms.txt': llms, 'llms-full.txt': llmsFull };
for (const [file, content] of Object.entries(allCorpus)) {
  if (/\{\{[^}]*\}\}/.test(content)) {
    errors.push(`${file} contains an unresolved template placeholder`);
  }
}

// A build that silently baked the local origin would otherwise ship canonical
// URLs and crawler files pointing at a machine nobody else can reach.
const localOrigin = /https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?/i;
for (const [file, content] of [['robots.txt', robots], ['sitemap.xml', sitemap], ['rss.xml', rss], ...Object.entries(allCorpus)]) {
  if (localOrigin.test(content)) {
    errors.push(`${file} contains a local origin; set NUXT_PUBLIC_SITE_URL to the public HTTPS origin and rebuild`);
  }
}

// Non-ASCII characters are legal XML but invalid in a URL. CJK taxonomy slugs
// must be percent-encoded, so flag them rather than letting crawlers guess.
const rawNonAsciiUrl = (urls) => urls.filter((url) => /[^\x20-\x7E]/.test(url));
const llmsAllLinks = [...llms.matchAll(/\]\(([^)\s]+)\)/g)].map((match) => match[1])
  .concat([...llmsFull.matchAll(/\]\(([^)\s]+)\)/g)].map((match) => match[1]));
const unencoded = rawNonAsciiUrl(sitemapLocs).concat(rawNonAsciiUrl(rssLinks), rawNonAsciiUrl(llmsAllLinks));
if (unencoded.length) {
  errors.push(`URLs must be percent-encoded, found: ${unencoded.slice(0, 3).join(', ')}`);
}

// 文章页是 GEO 的主入口：抽查构建产物里的一篇文章，确认文章级 Open Graph
// 真的落在了 HTML 里，而不是只在浏览器水合后才存在（爬虫看不到后者）。
const articleDir = path.join(dir, 'article');
let articleFiles = [];
try {
  articleFiles = (await fs.readdir(articleDir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(articleDir, entry.name, 'index.html'));
} catch {
  articleFiles = [];
}
// SWR 路由可能不预渲染文章页；那种情况下无法从静态产物取证，跳过而不是误报。
if (articleFiles.length) {
  const sample = articleFiles[0];
  const html = await fs.readFile(sample, 'utf8');
  const requiredArticleMeta = ['article:published_time', 'article:section', 'og:image:alt'];
  const missing = requiredArticleMeta.filter((property) => !new RegExp(`property="${property}"`).test(html));
  if (missing.length) {
    errors.push(`${path.relative(dir, sample)} is missing article Open Graph metadata: ${missing.join(', ')}`);
  }
  // 同名 meta 重复会让分享卡片的标题/描述互相覆盖。
  for (const property of ['og:title', 'og:image', 'article:published_time']) {
    const count = [...html.matchAll(new RegExp(`property="${property}"`, 'g'))].length;
    if (count > 1) errors.push(`${path.relative(dir, sample)} repeats ${property} ${count} times`);
  }
}

// SWR 路由可能不预渲染微光详情；如果构建产物里存在详情页，则必须能直接从
// HTML 识别为一条独立的 SocialMediaPosting。预渲染页不存在时仍有运行时
// 详情路由，不能把“没生成静态文件”误判成“页面缺少结构化数据”。
const glintDir = path.join(dir, 'glints');
let glintFiles = [];
try {
  const entries = await fs.readdir(glintDir, { withFileTypes: true });
  glintFiles = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(glintDir, entry.name, 'index.html'));
} catch {
  glintFiles = [];
}
if (glintFiles.length) {
  const sample = glintFiles[0];
  const html = await fs.readFile(sample, 'utf8');
  if (!/"@type"\s*:\s*"SocialMediaPosting"/.test(html)) {
    errors.push(`${path.relative(dir, sample)} is missing SocialMediaPosting structured data`);
  }
}

if (errors.length) {
  console.error('Public SEO validation failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Public SEO artifacts in ${path.relative(root, dir) || '.'} look deployable (${sitemapLocs.length} sitemap URLs).`);
}
