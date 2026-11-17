export interface ArticleLike {
  id: number;
  articleContent?: string;
  category?: string;
}

const PALETTES = [
  { from: '#ffb6c8', to: '#ffe48a', emoji: '🌸', glow: 'rgba(255, 143, 179, 0.5)' },
  { from: '#b9a7ff', to: '#9ee6d0', emoji: '🌙', glow: 'rgba(185, 167, 255, 0.5)' },
  { from: '#9ee6d0', to: '#ffd9a0', emoji: '🍵', glow: 'rgba(158, 230, 208, 0.5)' },
  { from: '#ffbd8a', to: '#ffb6c8', emoji: '🔥', glow: 'rgba(255, 189, 138, 0.5)' },
  { from: '#ffe48a', to: '#b9a7ff', emoji: '⭐', glow: 'rgba(255, 228, 138, 0.55)' },
  { from: '#ffb6c8', to: '#b9a7ff', emoji: '🫧', glow: 'rgba(255, 143, 179, 0.45)' },
];

const CATEGORY_EMOJI: Record<string, string> = {
  前端: '🧁',
  技术: '🧁',
  生活: '🍵',
  灵感: '✨',
  随笔: '🌙',
};

/** Deterministic pastel cover art so every card feels hand-placed, not random. */
export function articleArt(article: ArticleLike) {
  const palette = PALETTES[article.id % PALETTES.length]!;
  return {
    ...palette,
    emoji: CATEGORY_EMOJI[article.category || ''] || palette.emoji,
    style: {
      background: `radial-gradient(circle at 78% 18%, rgba(255,255,255,.55), transparent 42%), linear-gradient(135deg, ${palette.from}, ${palette.to})`,
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
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

export function excerptOf(text?: string, length = 72) {
  const plain = (text || '').replace(/[#>*`~\-!]+/g, '').replace(/\s+/g, ' ').trim();
  return plain.length > length ? `${plain.slice(0, length)}…` : plain;
}
