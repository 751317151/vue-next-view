<template>
  <section ref="heroEl" class="home-hero" aria-label="欢迎来到 BlackStar 的博客" @pointermove="onPointerMove">
    <div class="home-hero__bg" aria-hidden="true">
      <!-- Every layer stays mounted and fully painted. During a switch the
           outgoing layer is faded/slid out while the incoming one fades/slides
           in over the same window, so both images are visibly on screen at once
           instead of one replacing the other. Opacity is driven inline so the
           cross-fade cannot be defeated by class-order specificity. -->
      <span
        v-for="(image, index) in HERO_IMAGES"
        :key="image"
        class="home-hero__bg-layer"
        :class="{ 'is-leaving': index === leavingImage }"
        :style="{
          backgroundImage: `url('${image}')`,
          opacity: index === activeImage ? 1 : 0,
          transform: index === activeImage
            ? 'translate3d(0,0,0) scale(1)'
            : index === pendingImage
              ? 'translate3d(6%,0,0) scale(1.08)'
              : index === leavingImage
                ? 'translate3d(-5%,0,0) scale(1.05)'
                : 'translate3d(6%,0,0) scale(1.08)',
        }"
      ></span>
      <span class="home-hero__bg-tint" aria-hidden="true"></span>
      <span class="home-hero__veil"></span>
      <span class="home-hero__blend"></span>
    </div>

    <div class="home-hero__content">
      <p class="home-hero__sparkles" aria-hidden="true">☾ ✧ ☽</p>
      <h1 class="home-hero__title">
        <span class="home-hero__title-text">{{ siteConfig.author }}</span>
      </h1>
      <p class="home-hero__subtitle">{{ typedSubtitle }}<span class="home-hero__caret" aria-hidden="true"></span></p>
      <div class="home-hero__hitokoto" :class="{ 'is-ready': hitokotoShown }">
        <p class="home-hero__hitokoto-text" aria-live="polite">
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
  { text: '愿你有前进一寸的勇气，亦有后退一步的从容。', from: '生活倒影' },
  { text: '代码是写给人看的，只是顺便能在机器上运行。', from: 'SICP' },
];

const heroEl = ref<HTMLElement | null>(null);
const activeImage = ref(0);
/** Index of the layer currently sliding out, so both images show at once. */
const leavingImage = ref(-1);
/** Layer staged off-stage for one frame before it becomes active. */
const pendingImage = ref(-1);
const typedSubtitle = ref(PHRASES[0]!);
const hitokotoShown = ref(false);
const hitokotoLoading = ref(false);
const typedHitokoto = ref('');
const hitokotoFrom = ref('');
let alive = true;
let autoRotateTimer = 0;
let hitokotoRequest = 0;
let leavingTimer = 0;

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

/** Show one quote, typed out. `quote` may come from the API or a local fallback. */
const presentHitokoto = async (quote: { text: string; from: string }) => {
  if (!alive) return;
  hitokotoShown.value = true;

  if (prefersReducedMotion()) {
    typedHitokoto.value = quote.text;
    hitokotoFrom.value = quote.from;
    return;
  }

  // Fade the current line out before typing the next one, so a refresh does not
  // look like the same sentence mutating in place.
  hitokotoShown.value = false;
  await wait(240);
  if (!alive) return;
  typedHitokoto.value = '';
  hitokotoFrom.value = '';
  hitokotoShown.value = true;
  if (!(await typeText(typedHitokoto, quote.text, 70))) return;
  hitokotoFrom.value = quote.from;
};

const fetchHitokoto = async (): Promise<{ text: string; from: string }> => {
  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 3500);
    const response = await fetch('https://v1.hitokoto.cn/?c=a&c=b&c=d&c=i&c=k&max_len=36', { signal: controller.signal });
    window.clearTimeout(timer);
    if (response.ok) {
      const data = (await response.json()) as { hitokoto?: string; from?: string };
      if (data.hitokoto) return { text: data.hitokoto, from: data.from || '' };
    }
  } catch {
    // Fall through to a local fallback when the service is unreachable.
  }
  const pick = FALLBACK_HITOKOTO[Math.floor(Math.random() * FALLBACK_HITOKOTO.length)]!;
  return { text: pick.text, from: pick.from };
};

/** Manual refresh from the button: guards against overlapping responses. */
const refreshHitokoto = async () => {
  if (hitokotoLoading.value) return;
  hitokotoLoading.value = true;
  const request = ++hitokotoRequest;
  const quote = await fetchHitokoto();
  // A slower earlier request must not overwrite a newer one.
  if (request === hitokotoRequest && alive) await presentHitokoto(quote);
  hitokotoLoading.value = false;
};

/**
 * Run `fn` after the browser has painted the current style. rAF is preferred so
 * the intermediate frame is real, but it is throttled to nothing in background
 * tabs, so a timer fallback keeps switching working there too.
 */
const nextFrames = (fn: () => void) => {
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    fn();
  };
  window.requestAnimationFrame(() => window.requestAnimationFrame(run));
  // Two frames is ~32ms; if rAF is throttled, this still lands after paint.
  window.setTimeout(run, 60);
};

/** Swap the hero art, keeping the previous layer painted long enough to overlap. */
const switchTo = (next: number) => {
  if (next === activeImage.value) return;
  const previous = activeImage.value;

  // Stage the incoming layer off-stage for one frame. Without this, Vue batches
  // both style changes into the same tick and the browser jumps straight to the
  // final value, skipping the cross-fade entirely.
  leavingImage.value = -1;
  pendingImage.value = next;

  nextFrames(() => {
    if (!alive) return;
    leavingImage.value = previous;
    activeImage.value = next;
    pendingImage.value = -1;
  });

  // Drop the leaving layer only after its exit transition finishes.
  window.clearTimeout(leavingTimer);
  leavingTimer = window.setTimeout(() => { leavingImage.value = -1; }, 1250);
};

const onPointerMove = (event: PointerEvent) => {
  if (prefersReducedMotion()) return;
  const ratio = event.clientX / window.innerWidth;
  switchTo(ratio < 1 / 3 ? 0 : ratio < 2 / 3 ? 1 : 2);
};

const scrollToContent = () => {
  document.getElementById('home-body')?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
};

onMounted(() => {
  // Touch devices have no hover cursor: gently rotate the backgrounds instead.
  if (!prefersReducedMotion() && !window.matchMedia('(hover: hover)').matches) {
    autoRotateTimer = window.setInterval(() => {
      switchTo((activeImage.value + 1) % HERO_IMAGES.length);
    }, 7000);
  }
  void runSubtitleLoop();
  void fetchHitokoto().then((quote) => { if (alive) void presentHitokoto(quote); });
});

onBeforeUnmount(() => {
  alive = false;
  if (autoRotateTimer) window.clearInterval(autoRotateTimer);
  window.clearTimeout(leavingTimer);
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

/* Layers are positioned and faded inline so a switch is guaranteed to animate:
   the outgoing image slides left while the incoming one slides in from the
   right, giving a visible overlap for the whole cross-fade. The class rule only
   marks the outgoing layer for debugging and reduced-motion overrides. */
.home-hero__bg-layer {
  position: absolute;
  inset: 0;
  background-position: center;
  background-size: cover;
  will-change: opacity, transform;
  transition: opacity 820ms ease, transform 1150ms cubic-bezier(.3, 0, .2, 1);
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
  animation: hero-tint-drift 18s ease-in-out infinite;
}

@keyframes hero-tint-drift {
  0%, 100% { opacity: .75; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.08); }
}

.home-hero__veil { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(57, 45, 79, .38), rgba(57, 45, 79, .1) 42%, rgba(57, 45, 79, .34)); }
.home-hero__blend { position: absolute; inset: auto 0 0; height: 8.5rem; background: linear-gradient(180deg, rgba(255, 244, 248, 0), rgba(255, 244, 248, .9) 76%, #fff4f8); }
:root.bs-dark .home-hero__blend { background: linear-gradient(180deg, rgba(36, 31, 51, 0), rgba(36, 31, 51, .9) 76%, #241f33); }

.home-hero__content { position: relative; z-index: 1; display: grid; justify-items: center; gap: .45rem; padding: 2rem 1.2rem; color: #fffaf5; text-align: center; }

/* The hero art is a bright anime illustration, so light glyphs on top read as
   indistinct blobs. A dark outline plus a warm tint keeps them legible over any
   region of the photo instead of only the dark parts. */
.home-hero__sparkles {
  margin: 0;
  color: #ffe48a;
  font-size: 1.05rem;
  letter-spacing: .5em;
  opacity: .95;
  text-shadow:
    0 0 2px rgba(57, 45, 79, .95),
    0 0 8px rgba(57, 45, 79, .75),
    0 2px 16px rgba(57, 45, 79, .6);
}

.home-hero__title { margin: 0; font-size: clamp(2.8rem, 9vw, 5.4rem); line-height: 1.05; letter-spacing: .04em; }
/* The name gets an animated gradient so the hero reads as alive even before the
   visitor moves the pointer. */
.home-hero__title-text {
  background: linear-gradient(100deg, #ffe48a, #ff8fb3 28%, #b9a7ff 52%, #9ee6d0 74%, #ffe48a);
  background-size: 260% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 4px 18px rgba(57, 45, 79, .55)) drop-shadow(0 0 2px rgba(255, 250, 245, .5));
  animation: hero-title-flow 9s linear infinite;
}

@keyframes hero-title-flow {
  from { background-position: 0% 50%; }
  to { background-position: 260% 50%; }
}

.home-hero__subtitle { display: flex; align-items: center; min-height: 2.4em; margin: .2rem 0 0; font-size: clamp(1rem, 2.4vw, 1.25rem); line-height: 1.7; text-shadow: 0 2px 16px rgba(57, 45, 79, .55); }
.home-hero__caret { display: inline-block; width: 3px; height: 1.15em; margin-left: .18em; border-radius: 999px; background: #ffe48a; box-shadow: 0 0 10px rgba(255, 228, 138, .85); }
@media (prefers-reduced-motion: no-preference) {
  .home-hero__caret { animation: hero-caret-blink 1.1s ease-in-out infinite; }
}
@keyframes hero-caret-blink { 0%, 100% { opacity: 1; } 50% { opacity: .15; } }

.home-hero__hitokoto { display: flex; align-items: center; gap: .55rem; max-width: 44rem; min-height: 2.6rem; margin: .8rem 0 0; padding: .5rem .6rem .5rem 1.1rem; border: 1px solid rgba(255, 250, 245, .35); border-radius: 1.1rem; background: rgba(57, 45, 79, .3); line-height: 1.75; text-shadow: 0 2px 10px rgba(57, 45, 79, .4); backdrop-filter: blur(8px); opacity: 0; transform: translateY(6px); transition: opacity 420ms ease, transform 420ms ease; }
.home-hero__hitokoto.is-ready { opacity: 1; transform: none; }
.home-hero__hitokoto-text { margin: 0; font-size: .92rem; }
.home-hero__hitokoto-from { opacity: .85; }

.home-hero__hitokoto-refresh { flex: 0 0 auto; display: grid; place-items: center; width: 2rem; height: 2rem; padding: 0; border: 1px solid rgba(255, 250, 245, .3); border-radius: 50%; background: rgba(255, 250, 245, .12); color: #fffaf5; font-size: .95rem; line-height: 1; cursor: pointer; transition: 200ms ease; }
.home-hero__hitokoto-refresh:hover { background: rgba(255, 143, 179, .42); border-color: rgba(255, 250, 245, .6); transform: rotate(180deg); }
.home-hero__hitokoto-refresh:focus-visible { outline: 3px solid rgba(255, 228, 138, .9); outline-offset: 2px; }
.home-hero__hitokoto-refresh.is-busy { opacity: .55; cursor: wait; }
@media (prefers-reduced-motion: no-preference) {
  .home-hero__hitokoto-refresh.is-busy span { animation: hero-refresh-spin 900ms linear infinite; }
}
@keyframes hero-refresh-spin { to { transform: rotate(360deg); } }

.home-hero__scroll { position: absolute; bottom: 1.6rem; left: 50%; z-index: 1; display: grid; place-items: center; width: 2.7rem; height: 2.7rem; padding: 0; border: 1px solid rgba(255, 250, 245, .5); border-radius: 999px; background: rgba(255, 250, 245, .16); color: #fffaf5; font-size: 1.05rem; cursor: pointer; backdrop-filter: blur(8px); transform: translateX(-50%); transition: 200ms ease; }
.home-hero__scroll:hover { background: rgba(255, 143, 179, .38); transform: translateX(-50%) translateY(-3px); }
@media (prefers-reduced-motion: no-preference) {
  .home-hero__scroll span { animation: hero-arrow-bounce 2.2s ease-in-out infinite; }
}
@keyframes hero-arrow-bounce { 0%, 100% { transform: translateY(-2px); } 50% { transform: translateY(3px); } }

@media (max-width: 640px) {
  .home-hero__hitokoto { flex-wrap: wrap; justify-content: center; padding: .5rem .9rem; }
  .home-hero__hitokoto-text { font-size: .85rem; }
}

@media (prefers-reduced-motion: reduce) {
  .home-hero__bg-layer { transition: none; }
  .home-hero__bg-tint { animation: none; }
  .home-hero__title-text { animation: none; }
  .home-hero__hitokoto { transition: none; }
  .home-hero__hitokoto-refresh span { animation: none; }
  .home-hero__caret, .home-hero__scroll span { animation: none; }
}
</style>
