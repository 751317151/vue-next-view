import { nextTick, onBeforeUnmount, watch, type Ref } from 'vue';

/**
 * Keyboard/focus management for modal surfaces (drawer, settings sheet).
 *
 * Three things are easy to get wrong when each overlay rolls its own:
 *  - `document.body.style.overflow = 'hidden'` is not reference counted, so
 *    closing one overlay can unlock scrolling while another is still open;
 *  - Tab escapes into the page behind the overlay;
 *  - closing drops focus on <body>, stranding keyboard users at the top.
 *
 * The lock below is module-level and counted, and focus returns to whatever
 * was focused before opening (usually the trigger button).
 */

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  'summary',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

let scrollLockCount = 0;
let savedBodyOverflow = '';

const lockBodyScroll = () => {
  if (typeof document === 'undefined') return;
  if (scrollLockCount === 0) {
    savedBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  scrollLockCount += 1;
};

const unlockBodyScroll = () => {
  if (typeof document === 'undefined') return;
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.style.overflow = savedBodyOverflow;
    savedBodyOverflow = '';
  }
};

const isVisible = (element: HTMLElement) =>
  element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden';

export interface FocusTrapOptions {
  /** Called for Escape; the trap does not close anything by itself. */
  onEscape?: () => void;
  /** Element to focus after opening. Defaults to the first focusable child. */
  initialFocus?: () => HTMLElement | null | undefined;
  /** Element to focus after closing. Defaults to the previously focused one. */
  returnFocus?: () => HTMLElement | null | undefined;
  /** Set false when closing because the user navigated away: the new page
   *  should own focus rather than the old trigger button. */
  shouldReturnFocus?: () => boolean;
}

export const useFocusTrap = (
  active: Ref<boolean>,
  panel: Ref<HTMLElement | null>,
  options: FocusTrapOptions = {},
) => {
  let previouslyFocused: HTMLElement | null = null;
  let locked = false;

  /** Only the last modal in DOM order may handle keys, so stacked overlays
   *  do not both close on one Escape press. */
  const isTopmost = () => {
    if (typeof document === 'undefined') return false;
    if (!panel.value) return true;
    const dialogs = Array.from(document.querySelectorAll<HTMLElement>('[aria-modal="true"]'));
    return dialogs.at(-1) === panel.value;
  };

  const focusable = () => {
    const root = panel.value;
    if (!root) return [];
    return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isVisible);
  };

  const focusInitial = () => {
    const preferred = options.initialFocus?.();
    const target = preferred ?? focusable()[0] ?? panel.value;
    target?.focus({ preventScroll: true });
  };

  const onKeydown = (event: KeyboardEvent) => {
    if (!active.value || !isTopmost()) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      options.onEscape?.();
      return;
    }

    if (event.key !== 'Tab') return;

    const items = focusable();
    if (!items.length) {
      event.preventDefault();
      panel.value?.focus({ preventScroll: true });
      return;
    }

    const first = items[0]!;
    const last = items.at(-1)!;
    const current = document.activeElement as HTMLElement | null;
    const inside = Boolean(current && panel.value?.contains(current));

    if (!inside) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
      return;
    }
    if (event.shiftKey && current === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && current === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const release = () => {
    if (typeof document === 'undefined') return;
    document.removeEventListener('keydown', onKeydown, true);
    if (locked) {
      unlockBodyScroll();
      locked = false;
    }
  };

  watch(active, async (open) => {
    if (typeof document === 'undefined') return;

    if (open) {
      previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      lockBodyScroll();
      locked = true;
      document.addEventListener('keydown', onKeydown, true);
      await nextTick();
      if (active.value) focusInitial();
      return;
    }

    release();
    await nextTick();

    // Another modal may have opened in the same tick (drawer → settings).
    // In that case it owns focus now and we must not yank it back out.
    // Same for a panel that opened later in the same tick and has not painted
    // its aria-modal wrapper yet: check the caller's explicit open flag too.
    const activeModal = document.querySelector<HTMLElement>('[aria-modal="true"]');
    if (activeModal || options.shouldReturnFocus?.() === false) {
      previouslyFocused = null;
      return;
    }

    // The element that opened us may have been removed meanwhile (for example
    // the drawer's own "主题与设置" button). Only reuse it while still mounted.
    const target = previouslyFocused?.isConnected
      ? previouslyFocused
      : options.returnFocus?.();
    target?.focus({ preventScroll: true });
    previouslyFocused = null;
  }, { immediate: true });

  onBeforeUnmount(() => {
    release();
  });
};
