<script setup lang="ts">
import { siteConfig } from '../../src/config/site';
import type { PublicArticle } from '../types/public';
usePublicCanonical('/');

useSeoMeta({
  title: siteConfig.name,
  description: siteConfig.description,
  ogTitle: siteConfig.name,
  ogDescription: siteConfig.description,
  ogType: 'website',
  twitterCard: 'summary_large_image',
});

const { data: articles } = await useAsyncData<PublicArticle[]>('public-articles', () => $fetch('/api/articles'));
</script>

<template>
  <section class="migration-home">
    <p class="migration-home__eyebrow">Nuxt 4 public shell</p>
    <h1>把技术、生活和灵感，写成会发光的小故事。</h1>
    <p>{{ siteConfig.description }}</p>
    <div class="migration-home__actions">
      <NuxtLink to="/archive">探索文章</NuxtLink>
      <NuxtLink to="/about">认识 BlackStar</NuxtLink>
    </div>
    <section class="migration-home__articles" aria-labelledby="latest-articles-title">
      <div class="migration-home__section-head">
        <h2 id="latest-articles-title">最近写下的故事</h2>
        <NuxtLink to="/archive">查看全部 →</NuxtLink>
      </div>
      <div class="migration-home__grid">
        <NuxtLink
          v-for="article in articles || []"
          :key="article.id"
          :to="`/article/${article.slug}`"
          class="migration-home__card"
        >
          <span>{{ article.category || '随笔' }}</span>
          <h3>{{ article.articleTitle }}</h3>
          <p>{{ article.articleContent }}</p>
          <small>{{ article.createTime }}</small>
        </NuxtLink>
      </div>
    </section>
  </section>
</template>

<style scoped>
.migration-home { max-width: 760px; margin: 0 auto; padding: clamp(3rem, 10vw, 8rem) 0; }
.migration-home__eyebrow { color: #b1768c; letter-spacing: .12em; text-transform: uppercase; }
h1 { max-width: 700px; margin: .7rem 0 1.2rem; color: #392d4f; font-size: clamp(2.2rem, 7vw, 5rem); line-height: 1.08; }
.migration-home > p:not(.migration-home__eyebrow) { max-width: 560px; color: #746b86; font-size: 1.08rem; line-height: 1.8; }
.migration-home__actions { display: flex; gap: .7rem; flex-wrap: wrap; margin-top: 2rem; }
.migration-home__actions a { padding: .75rem 1rem; border-radius: 999px; color: #392d4f; background: rgba(255,255,255,.72); box-shadow: 0 12px 30px rgba(95,66,118,.1); text-decoration: none; transition: 180ms ease; }
.migration-home__actions a:first-child { background: linear-gradient(135deg,#ffe48a,#ffb6c8); }
.migration-home__actions a:hover { transform: translateY(-3px) rotate(-1deg); }
.migration-home__articles { margin-top: 6rem; }
.migration-home__section-head { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; }
.migration-home__section-head h2 { color: #392d4f; }
.migration-home__section-head a { color: #8b73c5; text-decoration: none; }
.migration-home__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin-top: 1rem; }
.migration-home__card { display: block; padding: 1.2rem; border: 1px solid rgba(255,255,255,.72); border-radius: 1.25rem; background: rgba(255,255,255,.58); color: #4b3d60; text-decoration: none; box-shadow: 0 12px 30px rgba(95,66,118,.08); transition: 180ms ease; }
.migration-home__card:hover { border-color: rgba(255,143,179,.45); transform: translateY(-4px) rotate(-.3deg); box-shadow: 0 20px 45px rgba(95,66,118,.16); }
.migration-home__card span { color: #b1768c; font-size: .75rem; letter-spacing: .08em; }
.migration-home__card h3 { margin: .45rem 0; color: #392d4f; }
.migration-home__card p { display: -webkit-box; overflow: hidden; margin: 0; color: #746b86; line-height: 1.65; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
.migration-home__card small { display: block; margin-top: .8rem; color: #9485a3; }
@media (max-width: 700px) { .migration-home__grid { grid-template-columns: 1fr; } }
</style>
