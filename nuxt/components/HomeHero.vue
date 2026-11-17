<template>
  <section ref="heroEl" class="home-hero" aria-label="欢迎来到生活倒影" @pointermove="onPointerMove">
    <div class="home-hero__bg" aria-hidden="true">
      <span
        v-for="(image, index) in HERO_IMAGES"
        :key="image"
        class="home-hero__bg-layer"
        :class="{ 'is-active': index === activeImage }"
        :style="{ backgroundImage: `url('${image}')` }"
      ></span>
      <span class="home-hero__veil"></span>
      <span class="home-hero__blend"></span>
    </div>

    <div class="home-hero__content">
      <p class="home-hero__sparkles" aria-hidden="true">☾ ✧ ☽</p>
      <h1 class="home-hero__title">{{ siteConfig.name }}</h1>
      <p class="home-hero__subtitle">{{ typedSubtitle }}<span class="home-hero__caret" aria-hidden="true"></span></p>
      <p class="home-hero__hitokoto" :class="{ 'is-ready': hitokotoShown }" aria-label="一言">
        <template v-if="hitokotoShown">
          {{ typedHitokoto }}<span v-if="hitokotoFrom" class="home-hero__hitokoto-from"> ——「{{ hitokotoFrom }}」</span>
        </template>
      </p>
    </div>

    <button class="home-hero__scroll" type="button" aria-label="向下滚动，开始阅读" @click="scrollToContent">
      <span aria-hidden="true">▾</span>
    </button>
  </section>
</template>

<script setup lang="ts">
import type { Ref } from 'vue';
import { siteConfig } from '../../src/config/site';

// Swap or extend the hero backgrounds here (public/ paths, in mouse-zone order: left / middle / right).
const HERO_IMAGES = ['/bg1.jpg', '/bg2.jpg', '/bg3.jpg'];
const PHRASES = [
  siteConfig.description,
  '把技术、生活和灵感，写成会发光的小故事。',
  '在星光与代码之间，慢慢写。',
  '今天也要，元气满满地写代码 ✧',
];
const FALLBACK_HITOKOTO = [
  { text: '星星发亮是为了让每一个人，有一天都能找到属于自己的星星。', from: '小王子' },
  { text: '慢慢来，比较快。', from: '生活倒影' },
  { text: '把每一个平凡的日子，过成想纪念的样子。', from: '生活倒影' },
];

const heroEl = ref<HTMLElement | null>(null);
const activeImage = ref(0);
const typedSubtitle = ref(PHRASES[0]!);
const hitokotoShown = ref(false);
const typedHitokoto = ref('');
const hitokotoFrom = ref('');
let alive = true;
let autoRotateTimer = 0;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

const typeText = async (target: Ref<string>, full: string, speed: number) => {
  target.value = '';
  for (let i = 1; i <= full.length; i += 1) {
    if (!alive) return false;
    target.value = full.slice(0, i);
    await wait(speed);
  }
  return alive;
};

const runSubtitleLoop = async () => {
  if (prefersReducedMotion()) {
    typedSubtitle.value = PHRASES[0]!;
    return;
  }
  await wait(2600);
  let index = 0;
  while (alive) {
    index = (index + 1) % PHRASES.length;
    for (let length = typedSubtitle.value.length; length > 0 && alive; length -= 1) {
      typedSubtitle.value = typedSubtitle.value.slice(0, -1);
      await wait(26);
    }
    if (!alive || !(await typeText(typedSubtitle, PHRASES[index]!, 130))) return;
    await wait(2600);
  }
};

const loadHitokoto = async () => {
  let quote = FALLBACK_HITOKOTO[Math.floor(Math.random() * FALLBACK_HITOKOTO.length)]!;
  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 3500);
    const response = await fetch('https://v1.hitokoto.cn/?c=a&c=b&c=d&c=i&c=k&max_len=36', { signal: controller.signal });
    window.clearTimeout(timer);
    if (response.ok) {
      const data = (await response.json()) as { hitokoto?: string; from?: string };
      if (data.hitokoto) quote = { text: data.hitokoto, from: data.from || '' };
    }
  } catch {
    // Keep the warm local fallback when the hitokoto service is unreachable.
  }
  if (!alive) return;
  hitokotoShown.value = true;
  if (prefersReducedMotion()) {
    typedHitokoto.value = quote.text;
    hitokotoFrom.value = quote.from;
    return;
  }
  if (!(await typeText(typedHitokoto, quote.text, 85))) return;
  hitokotoFrom.value = quote.from;
};

const onPointerMove = (event: PointerEvent) => {
  if (prefersReducedMotion()) return;
  const ratio = event.clientX / window.innerWidth;
  activeImage.value = ratio < 1 / 3 ? 0 : ratio < 2 / 3 ? 1 : 2;
};

const scrollToContent = () => {
  document.getElementById('home-body')?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
};

onMounted(() => {
  // Touch devices have no hover cursor: gently rotate the backgrounds instead.
  if (!prefersReducedMotion() && !window.matchMedia('(hover: hover)').matches) {
    autoRotateTimer = window.setInterval(() => {
      activeImage.value = (activeImage.value + 1) % HERO_IMAGES.length;
    }, 7000);
  }
  void runSubtitleLoop();
  void loadHitokoto();
});

onBeforeUnmount(() => {
  alive = false;
  if (autoRotateTimer) window.clearInterval(autoRotateTimer);
});
</script>

<style scoped>
.home-hero {
  position: relative;
  display: grid;
  place-items: center;
  width: 100vw;
  height: min(86svh, 52rem);
  min-height: 26rem;
  margin-inline: calc(50% - 50vw);
  overflow: hidden;
}

.home-hero__bg { position: absolute; inset: 0; }
.home-hero__bg-layer { position: absolute; inset: 0; background-position: center; background-size: cover; opacity: 0; transform: scale(1.08); transition: opacity 900ms ease, transform 1.8s ease; will-change: opacity, transform; }
.home-hero__bg-layer.is-active { opacity: 1; transform: scale(1); }
.home-hero__veil { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(57,45,79,.36), rgba(57,45,79,.12) 42%, rgba(57,45,79,.32)); }
.home-hero__blend { position: absolute; inset: auto 0 0; height: 8.5rem; background: linear-gradient(180deg, rgba(255,244,248,0), rgba(255,244,248,.9) 76%, #fff4f8); }

.home-hero__content { position: relative; z-index: 1; display: grid; justify-items: center; gap: .45rem; padding: 2rem 1.2rem; color: #fffaf5; text-align: center; }
.home-hero__sparkles { margin: 0; letter-spacing: .5em; opacity: .9; text-shadow: 0 2px 14px rgba(57,45,79,.5); }
.home-hero__title { margin: 0; color: #fffaf5; font-size: clamp(3rem, 10vw, 5.8rem); line-height: 1.05; letter-spacing: .06em; text-shadow: 0 6px 30px rgba(57,45,79,.55), 3px 3px 0 rgba(255,228,138,.4); }
.home-hero__subtitle { display: flex; align-items: center; min-height: 2.4em; margin: .2rem 0 0; font-size: clamp(1rem, 2.4vw, 1.25rem); line-height: 1.7; text-shadow: 0 2px 16px rgba(57,45,79,.55); }
.home-hero__caret { display: inline-block; width: 3px; height: 1.15em; margin-left: .18em; border-radius: 999px; background: #ffe48a; box-shadow: 0 0 10px rgba(255,228,138,.85); }
@media (prefers-reduced-motion: no-preference) {
  .home-hero__caret { animation: hero-caret-blink 1.1s ease-in-out infinite; }
}
@keyframes hero-caret-blink { 0%, 100% { opacity: 1; } 50% { opacity: .15; } }

.home-hero__hitokoto { max-width: 44rem; min-height: 2.4rem; margin: .8rem 0 0; padding: .55rem 1.15rem; border: 1px solid rgba(255,250,245,.35); border-radius: 1.1rem; background: rgba(57,45,79,.28); font-size: .92rem; line-height: 1.75; text-shadow: 0 2px 10px rgba(57,45,79,.4); backdrop-filter: blur(8px); opacity: 0; transform: translateY(6px); transition: opacity 500ms ease, transform 500ms ease; }
.home-hero__hitokoto.is-ready { opacity: 1; transform: none; }
.home-hero__hitokoto-from { opacity: .85; }

.home-hero__scroll { position: absolute; bottom: 1.6rem; left: 50%; z-index: 1; display: grid; place-items: center; width: 2.7rem; height: 2.7rem; padding: 0; border: 1px solid rgba(255,250,245,.5); border-radius: 999px; background: rgba(255,250,245,.16); color: #fffaf5; font-size: 1.05rem; cursor: pointer; backdrop-filter: blur(8px); transform: translateX(-50%); transition: 200ms ease; }
.home-hero__scroll:hover { background: rgba(255,143,179,.38); transform: translateX(-50%) translateY(-3px); }
@media (prefers-reduced-motion: no-preference) {
  .home-hero__scroll span { animation: hero-arrow-bounce 2.2s ease-in-out infinite; }
}
@keyframes hero-arrow-bounce { 0%, 100% { transform: translateY(-2px); } 50% { transform: translateY(3px); } }

@media (prefers-reduced-motion: reduce) {
  .home-hero__bg-layer { transition: none; }
  .home-hero__hitokoto { transition: none; }
}
</style>
