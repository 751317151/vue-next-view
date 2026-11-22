<template>
  <section class="constellation" aria-labelledby="constellation-title">
    <header class="constellation__head">
      <div>
        <h2 id="constellation-title">阅读星座</h2>
        <p class="constellation__sub">{{ subtitle }}</p>
      </div>
      <p v-if="items.length" class="constellation__tally">
        <b>{{ items.length }}</b> 颗星 · {{ clusters.length }} 个星座
      </p>
    </header>

    <div
      class="constellation__sky"
      :class="{ 'is-filtering': activeCategory, 'is-empty': !items.length }"
      @pointerleave="releaseCategory($event)"
    >
      <span class="constellation__moon" aria-hidden="true"></span>
      <span class="constellation__dust" aria-hidden="true"></span>
      <span class="constellation__orbit" aria-hidden="true"></span>

      <svg
        v-if="items.length"
        class="constellation__lines"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          v-for="(cluster, index) in clusters"
          :key="cluster.key"
          :d="cluster.path"
          pathLength="1"
          class="constellation__line"
          :class="{ 'is-active': activeCategory === cluster.key }"
          :style="{ '--line-color': cluster.color, '--line-delay': `${index * 90}ms` }"
        />
      </svg>

      <template v-if="items.length">
        <NuxtLink
          v-for="star in stars"
          :key="star.slug"
          :to="`/article/${encodeURIComponent(star.slug)}`"
          class="constellation__star"
          :class="{
            'is-finished': star.finished,
            'is-active': activeCategory === star.category,
            'is-low': star.y < 32,
          }"
          :style="{
            left: `${star.x}%`,
            top: `${star.y}%`,
            '--star-size': `${star.size}rem`,
            '--star-color': star.color,
          }"
          :aria-label="`《${star.title}》，${star.category}，读到 ${star.percent}%`"
          @pointerenter="activeCategory = star.category"
          @focus="activeCategory = star.category"
          @blur="releaseCategory($event)"
        >
          <span class="constellation__halo" aria-hidden="true"></span>
          <span class="constellation__core" aria-hidden="true"></span>
          <span class="constellation__label" aria-hidden="true">
            <strong>{{ star.title }}</strong>
            <small>{{ star.category }} · 读到 {{ star.percent }}%</small>
          </span>
        </NuxtLink>
      </template>

      <p v-else class="constellation__empty">
        夜空还暗着。读过几篇文章，这里就会长出只属于你的星座。
      </p>
    </div>

    <footer v-if="items.length" class="constellation__foot">
      <ul class="constellation__legend" aria-label="星座分类">
        <li
          v-for="cluster in clusters"
          :key="cluster.key"
          :style="{ '--dot': cluster.color }"
          @pointerenter="activeCategory = cluster.key"
          @pointerleave="activeCategory = ''"
        >
          <i aria-hidden="true"></i>{{ cluster.label }}<b>{{ cluster.stars.length }}</b>
        </li>
      </ul>
      <p class="constellation__hint">点一颗星，回到那篇文章 ✦</p>
    </footer>
  </section>
</template>

<script setup lang="ts">
import type { ReadingTrailItem } from '../composables/useReadingTrail';

const props = defineProps<{ items: ReadingTrailItem[] }>();

/**
 * 星座的坐标必须由 slug 稳定推导，不能使用随机数或当前时间：
 * 服务端预渲染和客户端水合必须得到同一片星空，否则整块会闪烁重排。
 */
const PALETTE = ['#ffd98a', '#ffa8c5', '#b9a7ff', '#9ee6d0', '#ffbd8a', '#a8c8ff'];

const fingerprint = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

/** mulberry32：同一颗种子永远给出同一串 [0,1) 数字。 */
const seeded = (seed: number) => {
  let state = seed || 1;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const percentOf = (progress: number) => Math.min(100, Math.max(1, Math.round(progress * 100)));

const groups = computed(() => {
  const map = new Map<string, ReadingTrailItem[]>();
  for (const item of props.items) {
    const key = item.category || '随笔';
    const bucket = map.get(key);
    if (bucket) bucket.push(item);
    else map.set(key, [item]);
  }
  // 星星多的分类先摆，星座之间的疏密才不会被阅读顺序左右。
  return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
});

const centersFor = (count: number) => {
  if (count <= 1) return [{ x: 50, y: 52 }];
  if (count === 2) return [{ x: 33, y: 52 }, { x: 67, y: 52 }];
  return Array.from({ length: count }, (_, index) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    return { x: 50 + Math.cos(angle) * 27, y: 52 + Math.sin(angle) * 25 };
  });
};

interface ClusterStar {
  slug: string;
  title: string;
  category: string;
  percent: number;
  finished: boolean;
  x: number;
  y: number;
  size: string;
  color: string;
}

const clusters = computed(() => {
  const centers = centersFor(groups.value.length);
  return groups.value.map(([label, group], index) => {
    const color = PALETTE[index % PALETTE.length]!;
    const center = centers[index]!;
    const random = seeded(fingerprint(label));
    const ordered = [...group].sort((a, b) => a.at - b.at);
    const radius = Math.min(13, 4.5 + ordered.length * 1.15);
    const stars: ClusterStar[] = ordered.map((item, starIndex) => {
      // 黄金角螺旋：不论几颗星，都不会挤在同一个点上。
      const angle = starIndex * 2.399 + random() * 0.7;
      const spread = radius * Math.sqrt((starIndex + 0.65) / ordered.length);
      const x = Math.min(94, Math.max(6, center.x + Math.cos(angle) * spread * 1.35));
      const y = Math.min(90, Math.max(10, center.y + Math.sin(angle) * spread * 0.82));
      return {
        slug: item.slug,
        title: item.title,
        category: label,
        percent: percentOf(item.progress),
        finished: item.progress >= 0.995,
        x,
        y,
        size: (0.86 + Math.min(1, item.progress) * 0.8).toFixed(2),
        color,
      };
    });
    const path = stars
      .map((star, starIndex) => `${starIndex === 0 ? 'M' : 'L'}${star.x.toFixed(2)} ${star.y.toFixed(2)}`)
      .join(' ');
    return { key: label, label, color, stars, path };
  });
});

const stars = computed(() => clusters.value.flatMap((cluster) => cluster.stars));

const subtitle = computed(() => {
  if (!props.items.length) return '读过的每一篇，都会在夜空里点亮一颗星。';
  const finished = props.items.filter((item) => item.progress >= 0.995).length;
  if (finished === props.items.length) return '你把这一整片夜空都读完了，真了不起。';
  return `按分类聚成星座，按阅读顺序连成星轨；已读完 ${finished} 篇。`;
});

const activeCategory = ref('');

const releaseCategory = (event: PointerEvent | FocusEvent) => {
  // 指针/焦点移到同一片星空里的另一颗星时，relatedTarget 仍是星空内部，
  // 交给新星自己的 enter 事件接管；只有真正离开才熄灭高亮。
  const next = event.relatedTarget;
  if (next instanceof Element && next.closest('.constellation__sky')) return;
  activeCategory.value = '';
};
</script>

<style scoped>
.constellation { position: relative; padding: 1.05rem 1.1rem 1rem; border: 1px solid var(--bs-border-accent); border-radius: 1.4rem; background: var(--bs-paper-strong); box-shadow: var(--bs-shadow-soft); }
.constellation__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: .4rem 1rem; }
.constellation__head h2 { margin: .2rem 0 0; color: var(--bs-ink); font-size: 1.05rem; letter-spacing: .04em; }
.constellation__sub { margin: .3rem 0 0; color: var(--bs-ink-muted); font-size: .76rem; line-height: 1.7; }
.constellation__tally { margin: 0; color: var(--bs-ink-soft); font-size: .74rem; }
.constellation__tally b { color: var(--bs-accent-strong); font-size: 1rem; }

/* 夜空：深靛蓝底 + 两团星云光，靠边角圆角把"窗口"的感觉做出来。 */
.constellation__sky {
  position: relative;
  display: block;
  aspect-ratio: 16 / 7.4;
  min-height: 13rem;
  margin: .85rem 0 0;
  overflow: hidden;
  border: 1px solid rgba(185, 167, 255, .3);
  border-radius: 1.1rem;
  background:
    radial-gradient(circle at 18% 22%, rgba(185, 167, 255, .3), transparent 45%),
    radial-gradient(circle at 82% 74%, rgba(255, 143, 179, .24), transparent 48%),
    linear-gradient(160deg, #1b1733 0%, #221b3d 52%, #191428 100%);
  isolation: isolate;
}

.constellation__moon { position: absolute; top: 12%; right: 8%; width: 2.6rem; height: 2.6rem; border-radius: 50%; background: radial-gradient(circle at 34% 32%, #fff8e2, #ffe48a 58%, rgba(255, 228, 138, .16) 72%); box-shadow: 0 0 26px rgba(255, 228, 138, .45); opacity: .9; }
.constellation__moon::after { position: absolute; inset: 0; border-radius: inherit; background: radial-gradient(circle at 68% 68%, rgba(57, 45, 79, .16), transparent 52%); content: ''; }

.constellation__dust { position: absolute; inset: 0; background-image: radial-gradient(rgba(255, 250, 245, .8) 1px, transparent 1px), radial-gradient(rgba(185, 167, 255, .55) 1px, transparent 1px); background-position: 0 0, 1.4rem 1.9rem; background-size: 3.1rem 3.1rem, 4.7rem 4.7rem; opacity: .3; animation: constellation-drift 26s linear infinite; }

.constellation__orbit { position: absolute; top: 50%; left: 50%; width: 74%; aspect-ratio: 1.7; border: 1px dashed rgba(185, 167, 255, .28); border-radius: 50%; transform: translate(-50%, -50%) rotate(-8deg); }

.constellation__lines { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.constellation__line { fill: none; stroke: var(--line-color); stroke-width: 1.1; stroke-linecap: round; stroke-dasharray: 1; stroke-dashoffset: 1; opacity: .45; vector-effect: non-scaling-stroke; animation: constellation-draw 1.1s var(--bs-ease-glide) var(--line-delay) forwards; transition: opacity var(--bs-dur-quick) ease; }

/* 星点：外圈光晕负责"亮"，核心负责"实"，两层叠出小小的发光感。 */
.constellation__star { position: absolute; display: grid; place-items: center; width: var(--star-size); height: var(--star-size); border-radius: 50%; transform: translate(-50%, -50%); color: var(--star-color); text-decoration: none; transition: transform var(--bs-dur-base) var(--bs-ease-pop), opacity var(--bs-dur-quick) ease; }
.constellation__star:focus-visible { outline: 2px solid var(--star-color); outline-offset: 4px; }
.constellation__core { width: 100%; height: 100%; border-radius: 50%; background: radial-gradient(circle at 35% 32%, #fffaf5 8%, var(--star-color) 48%, transparent 72%); box-shadow: 0 0 12px var(--star-color); animation: constellation-twinkle 4.6s var(--bs-ease-breathe) infinite; }
.constellation__halo { position: absolute; inset: -45%; border-radius: 50%; border: 1px solid var(--star-color); opacity: 0; transition: opacity var(--bs-dur-quick) ease; }
.constellation__star.is-finished .constellation__halo { opacity: .38; }
.constellation__star:hover, .constellation__star:focus-visible { z-index: 3; transform: translate(-50%, -50%) scale(1.35); }
.constellation__star:hover .constellation__halo, .constellation__star:focus-visible .constellation__halo { opacity: .8; }
.constellation__star:hover .constellation__core, .constellation__star:focus-visible .constellation__core { animation-play-state: paused; }

.constellation__label { position: absolute; bottom: calc(100% + .5rem); left: 50%; display: grid; gap: .1rem; width: max-content; max-width: 12rem; padding: .34rem .55rem; border: 1px solid rgba(255, 250, 245, .22); border-radius: .6rem; background: rgba(20, 16, 36, .86); color: #fffaf5; font-size: .7rem; line-height: 1.4; text-align: left; opacity: 0; transform: translate(-50%, .2rem); pointer-events: none; transition: opacity var(--bs-dur-quick) ease, transform var(--bs-dur-quick) var(--bs-ease-pop); backdrop-filter: blur(6px); }
.constellation__star.is-low .constellation__label { top: calc(100% + .5rem); bottom: auto; transform: translate(-50%, -.2rem); }
.constellation__label strong { display: block; overflow: hidden; font-weight: 600; font-size: .74rem; text-overflow: ellipsis; white-space: nowrap; }
.constellation__label small { color: rgba(255, 250, 245, .62); font-size: .64rem; }
.constellation__star:hover .constellation__label, .constellation__star:focus-visible .constellation__label { opacity: 1; transform: translate(-50%, 0); }

/* 聚焦某个星座时，其它星座退到背景里，连线也一起变淡。 */
.constellation__sky.is-filtering .constellation__star:not(.is-active) { opacity: .26; }
.constellation__sky.is-filtering .constellation__line:not(.is-active) { opacity: .1; }

.constellation__empty { position: absolute; inset: 0; display: grid; place-items: center; margin: 0; padding: 1.5rem; color: rgba(244, 236, 255, .72); font-size: .82rem; line-height: 1.9; text-align: center; }
.constellation__sky.is-empty .constellation__orbit { opacity: .5; }

.constellation__foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .4rem .8rem; margin-top: .65rem; }
.constellation__legend { display: flex; flex-wrap: wrap; gap: .3rem; margin: 0; padding: 0; list-style: none; }
.constellation__legend li { display: inline-flex; align-items: center; gap: .3rem; padding: .14rem .5rem; border: 1px solid var(--bs-hairline); border-radius: 999px; color: var(--bs-ink-soft); font-size: .68rem; }
.constellation__legend i { width: .42rem; height: .42rem; border-radius: 50%; background: var(--dot); box-shadow: 0 0 6px var(--dot); }
.constellation__legend b { color: var(--bs-ink-muted); font-size: .64rem; font-weight: 500; }
.constellation__hint { margin: 0; color: var(--bs-ink-muted); font-size: .7rem; }

@keyframes constellation-twinkle { 0%, 100% { opacity: .82; transform: scale(1); } 50% { opacity: 1; transform: scale(1.12); } }
@keyframes constellation-draw { to { stroke-dashoffset: 0; } }
@keyframes constellation-drift { to { background-position: 3.1rem 3.1rem, 6.1rem 6.6rem; } }

@media (max-width: 640px) {
  .constellation { padding: .85rem .8rem .8rem; }
  .constellation__sky { aspect-ratio: 16 / 10; min-height: 12rem; }
  .constellation__moon { width: 2rem; height: 2rem; }
  .constellation__label { max-width: 9.5rem; }
}

@media (prefers-reduced-motion: reduce) {
  .constellation__core, .constellation__dust { animation: none; }
  .constellation__line { stroke-dashoffset: 0; animation: none; }
  .constellation__star, .constellation__label { transition: none; }
  .constellation__star:hover, .constellation__star:focus-visible { transform: translate(-50%, -50%); }
}
html.bs-reduced-motion .constellation__core,
html.bs-reduced-motion .constellation__dust { animation: none; }
html.bs-reduced-motion .constellation__line { stroke-dashoffset: 0; animation: none; }
</style>
