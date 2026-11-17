<script setup lang="ts">
import { siteConfig } from '../../src/config/site';
import type { PublicArticle } from '../types/public';
usePublicCanonical('/archive');
useSeoMeta({ title: `归档 | ${siteConfig.name}`, description: '按时间浏览生活倒影的文章归档。' });
const { data: articles } = await useAsyncData<PublicArticle[]>('archive-articles', () => $fetch('/api/articles'));

const years = computed(() => {
  const groups = new Map<string, PublicArticle[]>();
  for (const article of articles.value || []) {
    const year = (article.createTime || '').slice(0, 4) || '未知';
    groups.set(year, [...(groups.get(year) || []), article]);
  }
  return [...groups.entries()].sort(([a], [b]) => Number(b) - Number(a));
});
</script>

<template>
  <MigrationPage eyebrow="ARCHIVE" title="把走过的路，收进时间胶囊。" description="按时间整理文章、实验和那些值得回看的小发现。">
    <div class="timeline">
      <section v-for="[year, items] in years" :key="year" class="timeline__year" :aria-label="`${year} 年文章`">
        <h2>{{ year }} <small>{{ items.length }} 篇</small></h2>
        <NuxtLink v-for="article in items" :key="article.id" :to="`/article/${article.slug}`" class="timeline__item">
          <span class="timeline__dot" :style="articleArt(article).style"></span>
          <span class="timeline__date">{{ (article.createTime || '').slice(5, 10).replace('-', ' / ') }}</span>
          <strong>{{ article.articleTitle }}</strong>
          <small>{{ article.category || '随笔' }}</small>
        </NuxtLink>
      </section>
    </div>
  </MigrationPage>
</template>

<style scoped>
.timeline { display: grid; gap: 2.4rem; }
.timeline__year h2 { color: #392d4f; font-size: 1.5rem; }
.timeline__year h2 small { margin-left: .5rem; color: #9485a3; font-size: .85rem; font-weight: 500; }
.timeline__item { position: relative; display: grid; grid-template-columns: auto 3.4rem 1fr auto; gap: .7rem; align-items: center; padding: .8rem .9rem; border-radius: 1rem; color: #4b3d60; text-decoration: none; transition: 200ms ease; }
.timeline__item:hover { background: rgba(255,255,255,.62); transform: translateX(4px); }
.timeline__item:hover strong { color: #e1799c; }
.timeline__dot { width: 1.5rem; height: 1.5rem; border-radius: 50%; box-shadow: 0 0 0 4px rgba(255,255,255,.6); display: inline-block; }
.timeline__date { color: #9485a3; font-size: .82rem; white-space: nowrap; }
.timeline__item strong { color: #392d4f; font-weight: 600; }
.timeline__item small { color: #9485a3; font-size: .8rem; }
@media (max-width: 640px) { .timeline__item { grid-template-columns: auto 1fr; grid-template-areas: 'dot date' 'dot title' 'dot meta'; row-gap: .15rem; } .timeline__item strong { grid-area: title; } .timeline__date { grid-area: date; } .timeline__item small { grid-area: meta; } }
</style>
