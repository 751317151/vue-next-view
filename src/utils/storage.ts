/**
 * Browser storage adapter.
 * Keeping access behind this module makes the store safe to import during SSR.
 */
const getStorage = (): Storage | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
};

export const storage = {
  get(key: string): string | null {
    try {
      return getStorage()?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      getStorage()?.setItem(key, value);
    } catch {
      // Storage can be unavailable in private browsing or restricted WebViews.
    }
  },
  remove(key: string): void {
    try {
      getStorage()?.removeItem(key);
    } catch {
      // Ignore storage failures; in-memory state remains usable.
    }
  },
};
