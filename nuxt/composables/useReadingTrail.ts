/**
 * 阅读足迹：记住读过哪些文章、读到什么程度。
 *
 * 和星愿瓶不同，这里是"自动发生"的记录：读者不需要点收藏，只要读过，
 * 下次回来就能在罗盘里看到「接着读」。只存 slug、标题、分类、进度和时间，
 * 不存正文，也不会在 SSR 阶段触碰 localStorage。
 */
export interface ReadingTrailItem {
  slug: string;
  title: string;
  category?: string;
  emoji: string;
  /** 0–1 的阅读进度；1 表示读到了结尾。 */
  progress: number;
  /** 最近一次阅读的时间戳。 */
  at: number;
  /** 上次读到的小节 id；文章页用它把读者送回原处。 */
  headingId?: string;
  /** 小节标题，用于"上次读到「…」"这类不需要再查 DOM 的文案。 */
  headingText?: string;
}

const KEY = 'blackstar-reading-trail';
const MAX_ITEMS = 24;
const isBrowser = () => typeof window !== 'undefined';

const readAll = (): ReadingTrailItem[] => {
  if (!isBrowser()) return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is ReadingTrailItem => Boolean(item)
      && typeof (item as ReadingTrailItem).slug === 'string'
      && typeof (item as ReadingTrailItem).title === 'string'
      && typeof (item as ReadingTrailItem).progress === 'number'
      && typeof (item as ReadingTrailItem).at === 'number'
      // 旧版本没有小节字段，缺失或类型不对都只是少一个定位点，不该整条丢弃。
      && ((item as ReadingTrailItem).headingId === undefined || typeof (item as ReadingTrailItem).headingId === 'string')
      && ((item as ReadingTrailItem).headingText === undefined || typeof (item as ReadingTrailItem).headingText === 'string'));
  } catch {
    return [];
  }
};

const writeAll = (items: ReadingTrailItem[]) => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // 隐私模式拒绝写入时静默跳过。
  }
};

export const useReadingTrail = () => {
  const items = useState<ReadingTrailItem[]>('reading-trail', () => []);
  const ready = useState<boolean>('reading-trail-ready', () => false);

  const hydrate = () => {
    if (ready.value || !isBrowser()) return;
    items.value = readAll();
    ready.value = true;
  };

  /** 同一篇只保留一条：进度取较大值，时间取最近一次。 */
  const track = (entry: Omit<ReadingTrailItem, 'at'>) => {
    if (!isBrowser()) return;
    const progress = Math.min(1, Math.max(0, entry.progress));
    const existing = readAll().find((item) => item.slug === entry.slug);
    // 进度只增不减；只有读得更远时才更新"停在哪一节"，往回翻不会把书签拖回去。
    const heading = existing && existing.progress > progress
      ? { headingId: existing.headingId, headingText: existing.headingText }
      : { headingId: entry.headingId, headingText: entry.headingText };
    const next: ReadingTrailItem = {
      ...entry,
      ...heading,
      progress: Math.max(existing?.progress || 0, progress),
      at: Date.now(),
    };
    const merged = [next, ...readAll().filter((item) => item.slug !== entry.slug)].slice(0, MAX_ITEMS);
    items.value = merged;
    writeAll(merged);
  };

  const remove = (slug: string) => {
    const next = readAll().filter((item) => item.slug !== slug);
    items.value = next;
    writeAll(next);
  };

  const clear = () => {
    items.value = [];
    writeAll([]);
  };

  /** 读取单篇足迹；不依赖组件是否已经 hydrate，供文章页判断"上次读到哪"。 */
  const find = (slug: string) => readAll().find((item) => item.slug === slug);

  return { items, ready, hydrate, track, remove, clear, find };
};
