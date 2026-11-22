<script setup lang="ts">
import type { PublicGlint } from '../types/public';

const props = withDefaults(defineProps<{
  glints: PublicGlint[];
  /** 首页只露出最近几张，站内页展示全部。 */
  limit?: number;
}>(), {
  limit: 3,
});

const openedSlug = ref('');
const visible = computed(() => props.glints.slice(0, props.limit));

const toggle = (slug: string) => {
  openedSlug.value = openedSlug.value === slug ? '' : slug;
};

/**
 * 微光条目本身就是锚点：从 RSS、llms.txt 或别人分享的链接进来时，
 * 直接展开对应的一条并滚到视野中间，而不是让读者自己在长列表里找。
 */
const openFromHash = () => {
  if (typeof window === 'undefined') return;
  const raw = window.location.hash.replace(/^#/, '');
  if (!raw) return;

  let slug = raw;
  try {
    slug = decodeURIComponent(raw);
  } catch {
    // 非法转义只影响匹配，不该让整页脚本报错。
  }
  if (!props.glints.some((glint) => glint.slug === slug)) return;

  openedSlug.value = slug;
  nextTick(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(slug)?.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
  });
};

onMounted(() => {
  openFromHash();
  window.addEventListener('hashchange', openFromHash);
});

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', openFromHash);
});

/** 日期只显示「11 月 18 日」：年份在微光这种短记录里是噪音。 */
const dayLabel = (value: string) => {
  const match = /^\d{4}-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  return `${Number(match[1])} 月 ${Number(match[2])} 日`;
};
</script>

<template>
  <div v-if="visible.length" class="glint-strip">
    <article
      v-for="(glint, index) in visible"
      :key="glint.id"
      :id="glint.slug"
      class="glint"
      :class="{ 'is-open': openedSlug === glint.slug }"
      :style="{ '--glint-tilt': `${((index % 3) - 1) * 0.5}deg`, '--glint-i': index }"
    >
      <span class="glint__head">
        <button
          type="button"
          class="glint__toggle-hit"
          :aria-expanded="openedSlug === glint.slug"
          :aria-controls="`glint-body-${glint.id}`"
          :aria-label="openedSlug === glint.slug ? `收起${glint.title}` : `展开${glint.title}`"
          @click="toggle(glint.slug)"
        >
          <span class="glint__stamp" aria-hidden="true">{{ glint.emoji }}</span>
          <span class="glint__copy">
            <span class="glint__date">{{ dayLabel(glint.date) }}</span>
            <strong>{{ glint.title }}</strong>
            <span class="glint__summary">{{ glint.summary || glint.text }}</span>
          </span>
          <span class="glint__toggle" aria-hidden="true">{{ openedSlug === glint.slug ? '−' : '＋' }}</span>
        </button>
        <NuxtLink :to="glint.path || `/glints/${encodeURIComponent(glint.slug)}`" class="glint__open-page">单独看这条 ↗</NuxtLink>
      </span>
      <div v-show="openedSlug === glint.slug" :id="`glint-body-${glint.id}`" class="glint__body">
        <div v-html="glint.html"></div>
        <NuxtLink :to="glint.path || `/glints/${encodeURIComponent(glint.slug)}`" class="glint__permalink">
          这条微光 <span aria-hidden="true">→</span>
        </NuxtLink>
      </div>
    </article>
  </div>
</template>

<style scoped>
.glint-strip { display: grid; gap: .55rem; }

/* 一条条横向展开的纸带：左端是日期邮戳，右侧可展开全文。
   和常见的等宽卡片网格区分开，也更像手账里贴上去的小条。 */
.glint {
  position: relative;
  scroll-margin-top: 6rem;
  border: 1px solid var(--bs-border);
  border-left: 3px solid var(--bs-peach);
  border-radius: .35rem 1rem 1rem .35rem;
  background: var(--bs-surface);
  transform: rotate(var(--glint-tilt));
  transition: transform var(--bs-dur-base) var(--bs-ease-pop), box-shadow var(--bs-dur-base) ease, background var(--bs-dur-base) ease;
}
.glint:nth-child(3n + 2) { border-left-color: var(--bs-mint); }
.glint:nth-child(3n + 3) { border-left-color: var(--bs-lilac); }
.glint:hover { background: var(--bs-surface-strong); box-shadow: var(--bs-shadow-soft); transform: rotate(0) translateX(2px); }
.glint.is-open { background: var(--bs-surface-strong); box-shadow: var(--bs-shadow-soft); transform: rotate(0); }

.glint__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: .35rem;
  align-items: stretch;
  padding: .18rem .35rem .18rem .18rem;
}
.glint__toggle-hit {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: .7rem;
  align-items: center;
  min-width: 0;
  padding: .62rem .8rem .62rem .7rem;
  border: 0;
  border-radius: inherit;
  background: transparent;
  color: inherit;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}
.glint__toggle-hit:focus-visible { outline: 3px solid rgba(185, 167, 255, .7); outline-offset: 2px; }
.glint__open-page { align-self: center; padding: .25rem .45rem; border-radius: 999px; color: var(--bs-ink-muted); font-size: .65rem; text-decoration: none; white-space: nowrap; transition: color var(--bs-dur-quick) ease, background var(--bs-dur-quick) ease; }
.glint__open-page:hover { background: var(--bs-tint-yellow); color: var(--bs-accent-ink); }
.glint__open-page:focus-visible { outline: 3px solid rgba(185, 167, 255, .7); outline-offset: 2px; }

.glint__stamp {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
  border: 1px dashed var(--bs-border-accent);
  border-radius: 50%;
  background: var(--bs-paper-strong);
  font-size: .95rem;
  line-height: 1;
}

.glint__copy { display: grid; gap: .05rem; min-width: 0; }
.glint__date { color: var(--bs-accent-ink); font-size: .66rem; letter-spacing: .08em; }
.glint__copy strong { overflow: hidden; color: var(--bs-ink); font-size: .9rem; font-weight: 600; line-height: 1.5; text-overflow: ellipsis; white-space: nowrap; }
.glint__summary { overflow: hidden; color: var(--bs-ink-soft); font-size: .78rem; line-height: 1.6; text-overflow: ellipsis; white-space: nowrap; }
.glint__toggle { color: var(--bs-ink-faint); font-size: .9rem; transition: transform var(--bs-dur-quick) var(--bs-ease-pop), color var(--bs-dur-quick) ease; }
.glint__toggle-hit:hover .glint__toggle { color: var(--bs-accent-ink); transform: rotate(90deg); }

.glint__body {
  padding: 0 1rem .85rem 3.45rem;
  color: var(--bs-ink-body);
  font-size: .86rem;
  line-height: 1.9;
  animation: glint-unfold var(--bs-dur-base) var(--bs-ease-soft);
}
.glint__body :deep(p) { margin: 0 0 .55rem; }
.glint__body :deep(p:last-child) { margin-bottom: 0; }

.glint__permalink {
  display: inline-flex;
  gap: .3rem;
  align-items: center;
  margin-top: .45rem;
  padding: .22rem .58rem;
  border: 1px dashed var(--bs-border-accent);
  border-radius: 999px;
  background: var(--bs-tint-yellow);
  color: var(--bs-accent-ink);
  font-size: .72rem;
  font-weight: 600;
  text-decoration: none;
  transition: transform var(--bs-dur-quick) var(--bs-ease-pop), background var(--bs-dur-quick) ease;
}
.glint__permalink span { transition: transform var(--bs-dur-quick) ease; }
.glint__permalink:hover { background: var(--bs-tint-pink); transform: translateY(-2px) rotate(-.6deg); }
.glint__permalink:hover span { transform: translateX(3px); }
.glint__permalink:focus-visible { outline: 3px solid rgba(185, 167, 255, .7); outline-offset: 2px; }

@keyframes glint-unfold {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: none; }
}

@media (max-width: 560px) {
  .glint__head { grid-template-columns: minmax(0, 1fr); padding-right: .18rem; }
  .glint__open-page { justify-self: end; margin: -.15rem .35rem .3rem 0; }
  .glint__summary { white-space: normal; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  .glint__body { padding-left: .9rem; }
}
@media (prefers-reduced-motion: reduce) {
  .glint, .glint__toggle { transition: none; }
  .glint__body { animation: none; }
  .glint__permalink, .glint__permalink span, .glint__open-page { transition: none; }
}
html.bs-reduced-motion .glint,
html.bs-reduced-motion .glint__toggle { transition: none; }
html.bs-reduced-motion .glint__body { animation: none; }
html.bs-reduced-motion .glint__permalink,
html.bs-reduced-motion .glint__permalink span,
html.bs-reduced-motion .glint__open-page { transition: none; }
</style>
