<template>
  <div v-if="ready" class="reading-progress" aria-hidden="true">
    <span class="reading-progress__fill" :style="{ transform: `scaleX(${progress})` }"></span>
    <b
      v-if="progress > 0.02"
      class="reading-progress__star"
      :style="{ left: `${Math.round(progress * 100)}%` }"
    >✦</b>
  </div>
</template>

<script setup lang="ts">
const ready = ref(false);
const progress = ref(0);
let frame = 0;

const update = () => {
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  progress.value = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
};

const onScroll = () => {
  if (frame) return;
  frame = window.requestAnimationFrame(() => {
    update();
    frame = 0;
  });
};

onMounted(() => {
  ready.value = true;
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
.reading-progress {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 60;
  height: 4px;
  pointer-events: none;
}

.reading-progress__fill {
  display: block;
  height: 100%;
  border-radius: 0 999px 999px 0;
  background: linear-gradient(90deg, var(--bs-pink), var(--bs-peach), var(--bs-lilac), var(--bs-mint));
  box-shadow: 0 2px 14px rgba(255, 143, 179, 0.5);
  transform-origin: 0 50%;
  transition: transform 80ms linear;
}

.reading-progress__star {
  position: absolute;
  top: 50%;
  font-size: 0.95rem;
  line-height: 1;
  color: var(--bs-pink);
  filter: drop-shadow(0 0 7px rgba(255, 143, 179, 0.85));
  transform: translate(-50%, -58%);
  animation: reading-star-wiggle 1.8s ease-in-out infinite;
}

@keyframes reading-star-wiggle {
  0%, 100% { transform: translate(-50%, -58%) rotate(-10deg) scale(1); }
  50% { transform: translate(-50%, -58%) rotate(16deg) scale(1.18); }
}

@media (prefers-reduced-motion: reduce) {
  .reading-progress__star { animation: none; }
  .reading-progress__fill { transition: none; }
}
</style>
