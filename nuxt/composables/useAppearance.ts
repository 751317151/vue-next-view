/**
 * Theme + appearance preferences.
 *
 * The initial class is applied by an inline script in nuxt.config before the
 * first paint, so a dark-mode visitor never sees a white flash. This composable
 * only reads and updates state afterwards.
 */
export type ThemeMode = 'light' | 'dark' | 'system';
export type MotionPreference = 'full' | 'reduced';

const THEME_KEY = 'blackstar-theme';
const MOTION_KEY = 'blackstar-motion';
const DANMAKU_KEY = 'blackstar-danmaku';

const isBrowser = () => typeof window !== 'undefined';

const readStored = <T extends string>(key: string, fallback: T, allowed: readonly T[]): T => {
  if (!isBrowser()) return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value && (allowed as readonly string[]).includes(value) ? value as T : fallback;
  } catch {
    return fallback;
  }
};

const writeStored = (key: string, value: string) => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private browsing can reject writes; the in-memory state still applies.
  }
};

const systemPrefersDark = () =>
  isBrowser() && window.matchMedia('(prefers-color-scheme: dark)').matches;

const resolveTheme = (mode: ThemeMode): 'light' | 'dark' =>
  mode === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : mode;

const applyTheme = (mode: ThemeMode) => {
  if (!isBrowser()) return;
  const resolved = resolveTheme(mode);
  const root = document.documentElement;
  root.classList.toggle('bs-dark', resolved === 'dark');
  root.dataset.themeMode = mode;
  // Keep the browser chrome (address bar) in sync with the page.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', resolved === 'dark' ? '#241f33' : '#ffb6c8');
};

/** Shared module-level state so every Settings panel instance agrees. */
const themeMode = ref<ThemeMode>('system');
const motionPreference = ref<MotionPreference>('full');
const danmakuEnabled = ref(true);

let initialised = false;

export const useAppearance = () => {
  const setTheme = (mode: ThemeMode) => {
    themeMode.value = mode;
    writeStored(THEME_KEY, mode);
    applyTheme(mode);
  };

  const cycleTheme = () => {
    const order: ThemeMode[] = ['light', 'dark', 'system'];
    setTheme(order[(order.indexOf(themeMode.value) + 1) % order.length]!);
  };

  const setMotion = (value: MotionPreference) => {
    motionPreference.value = value;
    writeStored(MOTION_KEY, value);
    if (isBrowser()) {
      document.documentElement.classList.toggle('bs-reduced-motion', value === 'reduced');
    }
  };

  const setDanmaku = (value: boolean) => {
    danmakuEnabled.value = value;
    writeStored(DANMAKU_KEY, value ? 'on' : 'off');
  };

  const init = () => {
    if (!isBrowser() || initialised) return;
    initialised = true;

    themeMode.value = readStored<ThemeMode>(THEME_KEY, 'system', ['light', 'dark', 'system']);
    motionPreference.value = readStored<MotionPreference>(MOTION_KEY, 'full', ['full', 'reduced']);
    danmakuEnabled.value = readStored(DANMAKU_KEY, 'on', ['on', 'off']) === 'on';

    applyTheme(themeMode.value);
    document.documentElement.classList.toggle('bs-reduced-motion', motionPreference.value === 'reduced');

    // Follow the OS while the visitor keeps the "system" option selected.
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (themeMode.value === 'system') applyTheme('system');
    });
  };

  return {
    themeMode,
    motionPreference,
    danmakuEnabled,
    setTheme,
    cycleTheme,
    setMotion,
    setDanmaku,
    init,
  };
};
