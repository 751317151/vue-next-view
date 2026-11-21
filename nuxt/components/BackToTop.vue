<template>
  <Transition name="to-top">
    <button
      v-if="shown"
      type="button"
      class="to-top"
      :class="{ 'is-down': heading === 'down' }"
      :aria-label="heading === 'down' ? '继续向下浏览' : '回到顶部'"
      :style="{ '--progress': progress }"
      @click="onClick"
    >
      <span class="to-top__ring" aria-hidden="true"></span>
      <span class="to-top__orb" aria-hidden="true">
        <!-- Points the way the page is moving: down while descending, up while
             ascending, so the arrow always matches what a click will do. -->
        <b>{{ heading === 'down' ? '↓' : '↑' }}</b>
      </span>
    </button>
  </Transition>
</template>

<script setup lang="ts">
const shown = ref(false);
const progress = ref(0);
/** Direction the page is heading, which the arrow mirrors. */
const heading = ref<'up' | 'down'>('up');
let frame = 0;
let lastY = 0;

const update = () => {
  const doc = document.documentElement;
  const y = window.scrollY;
  const max = doc.scrollHeight - window.innerHeight;
  progress.value = Math.min(1, Math.max(0, max > 0 ? Number((y / max).toFixed(3)) : 0));
  shown.value = y > window.innerHeight * 0.75;

  if (Math.abs(y - lastY) > 4) {
    const next = y > lastY ? 'down' : 'up';
    // At the very bottom "up" is the only useful direction left.
    heading.value = y + window.innerHeight >= doc.scrollHeight - 4 ? 'up' : next;
    lastY = y;
  }
};

const onScroll = () => {
  if (frame) return;
  frame = window.requestAnimationFrame(() => {
    update();
    frame = 0;
  });
};

const scrollTop = () => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
};

const scrollToBottom = () => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: document.documentElement.scrollHeight, behavior: reduce ? 'auto' : 'smooth' });
};

/** The button acts on the direction it currently shows. */
const onClick = () => {
  if (heading.value === 'down') scrollToBottom();
  else scrollTop();
};

onMounted(() => {
  lastY = window.scrollY;
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', onScroll);
  if (frame) window.cancelAnimationFrame(frame);
});
</script>

<style scoped>
.to-top {
  position: fixed;
  /* 右下角的最底层挂件，和团子共用一套停靠 token，避免各自写坐标撞在一起。 */
  right: var(--bs-dock-edge);
  bottom: var(--bs-dock-edge);
  z-index: var(--bs-dock-z);
  display: grid;
  place-items: center;
  width: 3.2rem;
  height: 3.2rem;
  padding: 0;
  border: 1px solid var(--bs-border);
  border-radius: 999px;
  background: rgba(255, 250, 245, .82);
  box-shadow: 0 14px 34px rgba(95, 66, 118, .18);
  cursor: pointer;
  backdrop-filter: blur(14px);
  transition: transform var(--bs-dur-base) var(--bs-ease-pop), box-shadow var(--bs-dur-base) ease;
}
:root.bs-dark .to-top { background: rgba(33, 26, 54, .88); }

.to-top:hover { transform: translateY(-4px) rotate(-6deg); box-shadow: 0 20px 44px rgba(255, 143, 179, .3); }
.to-top:active { transform: translateY(-1px) scale(.94); }

/* Conic ring shows how far down the page you are. */
.to-top__ring {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: conic-gradient(var(--bs-pink) calc(var(--progress) * 360deg), rgba(185, 167, 255, .22) 0);
  mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px));
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px));
  pointer-events: none;
}

.to-top__orb {
  display: grid;
  place-items: center;
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--bs-yellow), var(--bs-pink) 60%, var(--bs-lilac));
  color: var(--bs-ink-on-accent);
  font-size: .95rem;
  box-shadow: inset 0 -2px 6px rgba(57, 45, 79, .14);
}

.to-top:hover .to-top__orb b { animation: to-top-hop var(--bs-dur-slow) ease; }
@keyframes to-top-hop {
  0% { transform: translateY(0); }
  45% { transform: translateY(-4px) scale(1.08); }
  100% { transform: translateY(0); }
}
/* Heading down has to hop the other way, or the motion contradicts the glyph. */
.to-top.is-down:hover .to-top__orb b { animation: to-top-hop-down var(--bs-dur-slow) ease; }
@keyframes to-top-hop-down {
  0% { transform: translateY(0); }
  45% { transform: translateY(4px) scale(1.08); }
  100% { transform: translateY(0); }
}

.to-top-enter-active, .to-top-leave-active { transition: opacity var(--bs-dur-base) ease, transform var(--bs-dur-base) var(--bs-ease-pop); }
.to-top-enter-from, .to-top-leave-to { opacity: 0; transform: translateY(14px) scale(.86); }

@media (prefers-reduced-motion: reduce) {
  .to-top { transition: none; }
  .to-top:hover .to-top__orb b { animation: none; }
  .to-top-enter-active, .to-top-leave-active { transition: none; }
}
</style>
