<script setup lang="ts">
import { siteConfig } from '../../src/config/site';
import type { PublicArticle, PublicCategory, PublicTag } from '../types/public';
usePageSeo({
  path: '/',
  title: siteConfig.name,
  description: siteConfig.description,
});

// The hero's first background is the LCP element; start fetching it immediately.
useHead({ link: [{ rel: 'preload', as: 'image', href: '/bg1.jpg', fetchpriority: 'high' }] });

const [{ data: articles }, { data: categories }, { data: tags }] = await Promise.all([
  useAsyncData<PublicArticle[]>('public-articles', () => $fetch('/api/articles')),
  useAsyncData<PublicCategory[]>('public-categories', () => $fetch('/api/categories')),
  useAsyncData<PublicTag[]>('public-tags', () => $fetch('/api/tags')),
]);

const latest = computed(() => (articles.value || []).slice(0, 6));
const totalWords = computed(() => (articles.value || []).reduce((sum, article) => sum + (article.articleContent || '').length, 0));
</script>

<template>
  <div class="home-page">
    <HomeHero />

    <div id="home-body" class="home">
      <dl class="home__stats">
        <div><dt>文章</dt><dd>{{ articles?.length ?? 0 }}</dd></div>
        <div><dt>分类</dt><dd>{{ categories?.length ?? 0 }}</dd></div>
        <div><dt>标签</dt><dd>{{ tags?.length ?? 0 }}</dd></div>
        <div><dt>写下</dt><dd>{{ Math.round(totalWords / 1000) }}k 字</dd></div>
      </dl>

      <section class="home__latest" aria-labelledby="latest-articles-title">
        <div class="home__section-head">
          <h2 id="latest-articles-title">最近写下的故事</h2>
          <NuxtLink to="/archive">查看全部 →</NuxtLink>
        </div>
        <div class="home__grid">
          <ArticleCard v-for="article in latest" :key="article.id" :article="article" />
        </div>
      </section>

      <hr class="bs-halftone-divider" aria-hidden="true" />

      <section v-if="categories?.length" class="home__paths" aria-labelledby="home-paths-title">
        <div class="home__section-head">
          <h2 id="home-paths-title">选一条小路继续逛</h2>
          <NuxtLink to="/categories">全部分类 →</NuxtLink>
        </div>
        <div class="home__paths-grid">
          <NuxtLink v-for="category in categories" :key="category.id" :to="`/categories/${category.slug}`" class="home__path">
            <strong>{{ category.categoryName }}</strong>
            <span>{{ category.articleCount || 0 }} 篇</span>
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.home-page { padding-bottom: 1rem; }
.home { max-width: 820px; margin: 0 auto; padding: 1.2rem 0 3rem; }
.home__stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .6rem; margin: 0 0 3.4rem; }
.home__stats > div { padding: .8rem .5rem; border: 1px solid rgba(255,255,255,.7); border-radius: 1.1rem; background: rgba(255,255,255,.55); text-align: center; }
.home__stats dt { color: #9485a3; font-size: .78rem; }
.home__stats dd { margin: .15rem 0 0; color: #392d4f; font-size: 1.25rem; font-weight: 700; }
.home__latest, .home__paths { margin-top: 3.4rem; }
.home__latest { margin-top: 0; }
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
