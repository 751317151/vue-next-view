<script setup lang="ts">
import { siteConfig } from '../../src/config/site';
import type { PublicArticle, PublicGlint } from '../types/public';

const [{ data: articles }, { data: glints }] = await Promise.all([
  useAsyncData<PublicArticle[]>('archive-articles', () => $fetch<PublicArticle[]>('/api/articles')),
  useAsyncData<PublicGlint[]>('archive-glints', () => $fetch<PublicGlint[]>('/api/glints')),
]);

type ArchiveKind = 'article' | 'glint';
type ArchiveFilter = 'all' | ArchiveKind;

interface ArchiveEntry {
  key: string;
  kind: ArchiveKind;
  date: string;
  title: string;
  summary: string;
  to: string;
  emoji: string;
  artStyle: Record<string, string>;
  category: string;
  minutes: number;
}

const entries = computed<ArchiveEntry[]>(() => [
  ...(articles.value || []).map((article) => ({
    key: `a-${article.id}`,
    kind: 'article' as const,
    date: article.createTime,
    title: article.articleTitle,
    summary: article.summary || excerptOf(article.articleContent, 88),
    to: `/article/${article.slug.split('/').map((part) => encodeURIComponent(part)).join('/')}`,
    emoji: articleArt(article).emoji,
    artStyle: articleArt(article).style as Record<string, string>,
    category: article.category || '随笔',
    minutes: readingMinutes(article.articleContent),
  })),
  ...(glints.value || []).map((glint) => ({
    key: `g-${glint.id}`,
    kind: 'glint' as const,
    date: glint.date,
    title: glint.title,
    summary: glint.summary || glint.text,
    to: glint.path || `/glints/${encodeURIComponent(glint.slug)}`,
    emoji: glint.emoji,
    artStyle: { background: 'linear-gradient(135deg, rgba(255,228,138,.9), rgba(255,189,138,.8))' },
    category: '微光',
    minutes: 0,
  })),
].sort((left, right) => right.date.localeCompare(left.date) || left.title.localeCompare(right.title)));

const filter = ref<ArchiveFilter>('all');
const visibleEntries = computed(() => filter.value === 'all'
  ? entries.value
  : entries.value.filter((entry) => entry.kind === filter.value));

useCollectionSeo({
  path: '/archive',
  title: `时光档案 | ${siteConfig.name}`,
  description: '按时间翻阅生活倒影的长文与微光：每一篇故事，每一件值得记住的小事。',
  items: () => visibleEntries.value.map((entry) => ({
    articleTitle: entry.title,
    slug: entry.key,
    path: entry.to,
  })),
});

const counts = computed(() => ({
  article: entries.value.filter((entry) => entry.kind === 'article').length,
  glint: entries.value.filter((entry) => entry.kind === 'glint').length,
}));

const years = computed(() => {
  const groups = new Map<string, ArchiveEntry[]>();
  for (const entry of visibleEntries.value) {
    const year = (entry.date || '').slice(0, 4) || '未知';
    const bucket = groups.get(year);
    if (bucket) bucket.push(entry);
    else groups.set(year, [entry]);
  }
  return [...groups.entries()].sort(([a], [b]) => Number(b) - Number(a));
});

const totalCount = computed(() => entries.value.length);
const monthLabel = (value?: string) => {
  const key = (value || '').slice(5, 7);
  return key ? `${Number(key)} 月` : '某个月';
};

/** 每年一条时间刻度，点一下就能跳到对应年份，长档案不用慢慢滚。 */
const jumpToYear = (year: string) => {
  const target = document.getElementById(`archive-year-${year}`);
  if (!target) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
};
</script>

<template>
  <MigrationPage title="时光档案" description="长文是折起来的一页，微光是夹在页角的一束光。">
    <div class="timeline">
      <div class="timeline__intro">
        <p class="timeline__summary">
          <span aria-hidden="true">⌛</span>
          已封存 {{ totalCount }} 颗时间胶囊 · {{ counts.article }} 篇故事 · {{ counts.glint }} 束微光
        </p>
        <nav class="timeline__years" aria-label="跳到年份">
          <button
            v-for="[year] in years"
            :key="`jump-${year}`"
            type="button"
            @click="jumpToYear(year)"
          >
            {{ year }}
          </button>
        </nav>
      </div>

      <div class="timeline__filters" role="group" aria-label="筛选档案类型">
        <button type="button" :class="{ 'is-active': filter === 'all' }" :aria-pressed="filter === 'all'" @click="filter = 'all'">
          全部 <small>{{ totalCount }}</small>
        </button>
        <button type="button" :class="{ 'is-active': filter === 'article' }" :aria-pressed="filter === 'article'" @click="filter = 'article'">
          长文 <small>{{ counts.article }}</small>
        </button>
        <button type="button" :class="{ 'is-active': filter === 'glint' }" :aria-pressed="filter === 'glint'" @click="filter = 'glint'">
          微光 <small>{{ counts.glint }}</small>
        </button>
      </div>

      <section
        v-for="[year, items] in years"
        :id="`archive-year-${year}`"
        :key="year"
        class="timeline__year"
        :aria-label="`${year} 年长文与微光`"
      >
        <header class="timeline__year-head">
          <h2>{{ year }}</h2>
          <span class="timeline__year-pill">{{ items.length }} 则</span>
          <span class="timeline__year-line" aria-hidden="true"></span>
        </header>

        <ol class="timeline__list">
          <li v-for="(entry, index) in items" :key="entry.key" class="timeline__row" :class="`is-${entry.kind}`">
            <span class="timeline__spine" aria-hidden="true"></span>
            <NuxtLink :to="entry.to" class="timeline__item">
              <span class="timeline__dot" :style="entry.artStyle" aria-hidden="true">
                <b>{{ entry.emoji }}</b>
              </span>
              <span class="timeline__body">
                <span class="timeline__title-line">
                  <strong>{{ entry.title }}</strong>
                  <em class="timeline__kind">{{ entry.kind === 'glint' ? '微光' : '长文' }}</em>
                </span>
                <span class="timeline__meta">
                  <span>{{ monthLabel(entry.date) }}</span>
                  <span aria-hidden="true">·</span>
                  <span>{{ entry.category }}</span>
                  <template v-if="entry.minutes">
                    <span aria-hidden="true">·</span>
                    <span>{{ entry.minutes }} 分钟</span>
                  </template>
                </span>
                <span class="timeline__blurb">{{ entry.summary }}</span>
              </span>
              <span class="timeline__index" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
            </NuxtLink>
          </li>
        </ol>
      </section>

      <p v-if="!years.length" class="timeline__empty">这一页还没有时间胶囊，换个筛选看看。</p>
    </div>
  </MigrationPage>
</template>

<style scoped>
.timeline { display: grid; gap: 2.2rem; }
.timeline__intro { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .65rem 1rem; }
.timeline__summary { display: inline-flex; align-items: center; gap: .45rem; margin: 0; color: var(--bs-ink-muted); font-size: .86rem; }

.timeline__years { display: flex; flex-wrap: wrap; gap: .3rem; }
.timeline__years button { padding: .18rem .55rem; border: 1px dashed var(--bs-border-accent); border-radius: 999px; background: transparent; color: var(--bs-accent-ink); font: inherit; font-size: .72rem; cursor: pointer; transition: transform var(--bs-dur-quick) var(--bs-ease-pop), background var(--bs-dur-quick) ease; }
.timeline__years button:hover { background: var(--bs-tint-yellow); transform: translateY(-2px); }
.timeline__years button:focus-visible { outline: 3px solid rgba(185, 167, 255, .72); outline-offset: 2px; }

.timeline__filters { display: inline-flex; gap: .25rem; justify-self: start; padding: .22rem; border: 1px solid var(--bs-border); border-radius: 999px; background: var(--bs-surface-soft); }
.timeline__filters button { display: inline-flex; gap: .35rem; align-items: center; padding: .35rem .68rem; border: 1px solid transparent; border-radius: 999px; background: transparent; color: var(--bs-ink-soft); font: inherit; font-size: .75rem; cursor: pointer; transition: transform var(--bs-dur-quick) var(--bs-ease-pop), background var(--bs-dur-quick) ease, color var(--bs-dur-quick) ease; }
.timeline__filters button:hover { color: var(--bs-ink); transform: translateY(-1px); }
.timeline__filters button.is-active { border-color: var(--bs-border-accent); background: var(--bs-tint-yellow); color: var(--bs-ink); box-shadow: 1.5px 1.5px 0 var(--bs-ink-line); }
.timeline__filters button:focus-visible { outline: 3px solid rgba(185, 167, 255, .72); outline-offset: 2px; }
.timeline__filters small { padding: .02rem .32rem; border-radius: 999px; background: var(--bs-tint-lilac); color: var(--bs-ink-muted); font-size: .64rem; }

.timeline__year { scroll-margin-top: 6rem; }
.timeline__year-head { display: flex; align-items: center; gap: .6rem; }
.timeline__year h2 { margin: 0; color: var(--bs-ink); font-size: 1.65rem; letter-spacing: .02em; }
.timeline__year-pill { padding: .12rem .55rem; border-radius: 999px; background: rgba(255, 143, 179, .18); color: var(--bs-accent-ink); font-size: .74rem; }
.timeline__year-line { flex: 1; height: 2px; border-radius: 999px; background: linear-gradient(90deg, rgba(255, 143, 179, .55), rgba(185, 167, 255, .12)); }

.timeline__list { display: grid; gap: .35rem; margin: .85rem 0 0; padding: 0; list-style: none; }
.timeline__row { position: relative; padding-left: 2.4rem; }

/* One continuous gradient spine per year, drawn behind every row. */
.timeline__spine { position: absolute; top: 0; bottom: 0; left: 1rem; width: 2px; border-radius: 999px; background: linear-gradient(180deg, rgba(255, 143, 179, .5), rgba(185, 167, 255, .35) 55%, rgba(158, 230, 208, .3)); }
.timeline__row:first-child .timeline__spine { top: 1rem; }
.timeline__row:last-child .timeline__spine { bottom: auto; height: 1rem; }

.timeline__item { position: relative; display: grid; grid-template-columns: auto 1fr auto; gap: .8rem; align-items: center; padding: .7rem .9rem; border-radius: .3rem .95rem .95rem .3rem; color: var(--bs-ink-body); text-decoration: none; transition: transform var(--bs-dur-base) ease, background var(--bs-dur-base) ease; }
.timeline__row.is-article .timeline__item { background: var(--bs-surface-soft); border-left: 2px solid var(--bs-lilac); }
.timeline__row.is-glint .timeline__item { border: 1px dashed var(--bs-border-accent); border-left: 2px solid var(--bs-yellow); background: transparent; }
.timeline__item:hover { background: var(--bs-surface-strong); transform: translateX(5px); }
.timeline__item:hover strong { color: var(--bs-accent-strong); }

.timeline__dot { position: absolute; left: -1.55rem; display: grid; place-items: center; width: 1.6rem; height: 1.6rem; border-radius: 50%; box-shadow: 0 0 0 4px rgba(255, 250, 245, .9), 0 6px 14px rgba(95, 66, 118, .16); transition: transform var(--bs-dur-base) var(--bs-ease-pop); }
.timeline__dot b { font-size: .8rem; line-height: 1; filter: drop-shadow(0 1px 2px rgba(57, 45, 79, .25)); }
.timeline__item:hover .timeline__dot { transform: scale(1.22) rotate(-8deg); }

.timeline__body { display: grid; gap: .2rem; min-width: 0; }
.timeline__body strong { color: var(--bs-ink); font-weight: 600; line-height: 1.5; }
.timeline__title-line { display: flex; flex-wrap: wrap; align-items: baseline; gap: .4rem; }
.timeline__kind { padding: .02rem .38rem; border: 1px dashed var(--bs-border-accent); border-radius: 999px; color: var(--bs-accent-ink); font-size: .62rem; font-style: normal; }
.timeline__row.is-glint .timeline__kind { border-color: rgba(255, 189, 138, .62); background: var(--bs-tint-yellow); }
.timeline__meta { display: flex; flex-wrap: wrap; align-items: center; gap: .35rem; color: var(--bs-ink-muted); font-size: .8rem; }
.timeline__blurb { overflow: hidden; color: var(--bs-ink-soft); font-size: .78rem; line-height: 1.65; text-overflow: ellipsis; white-space: nowrap; }

.timeline__index { color: var(--bs-ink-faint); font-size: .78rem; letter-spacing: .08em; opacity: 0; transition: opacity var(--bs-dur-base) ease; }
.timeline__item:hover .timeline__index { opacity: 1; }

.timeline__empty { margin: 0; color: var(--bs-ink-muted); }

@media (max-width: 640px) {
  .timeline__row { padding-left: 2rem; }
  .timeline__index { display: none; }
  .timeline__intro { align-items: flex-start; }
  .timeline__blurb { white-space: normal; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
}
@media (prefers-reduced-motion: reduce) {
  .timeline__item, .timeline__dot, .timeline__index, .timeline__filters button, .timeline__years button { transition: none; }
  .timeline__item:hover { transform: none; }
  .timeline__item:hover .timeline__dot { transform: none; }
  .timeline__filters button:hover, .timeline__years button:hover { transform: none; }
}
html.bs-reduced-motion .timeline__item,
html.bs-reduced-motion .timeline__filters button,
html.bs-reduced-motion .timeline__years button { transition: none; }
</style>
