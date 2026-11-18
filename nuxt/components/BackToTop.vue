<template>
  <Transition name="to-top">
    <button
      v-if="shown"
      type="button"
      class="to-top"
      aria-label="回到顶部"
      :style="{ '--progress': progress }"
      @click="scrollTop"
    >
      <span class="to-top__ring" aria-hidden="true"></span>
      <span class="to-top__orb" aria-hidden="true">
        <b>↑</b>
      </span>
    </button>
  </Transition>
</template>

<script setup lang="ts">
const shown = ref(false);
const progress = ref(0);
let frame = 0;

const update = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? window.scrollY / max : 0;
  progress.value = Math.min(1, Math.max(0, Number(ratio.toFixed(3))));
  shown.value = window.scrollY > window.innerHeight * 0.75;
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

onMounted(() => {
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
  right: clamp(1rem, 3vw, 2.2rem);
  bottom: clamp(1.2rem, 3vw, 2.4rem);
  z-index: 40;
  display: grid;
  place-items: center;
  width: 3.2rem;
  height: 3.2rem;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, .8);
  border-radius: 999px;
  background: rgba(255, 250, 245, .82);
  box-shadow: 0 14px 34px rgba(95, 66, 118, .18);
  cursor: pointer;
  backdrop-filter: blur(14px);
  transition: transform 220ms cubic-bezier(.2, .9, .3, 1.2), box-shadow 220ms ease;
}

.to-top:hover { transform: translateY(-4px) rotate(-6deg); box-shadow: 0 20px 44px rgba(255, 143, 179, .3); }
.to-top:active { transform: translateY(-1px) scale(.94); }

/* Conic ring shows how far down the page you are. */
.to-top__ring {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: conic-gradient(#ff8fb3 calc(var(--progress) * 360deg), rgba(185, 167, 255, .22) 0);
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
  background: linear-gradient(135deg, #ffe48a, #ffb6c8 60%, #b9a7ff);
  color: #392d4f;
  font-size: .95rem;
  box-shadow: inset 0 -2px 6px rgba(57, 45, 79, .14);
}

.to-top:hover .to-top__orb b { animation: to-top-hop 620ms ease; }
@keyframes to-top-hop {
  0% { transform: translateY(0); }
  45% { transform: translateY(-4px) scale(1.08); }
  100% { transform: translateY(0); }
}

.to-top-enter-active, .to-top-leave-active { transition: opacity 260ms ease, transform 260ms cubic-bezier(.2, .9, .3, 1.25); }
.to-top-enter-from, .to-top-leave-to { opacity: 0; transform: translateY(14px) scale(.86); }

@media (prefers-reduced-motion: reduce) {
  .to-top { transition: none; }
  .to-top:hover .to-top__orb b { animation: none; }
  .to-top-enter-active, .to-top-leave-active { transition: none; }
}
</style>
