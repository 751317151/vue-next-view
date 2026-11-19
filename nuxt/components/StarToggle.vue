<template>
  <button
    ref="buttonEl"
    class="star-toggle"
    :class="{ 'is-collected': collected }"
    type="button"
    :aria-pressed="collected"
    :aria-label="collected ? `把《${item.title}》从星愿瓶取出` : `把《${item.title}》收进星愿瓶`"
    :title="collected ? '已收进星愿瓶' : '收进星愿瓶'"
    @click.prevent.stop="onClick"
  >
    <span aria-hidden="true">{{ collected ? '★' : '☆' }}</span>
  </button>
</template>

<script setup lang="ts">
import { flyStarToJar, useStarJar, type StarItem } from '../composables/useStarJar';

const props = defineProps<{ item: Omit<StarItem, 'savedAt'> }>();

const { has, toggle, hydrate } = useStarJar();
const collected = computed(() => has(props.item.slug));
const buttonEl = ref<HTMLButtonElement | null>(null);

onMounted(hydrate);

const onClick = (event: MouseEvent) => {
  const added = toggle(props.item);
  // 只有"收进来"时才放星星；取出时不飞。
  if (!added) return;

  // 键盘触发（Enter / 空格）时 clientX/Y 恒为 0，星星会从屏幕左上角飞出来，
  // 所以拿按钮自身的中点兜底，动画起点才落在用户视线所在的位置。
  if (event.clientX || event.clientY) {
    flyStarToJar({ x: event.clientX, y: event.clientY }, props.item.emoji);
    return;
  }
  const rect = buttonEl.value?.getBoundingClientRect();
  if (!rect) return;
  flyStarToJar({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }, props.item.emoji);
};
</script>

<style scoped>
.star-toggle { display: grid; place-items: center; width: 2rem; height: 2rem; padding: 0; border: 1px solid var(--bs-border); border-radius: 50%; background: var(--bs-surface-strong); color: var(--bs-ink-muted); font-size: 1rem; line-height: 1; cursor: pointer; transition: transform var(--bs-dur-quick) var(--bs-ease-pop), color var(--bs-dur-quick) ease, background var(--bs-dur-quick) ease, border-color var(--bs-dur-quick) ease; }
.star-toggle:hover { color: var(--bs-yellow); border-color: var(--bs-border-accent); transform: translateY(-2px) rotate(-8deg) scale(1.1); }
.star-toggle:focus-visible { outline: 3px solid rgba(185, 167, 255, 0.72); outline-offset: 2px; }
.star-toggle.is-collected { color: var(--bs-yellow); border-color: var(--bs-border-accent); background: var(--bs-tint-yellow); }
.star-toggle.is-collected span { animation: star-pop var(--bs-dur-mid) var(--bs-ease-pop); }
@keyframes star-pop { 0% { transform: scale(0.4) rotate(-40deg); } 60% { transform: scale(1.35) rotate(12deg); } 100% { transform: scale(1) rotate(0); } }
@media (prefers-reduced-motion: reduce) { .star-toggle.is-collected span { animation: none; } .star-toggle:hover { transform: none; } }
</style>
