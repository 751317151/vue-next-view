<template>
  <ClientOnly>
    <div v-if="preferred && messages.length" class="danmaku-layer" aria-hidden="true">
      <div class="danmaku-layer__stage" :class="{ 'is-paused': paused }">
        <div
          v-for="flight in flights"
          :key="flight.key"
          class="danmaku-track"
          :style="{
            top: `${flight.top}px`,
            '--flight-duration': `${flight.duration}ms`,
            '--flight-tilt': `${flight.tilt}deg`,
          }"
          @pointermove="syncHoveredFlight"
          @pointerleave="clearHoveredFlight"
        >
          <span
            :data-flight-key="flight.key"
            class="danmaku-fly"
            :class="{ 'is-paused': pausedFlight === flight.key }"
            @animationend="removeFlight(flight.key)"
            @pointerenter="holdPause(flight)"
            @pointerleave="releasePause(flight.key)"
          >
            <span class="danmaku-pill" :style="{ background: flight.tint }">
              <span class="danmaku-pill__face">{{ flight.emoji }}</span>
              <span class="danmaku-pill__text">{{ flight.text }}</span>
              <span class="danmaku-pill__name">{{ flight.name }}</span>
            </span>
          </span>
        </div>
      </div>
      <Transition name="danmaku-tip">
        <p v-if="pausedFlight !== null" class="danmaku-layer__tip">❚❚ 这条暂停啦 · 移开就继续</p>
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
 *  3. 悬停某条弹幕时只停住这一条，移开后它接着走。
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
  lane: number;
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
/** 只暂停指针下的这一条，不让整面弹幕墙停下。 */
const pausedFlight = ref<number | null>(null);
/**
 * pointerenter 在弹幕动画移动时不一定可靠：弹幕可能先滑到指针下面，
 * 而指针本身没有移动。pointermove 能捕捉这种“主动穿过指针”的情况，
 * 并让暂停目标始终跟着当前指针真正悬停的那一条。
 */
const hoveredFlight = ref<number | null>(null);

let cursor = 0;
let sequence = 0;
let timer = 0;
let laneFreeAt: number[] = [];
let laneTop: number[] = [];
let pauseStarted = 0;
let resumeTimer = 0;
let pausedLane = -1;
let pausedLaneRemaining = 0;
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

const viewportHeight = ref(800);

const buildLanes = () => {
  const height = viewportHeight.value;
  const lanes = Math.max(2, Math.floor((height - TOP_OFFSET - BOTTOM_INSET) / LANE_HEIGHT));
  laneTop = Array.from({ length: lanes }, (_, index) => TOP_OFFSET + index * LANE_HEIGHT);
  laneFreeAt = Array.from({ length: lanes }, () => 0);
};

/**
 * 少量留言时，只启用与留言数相称的轨道，并让它们均匀铺开：
 * 三条留言不该全挤在屏幕顶部，也不该在中间留出一大片空墙。
 */
const laneCount = computed(() => {
  const total = Math.min(pool.value.length, Math.min(8, Math.max(2, Math.floor(viewportHeight.value / 130))));
  return Math.max(1, total);
});

const speedOf = () => (window.innerWidth < 1100 ? 68 : 82);

const pickLane = (now: number) => {
  const usable = Math.min(laneFreeAt.length, Math.max(1, laneCount.value));
  const offset = Math.floor(Math.random() * usable);
  for (let step = 0; step < usable; step += 1) {
    const index = (offset + step) % usable;
    if ((laneFreeAt[index] ?? 0) <= now) return index;
  }
  return -1;
};

const topFor = (lane: number) => {
  if (laneFreeAt.length <= 1) return laneTop[lane] ?? TOP_OFFSET;
  // 留言少时把启用的轨道摊到整个可用高度，而不是全堆在顶部。
  const usable = Math.min(laneFreeAt.length, Math.max(1, laneCount.value));
  if (usable >= laneFreeAt.length) return laneTop[lane] ?? TOP_OFFSET;
  const available = laneTop[laneFreeAt.length - 1]! - laneTop[0]!;
  return laneTop[0]! + (available * lane) / Math.max(1, usable - 1);
};

const launch = () => {
  if (!preferred.value || paused.value || !pool.value.length) return;
  // 留言少时不要靠循环把同几句话刷满屏；同屏最多保留与留言数相同的条数。
  if (flights.value.length >= Math.min(pool.value.length, 6)) return;
  const now = performance.now();
  const lane = pickLane(now);
  // 所有轨道都还在放行等待，就跳过这一拍；绝不硬塞造成重叠。
  if (lane < 0) return;
  const message = nextMessage();
  const width = estimateWidth(message.text, message.name);
  const speed = speedOf();
  // 进入视口所需的净空时间 + 两段文字之间留出的呼吸距离。
  laneFreeAt[lane] = now + ((width + LANE_GAP) / speed) * 1000;
  // 弹幕从 right:0 完全越过左边缘后，留下恰好一屏宽的尾巴才算离场；
  // 把整段飞行设成「视口 + 自身宽度」，才是真正从最右侧出现、从最左侧离开。
  flights.value.push({
    key: sequence++,
    lane,
    ...message,
    top: topFor(lane),
    duration: Math.round(((window.innerWidth + width) / speed) * 1000),
    tilt: Number((Math.random() * 2.4 - 1.2).toFixed(2)),
  });
};

const removeFlight = (key: number) => {
  if (pausedFlight.value === key) {
    // 被强制移除（例如新留言刷新了池子）时，轨道也必须放行，不能留下 Infinity。
    if (pausedLane >= 0) laneFreeAt[pausedLane] = performance.now();
    pausedFlight.value = null;
    pausedLane = -1;
    pausedLaneRemaining = 0;
  }
  flights.value = flights.value.filter((flight) => flight.key !== key);
};

const holdPause = (flight: Flight) => {
  window.clearTimeout(resumeTimer);
  // 已经在暂停这一条时又收到 enter（例如移出后 160ms 内移回）：
  // 不要重新读取 laneFreeAt，它此刻是 Infinity，会把剩余时间污染成 Infinity。
  if (pausedFlight.value === flight.key) return;
  // 从一条直接移到另一条：先把上一条的轨道放行，再暂停新的这条。
  if (pausedFlight.value !== null && pausedFlight.value !== flight.key) {
    if (pausedLane >= 0) laneFreeAt[pausedLane] = performance.now() + pausedLaneRemaining;
    pausedLane = -1;
    pausedLaneRemaining = 0;
  }
  pauseStarted = performance.now();
  pausedLane = flight.lane;
  // 这条停在原地时，它占用的轨道不能放行下一条。
  pausedLaneRemaining = Math.max(0, (laneFreeAt[flight.lane] ?? 0) - pauseStarted);
  laneFreeAt[flight.lane] = Number.POSITIVE_INFINITY;
  pausedFlight.value = flight.key;
};

const releasePause = (key: number) => {
  // 从一条弹幕移到另一条时 pointerleave/enter 会连续触发，留一点缓冲。
  window.clearTimeout(resumeTimer);
  resumeTimer = window.setTimeout(() => {
    if (pausedFlight.value !== key) return;
    if (pausedLane >= 0) laneFreeAt[pausedLane] = performance.now() + pausedLaneRemaining;
    pausedFlight.value = null;
    pausedLane = -1;
    pausedLaneRemaining = 0;
  }, 160);
};

const syncHoveredFlight = (event: PointerEvent) => {
  const track = event.currentTarget;
  if (!(track instanceof HTMLElement)) return;
  const pill = track.querySelector<HTMLElement>('.danmaku-pill');
  const flightElement = track.querySelector<HTMLElement>('.danmaku-fly');
  if (!pill || !flightElement) return;

  // 轨道贯穿整屏；指针只有落在这条弹幕真正占据的矩形上时，才暂停它。
  const rect = pill.getBoundingClientRect();
  const overText = event.clientX >= rect.left
    && event.clientX <= rect.right
    && event.clientY >= rect.top
    && event.clientY <= rect.bottom;
  const key = Number(flightElement.dataset.flightKey);
  const next = overText && Number.isInteger(key) ? key : null;
  if (hoveredFlight.value === next) return;
  applyHoveredFlight(next);
};

const clearHoveredFlight = () => {
  applyHoveredFlight(null);
};

const applyHoveredFlight = (key: number | null) => {
  if (hoveredFlight.value === key) return;
  hoveredFlight.value = key;
  if (key === null) {
    if (pausedFlight.value !== null) releasePause(pausedFlight.value);
    return;
  }
  const flight = flights.value.find((entry) => entry.key === key);
  if (flight) holdPause(flight);
};

const syncFlights = () => {
  const key = pool.value.map((item) => item.id).join('|');
  if (key === lastMessagesKey) return;
  lastMessagesKey = key;
  cursor = 0;
  recentTexts = [];
  if (!key) {
    flights.value = [];
    if (pausedLane >= 0) laneFreeAt[pausedLane] = performance.now();
    pausedFlight.value = null;
    pausedLane = -1;
    pausedLaneRemaining = 0;
    hoveredFlight.value = null;
    return;
  }
  // 新留言出现时先放一条，不必等下一个节拍。
  launch();
};

const onVisibility = () => {
  if (document.hidden) {
    paused.value = true;
  } else {
    paused.value = false;
  }
};

const onResize = () => {
  viewportHeight.value = window.innerHeight;
  buildLanes();
  flights.value = flights.value.filter((flight) => flight.top < window.innerHeight - BOTTOM_INSET);
};

onMounted(() => {
  viewportHeight.value = window.innerHeight;
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

/*
 * 每条弹幕各占一条贯穿屏幕的透明轨道。用整屏宽度承载动画，不会因为
 * 弹幕自身较窄而在右侧提前出现；同时轨道可以持续接收 pointermove，
 * 分辨当前指针真正落在哪一条文字上。
 */
.danmaku-track {
  position: absolute;
  left: 0;
  width: 100vw;
  height: 2.5rem;
  /*
   * 轨道只是用于接收弹幕冒泡上来的指针事件，本身必须透明可穿透；
   * 否则整条横带会挡住下面的留言表单和按钮。
   */
  pointer-events: none;
}

/* 弹幕从轨道最右侧之外出发，完整滑过整屏。 */
.danmaku-fly {
  position: absolute;
  left: 100%;
  display: block;
  width: max-content;
  animation: danmaku-fly var(--flight-duration) linear forwards;
  will-change: transform;
  pointer-events: auto;
}

.danmaku-layer__stage.is-paused .danmaku-fly {
  animation-play-state: paused;
}

/* 悬停只停住指针下的这一条，其它弹幕照常飘过。 */
.danmaku-fly.is-paused {
  z-index: 2;
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
