import type { PublicArticleRecord } from './public-articles';

/**
 * 摘要提取：给 llms.txt、结构化数据和 meta description 提供一段干净的纯文本。
 *
 * 优先用 frontmatter 里显式写的 `description` / `summary`（作者最清楚一句话该怎么概括），
 * 没写才退回正文。生成式引擎引用内容时很依赖"一句话说清这篇讲什么"，
 * 所以这里刻意只取正文的**第一段散文**——按整篇截取会把下一节的标题
 * 也拼进摘要里，读起来像被截断的半句话。
 */

const CODE_FENCE = /```[\s\S]*?```/g;
const IMAGE = /!\[[^\]]*\]\([^)]*\)/g;
const LINK = /\[([^\]]*)\]\([^)]*\)/g;
const HTML_TAG = /<[^>]+>/g;
const HEADING_LINE = /^#{1,6}\s+.*$/gm;
const HEADING_PREFIX = /^#{1,6}\s+/gm;
const QUOTE_PREFIX = /^>\s?/gm;
const LIST_MARKER = /^\s*(?:[-*+]|\d+\.)\s+/gm;
const TABLE_ROW = /^\s*\|.*\|\s*$/gm;
const RULE = /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/gm;

/**
 * 强调标记只在"贴着文字"的位置才算强调，而且 `_` 还常出现在标识符里
 * （`NUXT_PUBLIC_SITE_URL`、`snake_case`）。所以这里只剥离成对的
 * `**…**` / `__…__` / `*…*` / `~~…~~`，绝不逐个删除字符。
 */
const EMPHASIS_PAIRS: Array<[RegExp, string]> = [
  [/\*\*([^*]+)\*\*/g, '$1'],
  [/__([^_]+)__/g, '$1'],
  [/~~([^~]+)~~/g, '$1'],
  [/\*([^*\n]+)\*/g, '$1'],
];

/** 行内代码要原样保留内容，但不要让它被后续的强调/标题规则误伤。 */
const INLINE_CODE = /`([^`]*)`/g;

/** 首段短于这个长度就继续往下取，避免摘要短到没有信息量。 */
const MIN_SUMMARY_LENGTH = 40;

/**
 * 把一段 markdown 压成单行纯文本。
 *
 * 行内代码先抽成占位符再还原：否则 `` `**not emphasis**` `` 会被去掉星号，
 * `` `NUXT_PUBLIC_SITE_URL` `` 也可能被当成强调或标题语法处理。
 */
export const toPlainText = (markdown: string): string => {
  const codeSpans: string[] = [];
  let text = markdown
    .replace(CODE_FENCE, ' ')
    .replace(INLINE_CODE, (_match, code: string) => {
      codeSpans.push(code);
      return `\u0000${codeSpans.length - 1}\u0000`;
    });

  text = text
    .replace(IMAGE, ' ')
    .replace(LINK, '$1')
    .replace(HTML_TAG, ' ')
    .replace(HEADING_PREFIX, '')
    .replace(QUOTE_PREFIX, '')
    .replace(LIST_MARKER, '')
    .replace(TABLE_ROW, ' ')
    .replace(RULE, ' ');

  for (const [pattern, replacement] of EMPHASIS_PAIRS) text = text.replace(pattern, replacement);

  // 还原行内代码内容，保持标识符原样。
  text = text.replace(/\u0000(\d+)\u0000/g, (_match, index: string) => codeSpans[Number(index)] ?? '');

  return text.replace(/\s+/g, ' ').trim();
};

/** 判断一个 markdown 块是不是"正文散文"，表格、分隔线、代码都不算。 */
const isProseBlock = (block: string): boolean => {
  const head = block.trimStart();
  if (!head) return false;
  if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(head.trim())) return false;
  if (/^\|/.test(head)) return false;
  if (/^!\[/.test(head)) return false;
  if (/^```/.test(head)) return false;
  return true;
};

/**
 * 按空行切块，取开头若干段散文拼成摘要正文。
 *
 * 块里的标题行要单独剥掉，而不是把整块丢掉：`# 标题\n正文…` 是一个常见
 * 的紧凑写法，整块拒绝会让这类文章拿不到任何摘要。
 */
const leadingProse = (markdown: string): string => {
  const blocks = markdown.replace(CODE_FENCE, ' ').split(/\n{2,}/);
  const picked: string[] = [];
  let length = 0;
  for (const block of blocks) {
    if (!isProseBlock(block)) continue;
    const proseOnly = block.replace(HEADING_LINE, ' ');
    if (!proseOnly.trim()) continue;
    const text = toPlainText(proseOnly);
    if (!text) continue;
    picked.push(text);
    length += text.length;
    // 第一段够长就收手，不再往下一节借内容。
    if (length >= MIN_SUMMARY_LENGTH) break;
  }
  return picked.join(' ');
};

/** 尽量在句子边界截断，避免出现"半个词"的尾巴。 */
const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  const window = text.slice(0, maxLength);
  const boundary = Math.max(
    window.lastIndexOf('。'),
    window.lastIndexOf('！'),
    window.lastIndexOf('？'),
    window.lastIndexOf('. '),
    window.lastIndexOf('；'),
  );
  // 句子边界太靠前（不足六成）就硬截，否则摘要会短得没信息量。
  if (boundary >= maxLength * 0.6) return window.slice(0, boundary + 1).trim();
  return `${window.trim()}…`;
};

/**
 * 取一篇文章的摘要。显式声明优先，其次正文首段。
 * `maxLength` 默认 120 字，够 llms.txt 一行读完，也适合当 meta description。
 */
export const articleSummary = (article: PublicArticleRecord, maxLength = 120): string => {
  const explicit = article.summary?.trim();
  if (explicit) return truncate(toPlainText(explicit), maxLength);
  const body = article.content || article.articleContent || '';
  return truncate(leadingProse(body), maxLength);
};
