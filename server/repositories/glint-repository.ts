import { renderMarkdown } from '../utils/markdown';
import { toPlainText } from '../utils/article-summary';
import type { PublicGlintRecord } from '../utils/glint-records';
import { toSlug } from '../../src/utils/slug';

interface GlintFrontmatter {
  title?: string;
  summary?: string;
  date?: string;
  emoji?: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_PUBLIC_ID = 2_000_000_000;

const parseFrontmatter = (raw: string): { meta: GlintFrontmatter; body: string } => {
  const normalized = raw.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) return { meta: {}, body: normalized.trim() };
  const end = normalized.indexOf('\n---\n', 4);
  if (end < 0) return { meta: {}, body: normalized.trim() };
  const head = normalized.slice(4, end);
  const body = normalized.slice(end + 5).trim();

  const meta: GlintFrontmatter = {};
  for (const line of head.split('\n')) {
    const match = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (!match) continue;
    const key = match[1]!;
    const value = match[2]!.trim().replace(/^["']|["']$/g, '');
    if (key === 'title' || key === 'summary' || key === 'date' || key === 'emoji') {
      meta[key] = value;
    }
  }
  return { meta, body };
};

const fail: (fileName: string, message: string) => never = (fileName, message) => {
  throw new Error(`[content] content/glints/${fileName}: ${message}`);
};

const isValidDate = (value: string) => {
  if (!ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

/** Short, stable id: a glint's public number must not move when another one is added. */
const hashId = (value: string) => {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % MAX_PUBLIC_ID + 1;
};

const loadGlints = async (): Promise<PublicGlintRecord[]> => {
  const storage = useStorage('assets:glints');
  const keys = (await storage.getKeys()).filter((key) => key.endsWith('.md')).sort();
  const today = new Date().toISOString().slice(0, 10);
  const usedSlugs = new Map<string, string>();

  const records: PublicGlintRecord[] = [];
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
    if (!body) fail(fileName, '正文不能为空');

    const slug = toSlug(meta.title || fileName.replace(/\.md$/, ''), 'glint');
    const previous = usedSlugs.get(slug);
    if (previous) fail(fileName, `slug "${slug}" 与 ${previous} 重复`);
    usedSlugs.set(slug, fileName);

    records.push({
      id: hashId(slug),
      slug,
      title,
      body,
      summary: meta.summary?.trim() || '',
      text: toPlainText(body),
      html: renderMarkdown(body),
      date,
      emoji: meta.emoji?.trim() || '✦',
    });
  }

  return records
    .filter((record) => record.date <= today)
    .sort((left, right) => right.date.localeCompare(left.date) || left.slug.localeCompare(right.slug));
};

let cached: Promise<PublicGlintRecord[]> | null = null;

export const listGlints = () => {
  cached = cached || loadGlints();
  return cached;
};

export const findGlintBySlug = async (slug: string) => {
  const glints = await listGlints();
  return glints.find((glint) => glint.slug === slug);
};
