import type { PublicArticleRecord } from './public-articles';
import { renderMarkdown } from './markdown';
import { toSlug } from '../../src/utils/slug';

interface Frontmatter {
  title?: string;
  category?: string;
  tags?: string[];
  date?: string;
  updatedAt?: string;
  slug?: string;
  id?: string;
  draft?: string;
  /** 一句话摘要。`summary` 优先于 `description`，用于 SEO/GEO 与 llms.txt。 */
  summary?: string;
  description?: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_PUBLIC_ID = 2_000_000_000;

/**
 * File-based content layer: articles live in `content/articles/*.md` with
 * YAML-lite frontmatter and are bundled into the build through Nitro
 * serverAssets, so dev and production read the same source of truth.
 */
const parseFrontmatter = (raw: string): { meta: Frontmatter; body: string } => {
  const normalized = raw.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) return { meta: {}, body: normalized.trim() };
  const end = normalized.indexOf('\n---\n', 4);
  if (end < 0) return { meta: {}, body: normalized.trim() };
  const head = normalized.slice(4, end);
  const body = normalized.slice(end + 5).trim();

  const meta: Frontmatter = {};
  for (const line of head.split('\n')) {
    const match = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (!match) continue;
    const key = match[1]!;
    const value = match[2]!.trim().replace(/^["']|["']$/g, '');
    if (key === 'tags') {
      meta.tags = value.replace(/^\[|\]$/g, '').split(',').map((tag) => tag.trim()).filter(Boolean);
    } else if (key === 'title' || key === 'category' || key === 'date' || key === 'updatedAt' || key === 'slug' || key === 'id' || key === 'draft') {
      meta[key] = value;
    } else if (key === 'description' || key === 'summary') {
      // 两个键都接受，但 `summary` 的优先级更高，所以先各存一份。
      if (key === 'summary') meta.summary = value;
      else meta.description = value;
    }
  }
  return { meta, body };
};

// Explicit type annotation (not just an inferred `never` return) lets TypeScript
// treat calls as terminating, so the checks below narrow `title`/`date` for the
// rest of the loop body.
const fail: (fileName: string, message: string) => never = (fileName, message) => {
  throw new Error(`[content] content/articles/${fileName}: ${message}`);
};

const isValidDate = (value: string) => {
  if (!ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

/** 稳定、与文章数量无关的兜底 id，保证未写 `id` 的文章旧链接不会漂移。 */
const hashId = (value: string) => {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % MAX_PUBLIC_ID + 1;
};

interface DraftArticle {
  fileName: string;
  slug: string;
  id?: number;
  meta: Frontmatter & { title: string; date: string };
  body: string;
}

const loadArticles = async (): Promise<PublicArticleRecord[]> => {
  const storage = useStorage('assets:articles');
  const keys = (await storage.getKeys()).filter((key) => key.endsWith('.md')).sort();
  const entries: DraftArticle[] = [];
  const usedSlugs = new Map<string, string>();
  const usedIds = new Map<number, string>();
  const today = new Date().toISOString().slice(0, 10);

  for (const key of keys) {
    const raw = await storage.getItem(key);
    if (typeof raw !== 'string') continue;
    const fileName = key.split('/').pop() || key;
    const { meta, body } = parseFrontmatter(raw);

    const title = meta.title?.trim();
    if (!title) fail(fileName, 'frontmatter 缺少 title');
    const date = meta.date;
    if (!date) fail(fileName, 'frontmatter 缺少 date（格式 YYYY-MM-DD）');
    if (!isValidDate(date)) fail(fileName, `date "${date}" 不是有效的 YYYY-MM-DD 日期`);
    if (meta.updatedAt && !isValidDate(meta.updatedAt)) {
      fail(fileName, `updatedAt "${meta.updatedAt}" 不是有效的 YYYY-MM-DD 日期`);
    }
    if (meta.updatedAt && meta.updatedAt < date) {
      fail(fileName, 'updatedAt 不能早于 date');
    }

    const slug = toSlug(meta.slug || fileName.replace(/\.md$/, ''), 'article');
    if (meta.slug && meta.slug !== slug) {
      fail(fileName, `slug "${meta.slug}" 不是规范形式，请改成 "${slug}"`);
    }
    const previousSlug = usedSlugs.get(slug);
    if (previousSlug) fail(fileName, `slug "${slug}" 与 ${previousSlug} 重复`);
    usedSlugs.set(slug, fileName);

    let id: number | undefined;
    if (meta.id) {
      const parsed = Number(meta.id);
      if (!Number.isInteger(parsed) || parsed <= 0 || parsed > MAX_PUBLIC_ID) {
        fail(fileName, `id "${meta.id}" 必须是 1 到 ${MAX_PUBLIC_ID} 之间的整数`);
      }
      const previousId = usedIds.get(parsed);
      if (previousId) fail(fileName, `id ${parsed} 与 ${previousId} 重复`);
      usedIds.set(parsed, fileName);
      id = parsed;
    }

    entries.push({ fileName, slug, id, meta: { ...meta, title, date }, body });
  }

  const published = entries.filter((entry) => entry.meta.draft !== 'true' && entry.meta.date <= today);

  const articles = published.map((entry) => {
    let id = entry.id;
    if (!id) {
      id = hashId(entry.slug);
      while (usedIds.has(id)) id = id >= MAX_PUBLIC_ID ? 1 : id + 1;
      usedIds.set(id, entry.fileName);
    }

    return {
      id,
      slug: entry.slug,
      articleTitle: entry.meta.title,
      articleContent: entry.body,
      articleCover: '',
      createTime: entry.meta.date,
      updateTime: entry.meta.updatedAt || entry.meta.date,
      category: entry.meta.category || '随笔',
      tags: entry.meta.tags || [],
      summary: entry.meta.summary || entry.meta.description || '',
    } satisfies PublicArticleRecord;
  });

  return articles
    .sort((left, right) => right.createTime.localeCompare(left.createTime) || left.slug.localeCompare(right.slug))
    .map((article) => ({
      ...article,
      content: article.articleContent,
      contentHtml: renderMarkdown(article.articleContent),
    }));
};

let cached: Promise<PublicArticleRecord[]> | null = null;

const getArticles = () => {
  cached = cached || loadArticles();
  return cached;
};

export const listContentArticles = () => getArticles();

export const findContentArticle = async (value: string) => {
  const articles = await getArticles();
  return articles.find((article) => article.slug === value || String(article.id) === value);
};
