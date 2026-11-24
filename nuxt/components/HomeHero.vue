<template>
  <section
    ref="heroEl"
    class="home-hero"
    aria-label="欢迎来到 BlackStar 的博客"
    @pointerenter="onPointerEnter"
    @pointermove.passive="onPointerMove"
    @pointerleave="onPointerLeave"
  >
    <div
      class="home-hero__bg"
      :class="{ 'is-tracking': pointerTracking }"
      :style="{ '--progress': progress, '--hero-shift': heroShift }"
      aria-hidden="true"
    >
      <!-- Keep the middle image beneath both side layers. Pointer position
           controls each side's opacity and travel, so pausing mid-gesture
           preserves the overlap instead of completing a timed image switch. -->
      <span
        v-for="(image, index) in HERO_IMAGES"
        :key="image"
        class="home-hero__bg-layer"
        :class="`home-hero__bg-layer--${index + 1}`"
        :style="{ backgroundImage: `url('${image}')` }"
      ></span>
      <span class="home-hero__bg-tint" aria-hidden="true"></span>
      <span class="home-hero__veil"></span>
      <span class="home-hero__blend"></span>
    </div>

    <div class="home-hero__content">
      <span class="home-hero__avatar">
        <img src="/luffy.jpg" alt="" width="84" height="84" fetchpriority="high" />
        <i class="home-hero__avatar-orbit" aria-hidden="true"></i>
        <b class="home-hero__avatar-spark" aria-hidden="true">✦</b>
      </span>
      <h1 class="home-hero__title">
        <span class="home-hero__title-text">{{ siteConfig.author }}</span>
      </h1>
      <p class="home-hero__role">前端工程师 · 夜猫子写作者</p>
      <div class="home-hero__hitokoto" :class="{ 'is-ready': hitokotoShown }">
        <p class="home-hero__hitokoto-text" aria-live="polite" aria-atomic="true" :aria-busy="hitokotoLoading">
          {{ typedHitokoto }}<span v-if="hitokotoFrom" class="home-hero__hitokoto-from"> ——「{{ hitokotoFrom }}」</span>
        </p>
        <button
          type="button"
          class="home-hero__hitokoto-refresh"
          aria-label="换一句一言"
          :class="{ 'is-busy': hitokotoLoading }"
          @click="refreshHitokoto"
        >
          <span aria-hidden="true">↻</span>
        </button>
      </div>
    </div>

    <button class="home-hero__scroll" type="button" aria-label="向下滚动，开始阅读" @click="scrollToContent">
      <span aria-hidden="true">▾</span>
    </button>
  </section>
</template>

<script setup lang="ts">
import type { Ref } from 'vue';
import { siteConfig } from '../../src/config/site';
import { onReducedMotionChange, prefersReducedMotion } from '../utils/motion';

interface Quote {
  text: string;
  from: string;
}

// Swap or extend the hero backgrounds here (public/ paths, in mouse-zone order: left / middle / right).
const HERO_IMAGES = ['/bg2.jpg', '/bg1.jpg', '/bg3.jpg'];
const FALLBACK_HITOKOTO = [
  { text: '星星发亮是为了让每一个人，有一天都能找到属于自己的星星。', from: '小王子' },
  { text: '慢慢来，比较快。', from: '生活倒影' },
  { text: '把每一个平凡的日子，过成想纪念的样子。', from: '生活倒影' },
  { text: '愿你有前进一寸的勇气，亦有后退一步的从容。', from: '生活倒影' },
  { text: '代码是写给人看的，只是顺便能在机器上运行。', from: 'SICP' },
];

const heroEl = ref<HTMLElement | null>(null);
const hitokotoShown = ref(false);
const hitokotoLoading = ref(false);
const typedHitokoto = ref('');
const hitokotoFrom = ref('');
let stopWatchingMotion: (() => void) | undefined;
let quoteAnimation: AbortController | undefined;
let quoteRequest: AbortController | undefined;
let currentQuote: Quote | undefined;

const wait = (ms: number, signal: AbortSignal) => {
  if (signal.aborted) return Promise.resolve(false);
  return new Promise<boolean>((resolve) => {
    const stop = () => {
      window.clearTimeout(timer);
      resolve(false);
    };
    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', stop);
      resolve(true);
    }, ms);
    signal.addEventListener('abort', stop, { once: true });
  });
};

const typeText = async (target: Ref<string>, full: string, speed: number, signal: AbortSignal) => {
  if (signal.aborted) return;
  let partial = '';
  target.value = '';
  for (const character of full) {
    partial += character;
    target.value = partial;
    if (!(await wait(speed, signal)) || signal.aborted) return;
  }
};

const showFullQuote = (quote: Quote) => {
  typedHitokoto.value = quote.text;
  hitokotoFrom.value = quote.from;
  hitokotoShown.value = true;
};

const presentHitokoto = async (quote: Quote) => {
  currentQuote = quote;
  if (prefersReducedMotion()) {
    showFullQuote(quote);
    return;
  }

  const animation = new AbortController();
  quoteAnimation = animation;
  const { signal } = animation;
  try {
    // Fade the previous quote before typing its replacement.
    if (hitokotoShown.value) {
      hitokotoShown.value = false;
      if (!(await wait(240, signal)) || signal.aborted) return;
    }
    hitokotoFrom.value = '';
    hitokotoShown.value = true;
    await typeText(typedHitokoto, quote.text, 70, signal);
    if (!signal.aborted) hitokotoFrom.value = quote.from;
  } finally {
    if (quoteAnimation === animation) quoteAnimation = undefined;
  }
};

const fetchHitokoto = async (request: AbortController): Promise<Quote> => {
  const timer = window.setTimeout(() => request.abort(), 3500);
  try {
    const response = await fetch('https://v1.hitokoto.cn/?c=a&c=b&c=d&c=i&c=k&max_len=36', { signal: request.signal });
    if (response.ok) {
      const data = (await response.json()) as { hitokoto?: string; from?: string };
      if (data.hitokoto) return { text: data.hitokoto, from: data.from || '' };
    }
  } catch {
    // Fall through to a local fallback when the service is unreachable.
  } finally {
    window.clearTimeout(timer);
  }
  const pick = FALLBACK_HITOKOTO[Math.floor(Math.random() * FALLBACK_HITOKOTO.length)]!;
  return { text: pick.text, from: pick.from };
};

const refreshHitokoto = async () => {
  if (hitokotoLoading.value) return;
  hitokotoLoading.value = true;
  const request = new AbortController();
  quoteRequest = request;
  try {
    const quote = await fetchHitokoto(request);
    if (quoteRequest === request) await presentHitokoto(quote);
  } finally {
    if (quoteRequest === request) {
      quoteRequest = undefined;
      hitokotoLoading.value = false;
    }
  }
};

/**
 * 鼠标“从屏幕外落到左侧/右侧”时，第一帧本身不是移动。画面必须先停在中间图，
 * 等指针相对进入点产生一小段横向位移后，才沿着方向和距离逐渐揭开侧图。
 */
const progress = ref(0.5);
const heroShift = ref(0);
const pointerTracking = ref(false);
const MOVE_THRESHOLD = 4;
let pointerEntryX = 0;
let pointerEntryY = 0;
let pointerArmed = false;
let pointerFrame = 0;
let pendingShift = 0;

const setProgress = (value: number) => {
  // Clamp so a fast flick cannot overshoot the ends of the ramp.
  progress.value = Math.min(1, Math.max(0, value));
};

const applyShift = (shift: number) => {
  heroShift.value = shift;
  setProgress(0.5 + shift / 2);
};

const onPointerEnter = (event: PointerEvent) => {
  if (event.pointerType === 'touch' || prefersReducedMotion()) return;
  // 从页面外/导航栏进入时，以进入点为本次手势原点；此时绝不按绝对横坐标换图。
  pointerEntryX = event.clientX;
  pointerEntryY = event.clientY;
  pointerArmed = false;
  pointerTracking.value = false;
  applyShift(0);
};

const onPointerMove = (event: PointerEvent) => {
  if (event.pointerType === 'touch' || prefersReducedMotion()) return;
  const distanceX = event.clientX - pointerEntryX;
  const distanceY = event.clientY - pointerEntryY;
  if (!pointerArmed) {
    if (Math.hypot(distanceX, distanceY) < MOVE_THRESHOLD) return;
    pointerArmed = true;
  }
  const heroWidth = heroEl.value?.getBoundingClientRect().width || window.innerWidth;
  if (heroWidth <= 0) return;
  const travel = Math.min(heroWidth * 0.32, 420);
  // 相对进入点计算位移，鼠标停住时画面也停住；越过阈值后从极轻的偏移开始过渡。
  const next = Math.min(1, Math.max(-1, distanceX / travel));
  pointerTracking.value = true;
  pendingShift = next;
  // Coalesce pointer updates to one style write per frame. Writing a reactive
  // value on every raw pointermove forces Vue to patch three full-screen
  // layers dozens of times per second, which is what made the hero feel sticky
  // when a scroll started mid-gesture.
  if (pointerFrame) return;
  pointerFrame = window.requestAnimationFrame(() => {
    applyShift(pendingShift);
    pointerFrame = 0;
  });
};

/** Ease back to the middle image when the pointer leaves the hero. */
const onPointerLeave = () => {
  pointerTracking.value = false;
  pointerArmed = false;
  if (pointerFrame) {
    window.cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
  }
  applyShift(0);
};

const scrollToContent = () => {
  document.getElementById('home-body')?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
};

const applyMotionPreference = (reduced: boolean) => {
  if (reduced) {
    onPointerLeave();
    quoteAnimation?.abort();
    if (currentQuote) showFullQuote(currentQuote);
  }
};

onMounted(() => {
  stopWatchingMotion = onReducedMotionChange(applyMotionPreference);
  applyMotionPreference(prefersReducedMotion());
  void refreshHitokoto();
});

onBeforeUnmount(() => {
  stopWatchingMotion?.();
  quoteAnimation?.abort();
  quoteRequest?.abort();
  quoteRequest = undefined;
  if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
});
</script>

<style scoped>
.home-hero {
  position: relative;
  display: grid;
  place-items: center;
  width: 100vw;
  /* Fill the first screen edge to edge. svh (not dvh) keeps the height stable
     while mobile browser chrome collapses, so scrolling does not resize the
     hero on every frame. */
  height: 100svh;
  min-height: 30rem;
  margin-inline: calc(50% - 50vw);
  overflow: hidden;
}

/* The middle is the resting plate; each side slides in from its own edge.
   A stationary pointer keeps the exact same blend and position. */
.home-hero__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  --progress: 0.5;
  --left-reveal: clamp(0, (0.5 - var(--progress)) * 2, 1);
  --right-reveal: clamp(0, (var(--progress) - 0.5) * 2, 1);
  --hero-shift: 0;
  --hero-travel: clamp(32px, 5vw, 72px);
}

.home-hero__bg-layer {
  position: absolute;
  /* Overscan keeps the viewport covered throughout the horizontal travel. */
  inset: 0 calc(-1 * var(--hero-travel));
  z-index: 1;
  background-position: center;
  background-size: cover;
  will-change: transform;
  transform: translateZ(0);
  transition: opacity var(--bs-dur-mid) var(--bs-ease-glide), transform var(--bs-dur-mid) var(--bs-ease-glide);
}

.home-hero__bg.is-tracking .home-hero__bg-layer {
  transition: none;
}

.home-hero__bg-layer--1 {
  opacity: var(--left-reveal);
  transform: translateX(calc((var(--left-reveal) - 1) * var(--hero-travel)));
}

.home-hero__bg-layer--2 {
  z-index: 0;
  opacity: 1;
  /* 中间图也吃同一份位移：向左偏时向左轻移，向右偏时向右轻移。 */
  transform: translateX(calc(var(--hero-shift) * var(--hero-travel) * -.64));
}

.home-hero__bg-layer--3 {
  opacity: var(--right-reveal);
  transform: translateX(calc((1 - var(--right-reveal)) * var(--hero-travel)));
}

.home-hero__bg-tint,
.home-hero__veil,
.home-hero__blend {
  z-index: 2;
}

/* Per-image colour wash that keeps the palette shifting as the art changes. */
.home-hero__bg-tint {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 18% 22%, rgba(255, 143, 179, .3), transparent 46%),
    radial-gradient(circle at 82% 74%, rgba(185, 167, 255, .28), transparent 48%),
    linear-gradient(120deg, rgba(158, 230, 208, .18), rgba(255, 228, 138, .16));
  mix-blend-mode: soft-light;
  pointer-events: none;
  animation: hero-tint-drift 18s ease-in-out infinite;
}

/* Animate opacity only: scaling a blend-mode layer repaints the whole hero,
   including all three photographs, and showed up as scroll jank. */
@keyframes hero-tint-drift {
  0%, 100% { opacity: .7; }
  50% { opacity: .95; }
}

.home-hero__veil { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(37, 28, 54, .5), rgba(37, 28, 54, .16) 38%, rgba(37, 28, 54, .52)); }
/* 渐变收口用主题 token，浅色/星空色随 bs-dark 一起切换。 */
.home-hero__blend { position: absolute; inset: auto 0 0; height: 8.5rem; background: linear-gradient(180deg, transparent, var(--bs-blend-fade) 76%, var(--bs-page-bottom)); }

.home-hero__content { position: relative; z-index: 1; display: grid; justify-items: center; gap: .45rem; padding: 2rem 1.2rem; color: #fffaf5; text-align: center; }
/* 大图铺满后画面里有大片高明度区域，仅靠渐变遮罩文字会发灰。
   在内容后面垫一层柔和的暗色晕影，保持插画完整，又让字始终读得清。 */
.home-hero__content::before {
  position: absolute;
  inset: -2.5rem -3rem;
  z-index: -1;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(29, 21, 44, .62), rgba(29, 21, 44, .3) 52%, transparent 74%);
  filter: blur(10px);
  content: "";
  pointer-events: none;
}

/* A small portrait anchored above the wordmark: the illustration carries the
   scene, the avatar makes it feel like a person's corner of the web. */
.home-hero__avatar {
  position: relative;
  display: grid;
  place-items: center;
  width: 4.4rem;
  height: 4.4rem;
  margin-bottom: .15rem;
  border: 2px solid rgba(255, 250, 245, .9);
  border-radius: 50%;
  background: rgba(43, 32, 62, .4);
  box-shadow: 0 10px 30px rgba(24, 16, 38, .45), 0 0 0 4px rgba(255, 250, 245, .18);
}
.home-hero__avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}
.home-hero__avatar-orbit {
  position: absolute;
  inset: -.55rem;
  border: 1px dashed rgba(255, 228, 138, .65);
  border-radius: 50%;
  animation: hero-avatar-orbit 16s linear infinite;
}
.home-hero__avatar-spark {
  position: absolute;
  top: -.35rem;
  right: -.4rem;
  color: #ffe48a;
  font-size: .95rem;
  text-shadow: 0 0 10px rgba(255, 228, 138, .85);
}
@keyframes hero-avatar-orbit { to { transform: rotate(360deg); } }

.home-hero__role {
  margin: .15rem 0 0;
  padding: .18rem .7rem;
  border: 1px solid rgba(255, 250, 245, .28);
  border-radius: 999px;
  background: rgba(43, 32, 62, .38);
  color: rgba(255, 250, 245, .92);
  font-size: .72rem;
  letter-spacing: .1em;
  text-shadow: 0 1px 6px rgba(24, 16, 38, .5);
}

/* A wordmark, not a poster. Capped near 3rem so it reads as a name on top of
   the artwork rather than a full-bleed headline. */
.home-hero__title { margin: 0; font-size: clamp(1.9rem, 4.4vw, 3rem); line-height: 1.15; letter-spacing: .02em; }
/* The name gets an animated gradient so the hero reads as alive even before the
   visitor moves the pointer. */
.home-hero__title-text {
  background: linear-gradient(100deg, #ffe48a, #ff8fb3 28%, #b9a7ff 52%, #9ee6d0 74%, #ffe48a);
  background-size: 260% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 3px 12px rgba(24, 16, 38, .85)) drop-shadow(0 0 2px rgba(255, 250, 245, .6));
  animation: hero-title-flow 9s linear infinite;
}

@keyframes hero-title-flow {
  from { background-position: 0% 50%; }
  to { background-position: 260% 50%; }
}

.home-hero__hitokoto { display: flex; align-items: center; gap: .55rem; max-width: 44rem; min-height: 2.6rem; margin: .8rem 0 0; padding: .5rem .6rem .5rem 1.1rem; border: 1px solid rgba(255, 250, 245, .38); border-radius: 1.1rem; background: rgba(43, 32, 62, .62); line-height: 1.75; text-shadow: 0 2px 10px rgba(37, 28, 54, .55); opacity: 0; transform: translateY(6px); transition: opacity var(--bs-dur-mid) ease, transform var(--bs-dur-mid) ease; }
.home-hero__hitokoto.is-ready { opacity: 1; transform: none; }
.home-hero__hitokoto-text { margin: 0; font-size: .92rem; }
.home-hero__hitokoto-from { opacity: .85; }

.home-hero__hitokoto-refresh { flex: 0 0 auto; display: grid; place-items: center; width: 2rem; height: 2rem; padding: 0; border: 1px solid rgba(255, 250, 245, .3); border-radius: 50%; background: rgba(255, 250, 245, .12); color: #fffaf5; font-size: .95rem; line-height: 1; cursor: pointer; transition: var(--bs-dur-quick) ease; }
.home-hero__hitokoto-refresh:hover { background: rgba(255, 143, 179, .42); border-color: rgba(255, 250, 245, .6); transform: rotate(180deg); }
.home-hero__hitokoto-refresh:focus-visible { outline: 3px solid rgba(255, 228, 138, .9); outline-offset: 2px; }
.home-hero__hitokoto-refresh.is-busy { opacity: .55; cursor: wait; }
@media (prefers-reduced-motion: no-preference) {
  .home-hero__hitokoto-refresh.is-busy span { animation: hero-refresh-spin .9s linear infinite; }
}
@keyframes hero-refresh-spin { to { transform: rotate(360deg); } }

.home-hero__scroll { position: absolute; bottom: 1.6rem; left: 50%; z-index: 1; display: grid; place-items: center; width: 2.7rem; height: 2.7rem; padding: 0; border: 1px solid rgba(255, 250, 245, .5); border-radius: 999px; background: rgba(43, 32, 62, .42); color: #fffaf5; font-size: 1.05rem; cursor: pointer; transform: translateX(-50%); transition: var(--bs-dur-quick) ease; }
.home-hero__scroll:hover { background: rgba(255, 143, 179, .38); transform: translateX(-50%) translateY(-3px); }
@media (prefers-reduced-motion: no-preference) {
  .home-hero__scroll span { animation: hero-arrow-bounce 2.2s ease-in-out infinite; }
}
@keyframes hero-arrow-bounce { 0%, 100% { transform: translateY(-2px); } 50% { transform: translateY(3px); } }

@media (max-width: 640px) {
  .home-hero__hitokoto { flex-wrap: wrap; justify-content: center; padding: .5rem .9rem; }
  .home-hero__hitokoto-text { font-size: .85rem; }
}

html.bs-reduced-motion .home-hero__bg-layer,
html.bs-reduced-motion .home-hero__hitokoto,
html.bs-reduced-motion .home-hero__hitokoto-refresh,
html.bs-reduced-motion .home-hero__scroll { transition: none; }
html.bs-reduced-motion .home-hero__bg-tint,
html.bs-reduced-motion .home-hero__title-text,
html.bs-reduced-motion .home-hero__avatar-orbit,
html.bs-reduced-motion .home-hero__hitokoto-refresh span,
html.bs-reduced-motion .home-hero__scroll span { animation: none; }
html.bs-reduced-motion .home-hero__hitokoto-refresh:hover { transform: none; }
html.bs-reduced-motion .home-hero__scroll:hover { transform: translateX(-50%); }

@media (prefers-reduced-motion: reduce) {
  .home-hero__bg-layer, .home-hero__hitokoto, .home-hero__hitokoto-refresh, .home-hero__scroll { transition: none; }
  .home-hero__bg-tint, .home-hero__title-text, .home-hero__hitokoto-refresh span,
  .home-hero__avatar-orbit,
  .home-hero__scroll span { animation: none; }
  .home-hero__hitokoto-refresh:hover { transform: none; }
  .home-hero__scroll:hover { transform: translateX(-50%); }
}
</style>
