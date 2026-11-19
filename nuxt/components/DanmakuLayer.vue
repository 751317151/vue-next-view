<template>
  <ClientOnly>
    <div v-if="preferred && messages.length" class="danmaku-layer" aria-hidden="true">
      <vue-danmaku
        ref="danmakuRef"
        :danmus="danmus"
        :speeds="speed"
        :channels="channels"
        :random-channel="true"
        :is-suspend="paused"
        loop
        use-slot
        style="height: 100%; width: 100%"
      >
        <template #dm="{ danmu }">
          <span class="danmaku-pill" :style="{ background: danmu.tint }">
            <span class="danmaku-pill__face" aria-hidden="true">{{ danmu.emoji }}</span>
            <span class="danmaku-pill__text">{{ danmu.text }}</span>
            <span class="danmaku-pill__name">{{ danmu.name }}</span>
          </span>
        </template>
      </vue-danmaku>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import vueDanmaku from 'vue3-danmaku';
import type { GuestMessage } from '../composables/useMessageBoard';

const props = withDefaults(defineProps<{ messages: GuestMessage[]; maxItems?: number }>(), {
  maxItems: 40,
});

const { danmakuEnabled } = useAppearance();

/** Tints cycle through the visual system so the wall stays on-palette. */
const TINTS = [
  'linear-gradient(135deg, rgba(255,143,179,.92), rgba(255,189,138,.86))',
  'linear-gradient(135deg, rgba(185,167,255,.92), rgba(158,230,208,.86))',
  'linear-gradient(135deg, rgba(158,230,208,.94), rgba(255,228,138,.86))',
  'linear-gradient(135deg, rgba(255,228,138,.94), rgba(255,143,179,.84))',
  'linear-gradient(135deg, rgba(255,189,138,.92), rgba(185,167,255,.86))',
];

const tintFor = (seed: string) => {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return TINTS[hash % TINTS.length]!;
};

const danmakuRef = ref<{ resize?: () => void } | null>(null);
const paused = ref(false);

/** Long text wraps inside the pill; short notes stay one line. */
const danmus = computed(() =>
  props.messages.slice(0, props.maxItems).map((message) => ({
    id: message.id,
    text: message.text.replace(/\s+/g, ' ').slice(0, 60),
    name: message.name,
    emoji: message.emoji,
    tint: tintFor(message.id),
  })),
);

// Pause the animation when the tab is hidden so background tabs stay cheap.
const onVisibility = () => { paused.value = document.hidden; };
const onResize = () => danmakuRef.value?.resize?.();

onMounted(() => {
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('resize', onResize, { passive: true });
});
onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', onVisibility);
  window.removeEventListener('resize', onResize);
});

const channels = ref(3);
const speed = ref(90);

const syncDensity = () => {
  const width = window.innerWidth;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  // Phones get fewer lanes and a gentler speed: dense motion on a small screen
  // is unreadable and costs frames.
  channels.value = coarse || width < 700 ? 2 : width < 1200 ? 3 : 4;
  speed.value = coarse || width < 700 ? 70 : 90;
};

const preferred = computed(() => danmakuEnabled.value);

onMounted(() => {
  syncDensity();
  window.addEventListener('resize', syncDensity, { passive: true });
});
onBeforeUnmount(() => window.removeEventListener('resize', syncDensity));
</script>

<style scoped>
/* Sits behind the message board content and never steals clicks. */
.danmaku-layer { position: fixed; inset: 0; z-index: 4; pointer-events: none; }

.danmaku-pill { display: inline-flex; align-items: center; gap: .4rem; max-width: min(22rem, 70vw); padding: .3rem .8rem .3rem .4rem; border-radius: 999px; box-shadow: 0 6px 18px rgba(57, 45, 79, 0.18); color: #3a2b46; font-size: .84rem; line-height: 1.35; }
.danmaku-pill__face { flex: 0 0 auto; display: grid; place-items: center; width: 1.5rem; height: 1.5rem; border-radius: 50%; background: rgba(255, 255, 255, 0.68); font-size: .8rem; }
.danmaku-pill__text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.danmaku-pill__name { flex: 0 0 auto; color: rgba(57, 43, 70, 0.62); font-size: .72rem; }

@media (max-width: 700px) { .danmaku-layer { display: none; } }
</style>
