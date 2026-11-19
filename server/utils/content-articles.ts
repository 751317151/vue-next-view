import type { PublicArticleRecord } from './public-articles';
import { renderMarkdown } from './markdown';

interface Frontmatter {
  title?: string;
  category?: string;
  tags?: string[];
  date?: string;
  updatedAt?: string;
  slug?: string;
  /** 一句话摘要。`summary` 优先于 `description`，用于 SEO/GEO 与 llms.txt。 */
  summary?: string;
  description?: string;
}

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
    } else if (key === 'title' || key === 'category' || key === 'date' || key === 'updatedAt' || key === 'slug') {
      meta[key] = value;
    } else if (key === 'description' || key === 'summary') {
      // 两个键都接受，但 `summary` 的优先级更高，所以先各存一份。
      if (key === 'summary') meta.summary = value;
      else meta.description = value;
    }
  }
  return { meta, body };
};

const loadArticles = async (): Promise<PublicArticleRecord[]> => {
  const storage = useStorage('assets:articles');
  const keys = (await storage.getKeys()).filter((key) => key.endsWith('.md')).sort();
  const articles: PublicArticleRecord[] = [];

  for (const key of keys) {
    const raw = await storage.getItem(key);
    if (typeof raw !== 'string') continue;
    const { meta, body } = parseFrontmatter(raw);
    const fileName = key.split('/').pop() || key;
    const slug = meta.slug || fileName.replace(/\.md$/, '');
    const date = meta.date || new Date().toISOString().slice(0, 10);
    articles.push({
      id: 0,
      slug,
      articleTitle: meta.title || slug,
      articleContent: body,
      articleCover: '',
      createTime: date,
      updateTime: meta.updatedAt || date,
      category: meta.category || '随笔',
      tags: meta.tags || [],
      summary: meta.summary || meta.description || '',
    });
  }

  return articles
    .sort((a, b) => (b.createTime || '').localeCompare(a.createTime || ''))
    .map((article, index) => ({
      ...article,
      id: index + 1,
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
