/**
 * 阅读排版偏好：正文大小与行距。
 *
 * 和主题一样只写在 localStorage，不参与 SSR 输出，避免服务端与客户端
 * 首屏不一致。偏好挂在 <html> 的 data 属性上，文章页用 CSS 变量读取，
 * 因此切换时正文会平滑重排，不需要重新渲染 Markdown。
 */
export type ReadingFontSize = 'sm' | 'md' | 'lg';
export type ReadingLeading = 'snug' | 'cozy' | 'loose';

const SIZE_KEY = 'blackstar-read-size';
const LEADING_KEY = 'blackstar-read-leading';
const isBrowser = () => typeof window !== 'undefined';

const FONT_SIZES: readonly ReadingFontSize[] = ['sm', 'md', 'lg'];
const LEADINGS: readonly ReadingLeading[] = ['snug', 'cozy', 'loose'];

const read = <T extends string>(key: string, fallback: T, allowed: readonly T[]): T => {
  if (!isBrowser()) return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value && (allowed as readonly string[]).includes(value) ? value as T : fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: string) => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // 隐私模式下仍然保留内存状态。
  }
};

const fontSize = ref<ReadingFontSize>('md');
const leading = ref<ReadingLeading>('cozy');
let initialised = false;

const apply = () => {
  if (!isBrowser()) return;
  const root = document.documentElement;
  root.dataset.readSize = fontSize.value;
  root.dataset.readLeading = leading.value;
};

export const useReadingPrefs = () => {
  const setFontSize = (value: ReadingFontSize) => {
    fontSize.value = value;
    write(SIZE_KEY, value);
    apply();
  };

  const setLeading = (value: ReadingLeading) => {
    leading.value = value;
    write(LEADING_KEY, value);
    apply();
  };

  const init = () => {
    if (!isBrowser() || initialised) return;
    initialised = true;
    fontSize.value = read<ReadingFontSize>(SIZE_KEY, 'md', FONT_SIZES);
    leading.value = read<ReadingLeading>(LEADING_KEY, 'cozy', LEADINGS);
    apply();
  };

  return { fontSize, leading, setFontSize, setLeading, init };
};
