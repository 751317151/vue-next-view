/**
 * 摘抄本：读者在文章里划下一句话，就把它夹进一本随身的小册子。
 *
 * 和星愿瓶（整篇收藏）、阅读足迹（自动记录）都不同，这里存的是"句子"：
 * 一句话 + 它来自哪篇、哪一节。正文不重复存，回原处时用 slug + headingId
 * 定位，文章改了也不会留下过期副本。
 */
export interface ExcerptItem {
  /** 本地生成的唯一 id，同一句话可以夹多次（读者可能想分开放）。 */
  id: string;
  slug: string;
  /** 文章标题，面板里显示出处。 */
  title: string;
  /** 摘下来的原句。 */
  text: string;
  /** 所在小节 id，用于"回到原处"。 */
  headingId?: string;
  /** 小节标题，给读者一个位置提示。 */
  headingText?: string;
  /** 摘抄时间戳。 */
  at: number;
}

const KEY = 'blackstar-excerpts';
const MAX_ITEMS = 80;
const MAX_TEXT = 400;

const isBrowser = () => typeof window !== 'undefined';

const readAll = (): ExcerptItem[] => {
  if (!isBrowser()) return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is ExcerptItem => Boolean(item)
        && typeof (item as ExcerptItem).id === 'string'
        && typeof (item as ExcerptItem).slug === 'string'
        && typeof (item as ExcerptItem).title === 'string'
        && typeof (item as ExcerptItem).text === 'string'
        && typeof (item as ExcerptItem).at === 'number')
      .slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
};

const writeAll = (items: ExcerptItem[]) => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // 隐私模式拒绝写入时，内存里的状态仍然可用。
  }
};

const makeId = () => `x-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export const useExcerpts = () => {
  const items = useState<ExcerptItem[]>('excerpts', () => []);
  const ready = useState<boolean>('excerpts-ready', () => false);

  const hydrate = () => {
    if (ready.value || !isBrowser()) return;
    items.value = readAll();
    ready.value = true;
  };

  /** 存入一句摘抄；超长文本截断，避免把整段正文塞进 localStorage。 */
  const add = (entry: Omit<ExcerptItem, 'id' | 'at'>) => {
    if (!isBrowser()) return null;
    const text = entry.text.replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT);
    if (text.length < 4) return null;
    const next: ExcerptItem = { ...entry, text, id: makeId(), at: Date.now() };
    const merged = [next, ...readAll()].slice(0, MAX_ITEMS);
    items.value = merged;
    writeAll(merged);
    return next;
  };

  const remove = (id: string) => {
    const next = readAll().filter((item) => item.id !== id);
    items.value = next;
    writeAll(next);
  };

  const clear = () => {
    items.value = [];
    writeAll([]);
  };

  /** 某篇文章留下的摘抄；文章页用它渲染"你在本文夹下的句子"。 */
  const forSlug = (slug: string) => items.value.filter((item) => item.slug === slug);

  return { items, ready, hydrate, add, remove, clear, forSlug };
};

/** 夹好一句时让左下角的本子轻轻一跳，和星愿瓶的投喂反馈同一套语言。 */
export const pingExcerptShelf = () => {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent('excerpt-shelf:bump'));
};
