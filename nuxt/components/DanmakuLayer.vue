<template>
  <ClientOnly>
    <div v-if="preferred && messages.length" class="danmaku-layer" aria-hidden="true">
      <div class="danmaku-layer__stage" :class="{ 'is-paused': paused }">
        <span
          v-for="flight in flights"
          :key="flight.key"
          class="danmaku-fly"
          :style="{
            top: `${flight.top}px`,
            '--flight-duration': `${flight.duration}ms`,
            '--flight-tilt': `${flight.tilt}deg`,
          }"
          @animationend="removeFlight(flight.key)"
          @pointerenter="holdPause"
          @pointerleave="releasePause"
        >
          <span class="danmaku-pill" :style="{ background: flight.tint }">
            <span class="danmaku-pill__face">{{ flight.emoji }}</span>
            <span class="danmaku-pill__text">{{ flight.text }}</span>
            <span class="danmaku-pill__name">{{ flight.name }}</span>
          </span>
        </span>
      </div>
      <Transition name="danmaku-tip">
        <p v-if="paused && manualPause" class="danmaku-layer__tip">❚❚ 弹幕暂停啦 · 移开就继续</p>
      </Transition>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { GuestMessage } from '../composables/useMessageBoard';
import { prefersReducedMotion } from '../utils/motion';

const props = withDefaults(defineProps<{ messages: GuestMessage[]; maxItems?: number }>(), {
  maxItems: 40,
});

const { danmakuEnabled } = useAppearance();
const preferred = computed(() => danmakuEnabled.value && !prefersReducedMotion());

/**
 * 旧版是一条从右边缘完整滑入、再完整滑出的轨道。
 * 这里自己排轨道，而不是把随机通道交给第三方库：
 *  1. 每条弹幕的起点严格在视口右侧之外，不会"半路冒出来"；
 *  2. 同一轨道的下一条要等上一条的尾巴离开入口，少量弹幕也不会叠在一起；
 *  3. 悬停任意弹幕时整层暂停，移开后接着走。
 */
const TINTS = [
  'linear-gradient(135deg, rgba(255, 133, 170, .94), rgba(255, 186, 140, .9))',
  'linear-gradient(135deg, rgba(158, 143, 241, .92), rgba(142, 216, 198, .88))',
  'linear-gradient(135deg, rgba(130, 204, 184, .94), rgba(255, 214, 128, .9))',
  'linear-gradient(135deg, rgba(255, 203, 118, .94), rgba(255, 150, 174, .88))',
  'linear-gradient(135deg, rgba(255, 178, 138, .92), rgba(176, 158, 240, .9))',
];

const tintFor = (seed: string) => {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return TINTS[hash % TINTS.length]!;
};

const pool = computed(() =>
  props.messages.slice(0, props.maxItems).map((message) => ({
    id: message.id,
    text: message.text.replace(/\s+/g, ' ').slice(0, 60),
    name: message.name,
    emoji: message.emoji,
    tint: tintFor(message.id),
  })),
);

interface Flight {
  key: number;
  text: string;
  name: string;
  emoji: string;
  tint: string;
  top: number;
  duration: number;
  tilt: number;
}

const flights = ref<Flight[]>([]);
const paused = ref(false);
const manualPause = ref(false);

let cursor = 0;
let sequence = 0;
let timer = 0;
let laneFreeAt: number[] = [];
let laneTop: number[] = [];
let pauseStarted = 0;
let resumeTimer = 0;
let lastMessagesKey = '';
let recentTexts: string[] = [];

const LANE_HEIGHT = 46;
const LANE_GAP = 56;
const TOP_OFFSET = 92;
const BOTTOM_INSET = 80;

/**
 * 估算弹幕宽度：真实 DOM 测量需要先挂载、再下一帧读取，
 * 会让轨道判定慢一拍。按字符数估算足够保守，宁可多留空隙。
 */
const estimateWidth = (text: string, name: string) => {
  let units = 0;
  for (const char of text) units += /[\u3000-\u9fff\uff00-\uffef]/.test(char) ? 14 : 8;
  return Math.min(352, 74 + units + Math.min(90, name.length * 12));
};

/**
 * 同一批弹幕里，文字尽量不重复。留言很少时重复会让画面显得像卡带。
 * 记住刚抛出的四条，而不是只看当前在飞的几条——旧弹幕离开视口后，
 * 新一轮仍会避开它们，直到把池子转过一圈。
 */
const nextMessage = () => {
  const list = pool.value;
  for (let attempt = 0; attempt < list.length; attempt += 1) {
    const candidate = list[cursor % list.length]!;
    cursor += 1;
    if (!recentTexts.includes(candidate.text)) {
      recentTexts = [...recentTexts, candidate.text].slice(-Math.min(8, Math.max(1, list.length - 1)));
      return candidate;
    }
  }
  const fallback = list[cursor % list.length]!;
  cursor += 1;
  recentTexts = [...recentTexts.slice(1), fallback.text];
  return fallback;
};

const buildLanes = () => {
  const height = window.innerHeight;
  const lanes = Math.max(3, Math.floor((height - TOP_OFFSET - BOTTOM_INSET) / LANE_HEIGHT));
  laneTop = Array.from({ length: lanes }, (_, index) => TOP_OFFSET + index * LANE_HEIGHT);
  laneFreeAt = Array.from({ length: lanes }, () => 0);
};

const speedOf = () => (window.innerWidth < 1100 ? 68 : 82);

const pickLane = (now: number) => {
  const offset = Math.floor(Math.random() * laneFreeAt.length);
  for (let step = 0; step < laneFreeAt.length; step += 1) {
    const index = (offset + step) % laneFreeAt.length;
    if ((laneFreeAt[index] ?? 0) <= now) return index;
  }
  return -1;
};

const launch = () => {
  if (!preferred.value || paused.value || !pool.value.length) return;
  // 留言少时不要靠循环把同几句话刷满屏；同屏最多保留与留言数相同的条数。
  if (flights.value.length >= Math.min(pool.value.length, 8)) return;
  const now = performance.now();
  const lane = pickLane(now);
  // 所有轨道都还在放行等待，就跳过这一拍；绝不硬塞造成重叠。
  if (lane < 0) return;
  const message = nextMessage();
  const width = estimateWidth(message.text, message.name);
  const speed = speedOf();
  // 进入视口所需的净空时间 + 两段文字之间留出的呼吸距离。
  laneFreeAt[lane] = now + ((width + LANE_GAP) / speed) * 1000;
  flights.value.push({
    key: sequence++,
    ...message,
    top: laneTop[lane] ?? TOP_OFFSET,
    duration: Math.round(((window.innerWidth + width) / speed) * 1000),
    tilt: Number((Math.random() * 2.4 - 1.2).toFixed(2)),
  });
};

const removeFlight = (key: number) => {
  flights.value = flights.value.filter((flight) => flight.key !== key);
};

const holdPause = () => {
  window.clearTimeout(resumeTimer);
  if (paused.value) return;
  pauseStarted = performance.now();
  manualPause.value = true;
  paused.value = true;
};

const releasePause = () => {
  // 在相邻弹幕之间移动时 pointerleave/enter 会连续触发，留一点缓冲。
  window.clearTimeout(resumeTimer);
  resumeTimer = window.setTimeout(() => {
    if (!manualPause.value || document.hidden) return;
    const pausedFor = performance.now() - pauseStarted;
    laneFreeAt = laneFreeAt.map((time) => time + pausedFor);
    manualPause.value = false;
    paused.value = false;
  }, 160);
};

const syncFlights = () => {
  const key = pool.value.map((item) => item.id).join('|');
  if (key === lastMessagesKey) return;
  lastMessagesKey = key;
  cursor = 0;
  recentTexts = [];
  if (!key) {
    flights.value = [];
    return;
  }
  // 新留言出现时先放一条，不必等下一个节拍。
  launch();
};

const onVisibility = () => {
  if (document.hidden) {
    if (!paused.value) {
      pauseStarted = performance.now();
      paused.value = true;
    }
  } else if (!manualPause.value) {
    const pausedFor = performance.now() - pauseStarted;
    laneFreeAt = laneFreeAt.map((time) => time + pausedFor);
    paused.value = false;
  }
};

const onResize = () => {
  buildLanes();
  flights.value = flights.value.filter((flight) => flight.top < window.innerHeight - BOTTOM_INSET);
};

onMounted(() => {
  buildLanes();
  syncFlights();
  timer = window.setInterval(() => {
    launch();
    syncFlights();
  }, 1450);
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('resize', onResize, { passive: true });
});

onBeforeUnmount(() => {
  window.clearInterval(timer);
  window.clearTimeout(resumeTimer);
  document.removeEventListener('visibilitychange', onVisibility);
  window.removeEventListener('resize', onResize);
});

watch(pool, syncFlights);
</script>

<style scoped>
.danmaku-layer {
  position: fixed;
  inset: 0;
  z-index: 4;
  overflow: hidden;
  pointer-events: none;
}

.danmaku-layer__stage {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

/* 每条弹幕的 left 是 100%：从容器右侧之外出发，完整滑过整屏。 */
.danmaku-fly {
  position: absolute;
  left: 100%;
  display: block;
  width: max-content;
  animation: danmaku-fly var(--flight-duration) linear forwards;
  will-change: transform;
}

.danmaku-layer__stage.is-paused .danmaku-fly {
  animation-play-state: paused;
}

@keyframes danmaku-fly {
  from { transform: translateX(0) rotate(var(--flight-tilt)); }
  to { transform: translateX(calc(-100vw - 100% - 2rem)) rotate(var(--flight-tilt)); }
}

.danmaku-pill {
  display: inline-flex;
  align-items: center;
  gap: .42rem;
  max-width: min(22rem, 70vw);
  padding: .32rem .78rem .32rem .36rem;
  border: 1px solid rgba(255, 255, 255, .5);
  border-radius: 999px;
  box-shadow:
    0 7px 18px rgba(57, 45, 79, .24),
    inset 0 1px 0 rgba(255, 255, 255, .4);
  color: #fffaf5;
  font-size: .84rem;
  line-height: 1.35;
  pointer-events: auto;
  cursor: default;
  transition: transform var(--bs-dur-quick) var(--bs-ease-pop), box-shadow var(--bs-dur-quick) ease;
}

.danmaku-pill:hover {
  transform: scale(1.045);
  box-shadow:
    0 10px 26px rgba(57, 45, 79, .32),
    inset 0 1px 0 rgba(255, 255, 255, .5);
}

.danmaku-pill__face {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  width: 1.55rem;
  height: 1.55rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, .8);
  box-shadow: 0 1px 4px rgba(57, 45, 79, .16);
  font-size: .82rem;
}

.danmaku-pill__text {
  overflow: hidden;
  font-weight: 500;
  text-overflow: ellipsis;
  text-shadow: 0 1px 2px rgba(57, 45, 79, .26);
  white-space: nowrap;
}

.danmaku-pill__name {
  flex: 0 0 auto;
  padding-left: .4rem;
  border-left: 1px solid rgba(255, 255, 255, .36);
  color: rgba(255, 250, 245, .8);
  font-size: .7rem;
}

.danmaku-layer__tip {
  position: fixed;
  top: 5.4rem;
  right: clamp(1rem, 4vw, 4rem);
  margin: 0;
  padding: .36rem .75rem;
  border: 1px solid rgba(255, 255, 255, .55);
  border-radius: 999px;
  background: rgba(57, 45, 79, .74);
  color: #fffaf5;
  font-size: .72rem;
  letter-spacing: .04em;
  pointer-events: none;
  backdrop-filter: blur(8px);
}

.danmaku-tip-enter-active,
.danmaku-tip-leave-active { transition: opacity var(--bs-dur-quick) ease, transform var(--bs-dur-quick) var(--bs-ease-pop); }
.danmaku-tip-enter-from,
.danmaku-tip-leave-to { opacity: 0; transform: translateY(-4px); }

@media (max-width: 700px) {
  .danmaku-layer { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .danmaku-layer { display: none; }
}
</style>
