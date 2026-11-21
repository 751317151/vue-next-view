export interface ArticleLike {
  id: number;
  slug?: string;
  articleContent?: string;
  category?: string;
}

const PALETTES = [
  { from: '#ffb6c8', to: '#ffe48a', emoji: '🌸' },
  { from: '#b9a7ff', to: '#9ee6d0', emoji: '🌙' },
  { from: '#9ee6d0', to: '#ffd9a0', emoji: '🍵' },
  { from: '#ffbd8a', to: '#ffb6c8', emoji: '🔥' },
  { from: '#ffe48a', to: '#b9a7ff', emoji: '⭐' },
  { from: '#ffb6c8', to: '#b9a7ff', emoji: '🫧' },
];

const CATEGORY_EMOJI: Record<string, string> = {
  前端: '🧁',
  技术: '🧁',
  生活: '🍵',
  灵感: '✨',
  随笔: '🌙',
};

const paletteFor = (seed: string) => {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return PALETTES[hash % PALETTES.length]!;
};

/** Deterministic pastel cover art: the same article always looks the same. */
export function articleArt(article: ArticleLike) {
  const palette = paletteFor(article.slug || String(article.id));
  return {
    ...palette,
    emoji: CATEGORY_EMOJI[article.category || ''] || palette.emoji,
    style: {
      // Colour stops are tokens so cover art dims with the star-sky theme.
      background: `radial-gradient(circle at 78% 18%, rgba(255,255,255,.55), transparent 42%), linear-gradient(135deg, ${palette.from}, ${palette.to})`,
      filter: 'var(--bs-art-filter, none)',
    },
  };
}

/** CJK-aware reading estimate: roughly 400 characters per minute. */
export function readingMinutes(text?: string) {
  const length = (text || '').replace(/\s+/g, '').length;
  return Math.max(1, Math.round(length / 400));
}

export function formatDate(value?: string) {
  if (!value) return '—';
  // Date-only strings are calendar dates, not instants: `new Date('2024-05-20')`
  // is parsed as UTC midnight, which renders as May 19 for visitors west of
  // Greenwich and also makes the server/client HTML disagree during hydration.
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    return `${Number(dateOnly[1])} 年 ${Number(dateOnly[2])} 月 ${Number(dateOnly[3])} 日`;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

export function excerptOf(text?: string, length = 72) {
  const plain = (text || '').replace(/[#>*`~\-!]+/g, '').replace(/\s+/g, ' ').trim();
  return plain.length > length ? `${plain.slice(0, length)}…` : plain;
}
