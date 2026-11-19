<template>
  <div
    v-if="enabled"
    class="pointer-glow"
    :style="{ '--pointer-x': `${position.x}px`, '--pointer-y': `${position.y}px` }"
    aria-hidden="true"
  >
    <span class="pointer-glow__core"></span>
    <span class="pointer-glow__ring"></span>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';

const enabled = ref(false);
const position = reactive({ x: -100, y: -100 });
let frame = 0;
let pendingX = -100;
let pendingY = -100;

const handlePointerMove = (event: PointerEvent) => {
  pendingX = event.clientX;
  pendingY = event.clientY;
  if (frame) return;
  frame = window.requestAnimationFrame(() => {
    position.x = pendingX;
    position.y = pendingY;
    frame = 0;
  });
};

onMounted(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  enabled.value = !reduceMotion && !coarsePointer;
  if (enabled.value) window.addEventListener('pointermove', handlePointerMove, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', handlePointerMove);
  if (frame) window.cancelAnimationFrame(frame);
});
</script>

<style scoped>
.pointer-glow {
  position: fixed;
  inset: 0;
  /* Above page content but below the settings sheet (90) and drawer (95).
     The old 9998 forced every later overlay to out-bid it, and a full-viewport
     layer at that depth also trips automation tooling into reporting an
     occlusion that does not actually block clicks. */
  z-index: 60;
  pointer-events: none;
}

.pointer-glow__core,
.pointer-glow__ring {
  position: absolute;
  top: var(--pointer-y);
  left: var(--pointer-x);
  display: block;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.pointer-glow__core {
  width: 7px;
  height: 7px;
  background: #ff8fb3;
  box-shadow: 0 0 18px 6px rgba(255, 143, 179, 0.42);
}

.pointer-glow__ring {
  width: 34px;
  height: 34px;
  border: 1px solid rgba(185, 167, 255, 0.62);
  opacity: 0.7;
  transition: width 220ms ease, height 220ms ease, border-color 220ms ease;
}

.pointer-glow:hover .pointer-glow__ring {
  width: 48px;
  height: 48px;
  border-color: rgba(255, 228, 138, 0.8);
}

@media (prefers-reduced-motion: reduce) {
  .pointer-glow { display: none; }
}
</style>
