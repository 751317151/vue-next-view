<script setup lang="ts">
import { siteConfig } from '../../src/config/site';
import type { PublicArticle } from '../types/public';
usePageSeo({
  path: '/archive',
  title: `归档 | ${siteConfig.name}`,
  description: '按时间浏览生活倒影的文章归档。',
});
const { data: articles } = await useAsyncData<PublicArticle[]>('archive-articles', () => $fetch('/api/articles'));

const years = computed(() => {
  const groups = new Map<string, PublicArticle[]>();
  for (const article of articles.value || []) {
    const year = (article.createTime || '').slice(0, 4) || '未知';
    groups.set(year, [...(groups.get(year) || []), article]);
  }
  return [...groups.entries()].sort(([a], [b]) => Number(b) - Number(a));
});

const totalCount = computed(() => (articles.value || []).length);
const monthLabel = (value?: string) => {
  const key = (value || '').slice(5, 7);
  return key ? `${Number(key)} 月` : '某个月';
};
</script>

<template>
  <MigrationPage eyebrow="ARCHIVE" title="把走过的路，收进时间胶囊。" description="按时间整理文章、实验和那些值得回看的小发现。">
    <div class="timeline">
      <p class="timeline__summary">
        <span aria-hidden="true">⌛</span>
        已封存 {{ totalCount }} 颗时间胶囊 · {{ years.length }} 个年份
      </p>

      <section v-for="[year, items] in years" :key="year" class="timeline__year" :aria-label="`${year} 年文章`">
        <header class="timeline__year-head">
          <h2>{{ year }}</h2>
          <span class="timeline__year-pill">{{ items.length }} 篇</span>
          <span class="timeline__year-line" aria-hidden="true"></span>
        </header>

        <ol class="timeline__list">
          <li v-for="(article, index) in items" :key="article.id" class="timeline__row">
            <span class="timeline__spine" aria-hidden="true"></span>
            <NuxtLink :to="`/article/${article.slug}`" class="timeline__item">
              <span class="timeline__dot" :style="articleArt(article).style" aria-hidden="true">
                <b>{{ articleArt(article).emoji }}</b>
              </span>
              <span class="timeline__body">
                <strong>{{ article.articleTitle }}</strong>
                <span class="timeline__meta">
                  <span>{{ monthLabel(article.createTime) }}</span>
                  <span aria-hidden="true">·</span>
                  <span>{{ article.category || '随笔' }}</span>
                  <span aria-hidden="true">·</span>
                  <span>{{ readingMinutes(article.articleContent) }} 分钟</span>
                </span>
              </span>
              <span class="timeline__index" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
            </NuxtLink>
          </li>
        </ol>
      </section>

      <p v-if="!years.length" class="timeline__empty">时间胶囊还空着，第一篇故事正在路上。</p>
    </div>
  </MigrationPage>
</template>

<style scoped>
.timeline { display: grid; gap: 2.2rem; }
.timeline__summary { display: inline-flex; align-items: center; gap: .45rem; margin: 0; color: #9485a3; font-size: .86rem; }

.timeline__year-head { display: flex; align-items: center; gap: .6rem; }
.timeline__year h2 { margin: 0; color: #392d4f; font-size: 1.65rem; letter-spacing: .02em; }
.timeline__year-pill { padding: .12rem .55rem; border-radius: 999px; background: rgba(255, 143, 179, .18); color: #b1768c; font-size: .74rem; }
.timeline__year-line { flex: 1; height: 2px; border-radius: 999px; background: linear-gradient(90deg, rgba(255, 143, 179, .55), rgba(185, 167, 255, .12)); }

.timeline__list { display: grid; gap: .35rem; margin: .85rem 0 0; padding: 0; list-style: none; }
.timeline__row { position: relative; padding-left: 2.4rem; }

/* One continuous gradient spine per year, drawn behind every row. */
.timeline__spine { position: absolute; top: 0; bottom: 0; left: 1rem; width: 2px; border-radius: 999px; background: linear-gradient(180deg, rgba(255, 143, 179, .5), rgba(185, 167, 255, .35) 55%, rgba(158, 230, 208, .3)); }
.timeline__row:first-child .timeline__spine { top: 1rem; }
.timeline__row:last-child .timeline__spine { bottom: auto; height: 1rem; }

.timeline__item { position: relative; display: grid; grid-template-columns: auto 1fr auto; gap: .8rem; align-items: center; padding: .7rem .9rem; border-radius: 1rem; color: #4b3d60; text-decoration: none; transition: transform 220ms ease, background 220ms ease; }
.timeline__item:hover { background: rgba(255, 255, 255, .68); transform: translateX(5px); }
.timeline__item:hover strong { color: #e1799c; }

.timeline__dot { position: absolute; left: -1.55rem; display: grid; place-items: center; width: 1.6rem; height: 1.6rem; border-radius: 50%; box-shadow: 0 0 0 4px rgba(255, 250, 245, .9), 0 6px 14px rgba(95, 66, 118, .16); transition: transform 260ms cubic-bezier(.2, .9, .3, 1.4); }
.timeline__dot b { font-size: .8rem; line-height: 1; filter: drop-shadow(0 1px 2px rgba(57, 45, 79, .25)); }
.timeline__item:hover .timeline__dot { transform: scale(1.22) rotate(-8deg); }

.timeline__body { display: grid; gap: .2rem; min-width: 0; }
.timeline__body strong { color: #392d4f; font-weight: 600; line-height: 1.5; }
.timeline__meta { display: flex; flex-wrap: wrap; align-items: center; gap: .35rem; color: #9485a3; font-size: .8rem; }

.timeline__index { color: #c9bfd6; font-size: .78rem; letter-spacing: .08em; opacity: 0; transition: opacity 220ms ease; }
.timeline__item:hover .timeline__index { opacity: 1; }

.timeline__empty { margin: 0; color: #9485a3; }

@media (max-width: 640px) {
  .timeline__row { padding-left: 2rem; }
  .timeline__index { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .timeline__item, .timeline__dot, .timeline__index { transition: none; }
  .timeline__item:hover { transform: none; }
  .timeline__item:hover .timeline__dot { transform: none; }
}
</style>
