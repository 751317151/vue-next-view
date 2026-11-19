/**
 * 星愿瓶：读者把喜欢的文章收进一个悬浮的小瓶子，之后可以回来再读。
 *
 * 只存最少的信息（slug、标题、emoji、分类、收藏时间），足够在面板里
 * 画出一颗星即可，文章正文仍由 /api 提供，避免本地缓存和站点内容脱节。
 * SSR 期间不碰 localStorage，挂载后再水合，防止服务端渲染报错。
 */
export interface StarItem {
  slug: string;
  title: string;
  emoji: string;
  category?: string;
  /** 收藏时间戳，用于按最近收藏排序。 */
  savedAt: number;
}

const STORAGE_KEY = 'blackstar-star-jar';
const MAX_STARS = 60;

const isBrowser = () => typeof window !== 'undefined';

/** 从 localStorage 读回收藏，过滤掉结构不完整的脏数据。 */
const readStored = (): StarItem[] => {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is StarItem =>
        Boolean(item) && typeof (item as StarItem).slug === 'string' && typeof (item as StarItem).title === 'string',
      )
      .slice(0, MAX_STARS);
  } catch {
    return [];
  }
};

const writeStored = (items: StarItem[]) => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // 隐私模式可能拒绝写入；内存里的状态依旧可用。
  }
};

export const useStarJar = () => {
  // 模块级共享状态，让卡片上的按钮和瓶子面板看到同一份数据。
  const stars = useState<StarItem[]>('star-jar', () => []);
  const ready = useState<boolean>('star-jar-ready', () => false);

  const hydrate = () => {
    if (ready.value || !isBrowser()) return;
    stars.value = readStored();
    ready.value = true;
  };

  const has = (slug: string) => stars.value.some((star) => star.slug === slug);

  const collect = (item: Omit<StarItem, 'savedAt'>) => {
    if (has(item.slug)) return;
    const next = [{ ...item, savedAt: Date.now() }, ...stars.value].slice(0, MAX_STARS);
    stars.value = next;
    writeStored(next);
  };

  const remove = (slug: string) => {
    const next = stars.value.filter((star) => star.slug !== slug);
    stars.value = next;
    writeStored(next);
  };

  const toggle = (item: Omit<StarItem, 'savedAt'>) => {
    if (has(item.slug)) {
      remove(item.slug);
      return false;
    }
    collect(item);
    return true;
  };

  const clear = () => {
    stars.value = [];
    writeStored([]);
  };

  return { stars, ready, hydrate, has, collect, remove, toggle, clear };
};

/**
 * 收藏时让一颗小星星从点击处飞进瓶子。
 * 用 window 事件解耦：按钮只负责"从哪飞"，瓶子只负责"飞到哪"。
 * 传坐标而不是事件对象，键盘触发时可以用按钮中点当起点。
 */
export const flyStarToJar = (origin: { x: number; y: number }, emoji: string) => {
  if (!isBrowser()) return;
  window.dispatchEvent(
    new CustomEvent('star-jar:fly', {
      detail: { x: origin.x, y: origin.y, emoji },
    }),
  );
};
