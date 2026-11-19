<template>
  <aside v-if="visible" class="mochi-companion" aria-label="小星星陪伴">
    <button
      class="mochi-companion__orb"
      type="button"
      :aria-expanded="!collapsed"
      :aria-label="collapsed ? '打开小星星的悄悄话' : '收起小星星的悄悄话'"
      @click="toggle"
    >
      <span class="mochi-companion__face" aria-hidden="true">{{ face.eyes }}</span>
      <span class="mochi-companion__mouth" aria-hidden="true">{{ face.mouth }}</span>
      <b class="mochi-companion__spark" aria-hidden="true">✦</b>
      <i class="mochi-companion__blush mochi-companion__blush--left" aria-hidden="true"></i>
      <i class="mochi-companion__blush mochi-companion__blush--right" aria-hidden="true"></i>
      <span v-if="unread" class="mochi-companion__pip" aria-hidden="true"></span>
    </button>

    <!-- No <Transition> here on purpose: Vue keeps a leaving node in the DOM
         until transitionend, and this card is also animated by the global
         reduced-motion rules, which can leave it stuck and expanded. A plain
         v-if with a mount-only animation is deterministic. -->
    <div v-if="!collapsed" class="mochi-companion__card">
      <button class="mochi-companion__close" type="button" aria-label="关闭陪伴提示" @click="dismiss">×</button>
      <small>{{ face.label }}</small>
      <p aria-live="polite">{{ message }}</p>
      <div class="mochi-companion__actions">
        <button class="mochi-companion__refresh" type="button" @click="nextMessage">换一句 ✨</button>
        <button class="mochi-companion__quiet" type="button" @click="collapse">安静一会儿</button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { storage } from '../../utils/storage';

/** Moods are chosen from the clock and the visitor's behaviour, so the
 *  companion reacts to context instead of showing a random line. */
type Mood = 'night' | 'morning' | 'afternoon' | 'lateNight' | 'reading';

interface Face {
  eyes: string;
  mouth: string;
  label: string;
}

const FACES: Record<Mood, Face> = {
  lateNight: { eyes: '– –', mouth: 'ω', label: '夜深了 · 该休息啦' },
  night: { eyes: '˘ ˘', mouth: '‿', label: '晚上好 · 陪你一会儿' },
  morning: { eyes: '> <', mouth: '▽', label: '早安 · 今天也要加油' },
  afternoon: { eyes: '◕ ◕', mouth: '‿', label: '下午好 · 记得休息' },
  reading: { eyes: '◕ ◕', mouth: '·', label: '读到好句子了吗' },
};

const LINES: Record<Mood, string[]> = {
  lateNight: [
    '很晚了，把这篇文章看到这里就够啦。明天再看也不迟。',
    '凌晨的灵感很珍贵，但你的睡眠更珍贵。',
    '夜猫子模式启动——记得把屏幕亮度调低一点。',
  ],
  night: [
    '晚上好呀。泡杯热的东西，慢慢看。',
    '夜晚适合把白天的想法写成文字。',
    '欢迎回来，愿这里给你一点柔软的勇气。',
  ],
  morning: [
    '早安！今天想先从哪一篇开始读呢？',
    '新的一天，慢慢写，写清楚就好。',
    '早上好，先喝口水再开始吧。',
  ],
  afternoon: [
    '下午的光最适合读一点轻松的东西。',
    '把一个小想法写下来，它可能会长成一颗星星。',
    '来看看有没有新的故事吧 ✧',
  ],
  reading: [
    '读到这里，有想记下来的句子吗？',
    '好文章值得慢一点读。',
    '要不要把这一篇分享给某个朋友？',
  ],
};

const visible = ref(false);
const collapsed = ref(false);
const unread = ref(false);
const mood = ref<Mood>('afternoon');
const messageIndex = ref(0);

const face = computed<Face>(() => FACES[mood.value]);
const lines = computed(() => LINES[mood.value]);
const message = computed(() => lines.value[messageIndex.value % lines.value.length]);

const moodFromClock = (): Mood => {
  const hour = new Date().getHours();
  if (hour >= 1 && hour < 6) return 'lateNight';
  if (hour < 12) return 'morning';
  if (hour >= 22) return 'night';
  return 'afternoon';
};

const show = () => {
  visible.value = true;
  unread.value = !collapsed.value;
};
let greetingTimer = 0;

const collapse = () => { collapsed.value = true; unread.value = true; };
const toggle = () => {
  collapsed.value = !collapsed.value;
  unread.value = false;
  // Reading the message counts as engaging: do not fold it away again.
  if (!collapsed.value) window.clearTimeout(greetingTimer);
};
const advance = () => { messageIndex.value += 1; };
const nextMessage = () => {
  advance();
  mood.value = mood.value === 'reading' ? moodFromClock() : mood.value;
};
const dismiss = () => {
  visible.value = false;
  storage.set('mochi-companion-dismissed', '1');
};

/** Deep in an article the companion switches to a quieter reading mood. */
let articleDepthReached = false;
const onScroll = () => {
  if (articleDepthReached) return;
  if (window.scrollY > window.innerHeight * 1.6) {
    articleDepthReached = true;
    mood.value = 'reading';
    messageIndex.value = 0;
    if (collapsed.value) unread.value = true;
  }
};

let idleTimer = 0;
/** Waving at the companion cycles its line; a nudge to interact. */
const onIdle = () => {
  window.clearTimeout(idleTimer);
  idleTimer = window.setTimeout(() => {
    if (!collapsed.value) advance();
  }, 60_000);
};

onMounted(() => {
  if (storage.get('mochi-companion-dismissed') === '1') return;
  mood.value = moodFromClock();
  messageIndex.value = Math.floor(Math.random() * lines.value.length);
  show();
  // Greet, then fold away. An always-open card covers article copy on short
  // viewports, so it retracts into the orb and leaves an unread pip instead.
  greetingTimer = window.setTimeout(() => {
    if (!collapsed.value) collapse();
  }, 9000);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('pointermove', onIdle, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('pointermove', onIdle);
  window.clearTimeout(idleTimer);
  window.clearTimeout(greetingTimer);
});
</script>

<style scoped>
.mochi-companion { position: fixed; right: clamp(1rem, 3vw, 3rem); bottom: clamp(1rem, 4vw, 3rem); z-index: 40; display: flex; align-items: flex-end; gap: .65rem; pointer-events: none; }
.mochi-companion__orb, .mochi-companion__card, .mochi-companion__close, .mochi-companion__refresh, .mochi-companion__quiet { pointer-events: auto; }

.mochi-companion__orb {
  position: relative;
  width: 3.8rem;
  height: 3.8rem;
  border: 1px solid var(--bs-hairline, rgba(255, 255, 255, .75));
  /* Squircle-ish blob so it reads as a mochi, not a button. */
  border-radius: 46% 54% 52% 48%;
  background: linear-gradient(145deg, var(--bs-yellow, #ffe48a), var(--bs-pink, #ffb6c8) 56%, var(--bs-lilac, #b9a7ff));
  box-shadow: 0 14px 35px rgba(95, 66, 118, .2), inset -8px -8px 18px rgba(255, 143, 179, .18);
  color: #4b3d60;
  cursor: pointer;
  transform: rotate(-8deg);
  animation: mochi-float 4.6s ease-in-out infinite;
  transition: transform 240ms cubic-bezier(.2, .9, .3, 1.3);
}
.mochi-companion__orb:hover { transform: rotate(4deg) scale(1.06); }
.mochi-companion__orb:focus-visible { outline: 3px solid rgba(185, 167, 255, .8); outline-offset: 4px; }

.mochi-companion__face { position: absolute; top: 1.15rem; left: 0; right: 0; font-size: .82rem; font-weight: 700; letter-spacing: .06em; line-height: 1; }
.mochi-companion__mouth { position: absolute; top: 1.85rem; left: 0; right: 0; font-size: .95rem; font-weight: 700; line-height: 1; }
.mochi-companion__spark { position: absolute; top: -.5rem; right: -.3rem; color: #fff; font-size: 1rem; text-shadow: 0 1px 4px rgba(57, 45, 79, .35); }
.mochi-companion__blush { position: absolute; top: 1.7rem; width: .5rem; height: .28rem; border-radius: 50%; background: rgba(255, 143, 179, .55); filter: blur(1px); }
.mochi-companion__blush--left { left: .62rem; }
.mochi-companion__blush--right { right: .62rem; }

.mochi-companion__pip { position: absolute; top: .1rem; left: .1rem; width: .6rem; height: .6rem; border: 2px solid var(--bs-paper, #fffaf5); border-radius: 50%; background: var(--bs-pink, #ff8fb3); animation: mochi-pip 1.9s ease-in-out infinite; }

.mochi-companion__card { position: relative; width: min(17rem, calc(100vw - 6rem)); padding: 1rem 1.1rem .85rem; border: 1px solid var(--bs-hairline, rgba(255, 255, 255, .72)); border-radius: 1.25rem 1.25rem 1.25rem .35rem; background: var(--bs-paper-strong, rgba(255, 250, 245, .84)); box-shadow: 0 18px 45px rgba(95, 66, 118, .16); backdrop-filter: blur(16px) saturate(1.1); animation: mochi-card-in 300ms cubic-bezier(.2, .8, .2, 1); }
.mochi-companion__close { position: absolute; top: .2rem; right: .3rem; display: grid; place-items: center; width: 2.2rem; height: 2.2rem; padding: 0; border: 0; border-radius: 50%; background: transparent; color: var(--bs-ink-soft, #9485a3); font-size: 1.15rem; line-height: 1; cursor: pointer; transition: 180ms ease; }
.mochi-companion__close:hover { color: var(--bs-ink, #392d4f); background: rgba(255, 143, 179, .16); transform: rotate(90deg); }
.mochi-companion__card small { color: #b1768c; letter-spacing: .08em; }
:root.bs-dark .mochi-companion__card small { color: var(--bs-pink); }
.mochi-companion__card p { margin: .35rem 0 0; color: var(--bs-ink, #4b3d60); font-size: .9rem; line-height: 1.65; }
.mochi-companion__actions { display: flex; flex-wrap: wrap; gap: .4rem; margin-top: .55rem; }
/* Padding rather than bare text so the tap target clears the 44px comfort
   floor on touch devices, where a 19px-tall label is frustrating to hit. */
.mochi-companion__refresh, .mochi-companion__quiet { display: inline-flex; align-items: center; min-height: 2.75rem; padding: .3rem .7rem; border: 1px solid transparent; border-radius: 999px; background: transparent; font-family: inherit; font-size: .82rem; cursor: pointer; transition: 180ms ease; }
.mochi-companion__refresh { color: #8b73c5; }
.mochi-companion__quiet { color: var(--bs-ink-soft, #9485a3); }
.mochi-companion__refresh:hover, .mochi-companion__quiet:hover { background: var(--bs-surface-soft, rgba(255, 255, 255, .5)); border-color: var(--bs-hairline, rgba(255, 255, 255, .72)); }
.mochi-companion__refresh:focus-visible, .mochi-companion__quiet:focus-visible, .mochi-companion__close:focus-visible { outline: 3px solid rgba(185, 167, 255, .8); outline-offset: 2px; }

@keyframes mochi-card-in { from { opacity: 0; transform: translateY(.5rem) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }

@keyframes mochi-float { 0%, 100% { transform: translateY(0) rotate(-8deg); } 50% { transform: translateY(-.4rem) rotate(5deg); } }
@keyframes mochi-pip { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.25); opacity: .75; } }

@media (max-width: 640px) {
  .mochi-companion { right: .75rem; bottom: .75rem; }
  .mochi-companion__card { width: min(15rem, calc(100vw - 5.5rem)); }
}
@media (prefers-reduced-motion: reduce) {
  .mochi-companion__orb, .mochi-companion__pip, .mochi-companion__card { animation: none; }
}
</style>
