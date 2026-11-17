<script setup lang="ts">
import { siteConfig } from '../../src/config/site';
import type { PublicArticle, PublicCategory, PublicTag } from '../types/public';
usePublicCanonical('/');

useSeoMeta({
  title: siteConfig.name,
  description: siteConfig.description,
  ogTitle: siteConfig.name,
  ogDescription: siteConfig.description,
  ogType: 'website',
  twitterCard: 'summary_large_image',
});

const [{ data: articles }, { data: categories }, { data: tags }] = await Promise.all([
  useAsyncData<PublicArticle[]>('public-articles', () => $fetch('/api/articles')),
  useAsyncData<PublicCategory[]>('public-categories', () => $fetch('/api/categories')),
  useAsyncData<PublicTag[]>('public-tags', () => $fetch('/api/tags')),
]);

const latest = computed(() => (articles.value || []).slice(0, 6));
const totalWords = computed(() => (articles.value || []).reduce((sum, article) => sum + (article.articleContent || '').length, 0));
</script>

<template>
  <div class="home">
    <section class="home__hero" aria-labelledby="home-hero-title">
      <p class="home__eyebrow">在星光与代码之间，慢慢写</p>
      <h1 id="home-hero-title">
        把技术、生活和灵感，<br />
        写成<span class="home__hero-glow">会发光的小故事</span>。
      </h1>
      <p class="home__lead">{{ siteConfig.description }}</p>
      <div class="home__actions">
        <NuxtLink to="/archive" class="home__cta">开始阅读 ✦</NuxtLink>
        <NuxtLink to="/about" class="home__cta home__cta--ghost">认识 BlackStar</NuxtLink>
      </div>
      <dl class="home__stats">
        <div><dt>文章</dt><dd>{{ articles?.length ?? 0 }}</dd></div>
        <div><dt>分类</dt><dd>{{ categories?.length ?? 0 }}</dd></div>
        <div><dt>标签</dt><dd>{{ tags?.length ?? 0 }}</dd></div>
        <div><dt>写下</dt><dd>{{ Math.round(totalWords / 1000) }}k 字</dd></div>
      </dl>
    </section>

    <section class="home__latest" aria-labelledby="latest-articles-title">
      <div class="home__section-head">
        <h2 id="latest-articles-title">最近写下的故事</h2>
        <NuxtLink to="/archive">查看全部 →</NuxtLink>
      </div>
      <div class="home__grid">
        <ArticleCard v-for="article in latest" :key="article.id" :article="article" />
      </div>
    </section>

    <section v-if="categories?.length" class="home__paths" aria-labelledby="home-paths-title">
      <div class="home__section-head">
        <h2 id="home-paths-title">选一条小路继续逛</h2>
        <NuxtLink to="/categories">全部分类 →</NuxtLink>
      </div>
      <div class="home__paths-grid">
        <NuxtLink v-for="category in categories" :key="category.id" :to="`/categories/${category.id}`" class="home__path">
          <strong>{{ category.categoryName }}</strong>
          <span>{{ category.articleCount || 0 }} 篇</span>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home { max-width: 820px; margin: 0 auto; padding: clamp(3rem, 9vw, 7rem) 0 0; }
.home__eyebrow { color: #b1768c; letter-spacing: .14em; text-transform: uppercase; }
.home__hero h1 { max-width: 720px; margin: .7rem 0 1.1rem; color: #392d4f; font-size: clamp(2.2rem, 6.5vw, 4.6rem); line-height: 1.12; }
.home__hero-glow { background: linear-gradient(120deg, #ff8fb3, #ffbd8a 45%, #b9a7ff); -webkit-background-clip: text; background-clip: text; color: transparent; }
.home__lead { max-width: 560px; color: #746b86; font-size: 1.08rem; line-height: 1.85; }
.home__actions { display: flex; gap: .7rem; flex-wrap: wrap; margin-top: 2rem; }
.home__cta { padding: .8rem 1.2rem; border-radius: 999px; background: linear-gradient(135deg, #ffe48a, #ffb6c8); color: #392d4f; font-weight: 600; text-decoration: none; box-shadow: 0 14px 34px rgba(255, 143, 179, .25); transition: 220ms ease; }
.home__cta--ghost { background: rgba(255,255,255,.72); box-shadow: 0 12px 30px rgba(95,66,118,.1); }
.home__cta:hover { transform: translateY(-3px) rotate(-1deg); box-shadow: 0 20px 44px rgba(255, 143, 179, .3); }
.home__stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .6rem; margin: 2.6rem 0 0; }
.home__stats > div { padding: .8rem .5rem; border: 1px solid rgba(255,255,255,.7); border-radius: 1.1rem; background: rgba(255,255,255,.55); text-align: center; }
.home__stats dt { color: #9485a3; font-size: .78rem; }
.home__stats dd { margin: .15rem 0 0; color: #392d4f; font-size: 1.25rem; font-weight: 700; }
.home__latest, .home__paths { margin-top: 5rem; }
.home__section-head { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; }
.home__section-head h2 { color: #392d4f; }
.home__section-head a { color: #8b73c5; text-decoration: none; }
.home__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin-top: 1.1rem; }
.home__paths-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: .7rem; margin-top: 1.1rem; }
.home__path { display: flex; align-items: center; justify-content: space-between; gap: .5rem; padding: .85rem 1rem; border-radius: 1rem; background: rgba(255,255,255,.55); color: #4b3d60; text-decoration: none; transition: 200ms ease; }
.home__path strong { color: #392d4f; }
.home__path span { color: #9485a3; font-size: .8rem; }
.home__path:hover { background: rgba(255,228,138,.3); transform: translateY(-3px); }
@media (max-width: 700px) { .home__grid { grid-template-columns: 1fr; } .home__stats { grid-template-columns: repeat(2, 1fr); } }
</style>
