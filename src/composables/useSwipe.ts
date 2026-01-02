import { ref, onMounted, onBeforeUnmount } from 'vue';

interface SwipeOptions {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export function useSwipe(options: SwipeOptions = {}) {
  const { threshold = 50, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown } = options;

  const startX = ref(0);
  const startY = ref(0);
  const isSwiping = ref(false);

  const handleTouchStart = (e: TouchEvent) => {
    startX.value = e.touches[0].clientX;
    startY.value = e.touches[0].clientY;
    isSwiping.value = true;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!isSwiping.value) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = endX - startX.value;
    const diffY = endY - startY.value;

    // 判断是水平滑动还是垂直滑动
    if (Math.abs(diffX) > Math.abs(diffY)) {
      // 水平滑动
      if (Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }
    } else {
      // 垂直滑动
      if (Math.abs(diffY) > threshold) {
        if (diffY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }

    isSwiping.value = false;
  };

  const bindSwipe = (el: HTMLElement | null) => {
    if (!el) return;
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
  };

  const unbindSwipe = (el: HTMLElement | null) => {
    if (!el) return;
    el.removeEventListener('touchstart', handleTouchStart);
    el.removeEventListener('touchend', handleTouchEnd);
  };

  return {
    isSwiping,
    bindSwipe,
    unbindSwipe,
  };
}
