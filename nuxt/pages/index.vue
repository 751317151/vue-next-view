<script setup lang="ts">
import { siteConfig } from '../../src/config/site';
import type { PublicArticle, PublicCategory, PublicTag } from '../types/public';
usePageSeo({
  path: '/',
  title: siteConfig.name,
  description: siteConfig.description,
});

// The resting middle image is bg1 after swapping the left and middle artwork.
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

      <!-- 星图漫游是首页到内容发现之间的“任意门”：它不复制文章列表，
           而是把心情、时间和随机抽取组合成一条不同的浏览路径。 -->
      <section class="home__explore" aria-labelledby="home-explore-title">
        <div class="home__explore-copy">
          <p class="home__explore-kicker">STAR MAP · 灵感星图</p>
          <h2 id="home-explore-title">不知道读什么？让星星替你决定。</h2>
          <p>沿着心情、年份和主题漫游，或者抽一封今日小笺。每一次点击，都可能遇见一篇刚刚好的旧文章。</p>
        </div>
        <NuxtLink to="/explore" class="home__explore-link">
          <span class="home__explore-orbit" aria-hidden="true"><i></i><i></i></span>
          <span class="home__explore-label">去星图漫游 <b aria-hidden="true">→</b></span>
        </NuxtLink>
      </section>

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
.home__stats > div { padding: .8rem .5rem; border: 1px solid var(--bs-border); border-radius: 1.1rem; background: var(--bs-surface); text-align: center; }
.home__stats dt { color: var(--bs-ink-muted); font-size: .78rem; }
.home__stats dd { margin: .15rem 0 0; color: var(--bs-ink); font-size: 1.25rem; font-weight: 700; }
.home__latest, .home__paths { margin-top: 3.4rem; }
.home__latest { margin-top: 0; }
.home__section-head { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; }
.home__section-head h2 { color: var(--bs-ink); }
.home__section-head a { color: var(--bs-link); text-decoration: none; }
.home__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin-top: 1.1rem; }
.home__paths-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: .7rem; margin-top: 1.1rem; }
.home__explore { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 1.4rem; margin-top: 1rem; padding: clamp(1.1rem, 3vw, 1.6rem); overflow: hidden; border: 1px solid var(--bs-border); border-radius: 1.5rem; background: radial-gradient(circle at 88% 18%, rgba(255, 228, 138, .32), transparent 34%), linear-gradient(135deg, rgba(255, 240, 247, .7), rgba(246, 243, 255, .62)); box-shadow: var(--bs-shadow-soft); }
.home__explore::after { position: absolute; top: -2.8rem; right: -2rem; width: 10rem; height: 10rem; border: 1px dashed rgba(185, 167, 255, .45); border-radius: 50%; content: ""; pointer-events: none; }
.home__explore-copy { position: relative; z-index: 1; }
.home__explore-kicker { margin: 0; color: var(--bs-accent-ink); font-size: .7rem; letter-spacing: .16em; }
.home__explore h2 { margin: .35rem 0 .4rem; color: var(--bs-ink); font-size: clamp(1.15rem, 2.6vw, 1.5rem); }
.home__explore p { max-width: 36rem; margin: 0; color: var(--bs-ink-soft); font-size: .9rem; line-height: 1.75; }
.home__explore-link { position: relative; z-index: 1; display: inline-flex; align-items: center; gap: .6rem; min-height: 3rem; padding: .55rem 1rem; border: 1.5px solid var(--bs-ink-line); border-radius: 999px; background: var(--bs-yellow); color: var(--bs-ink-on-accent); font-weight: 700; text-decoration: none; box-shadow: var(--bs-sticker-shadow); transition: transform var(--bs-dur-base) var(--bs-ease-pop), box-shadow var(--bs-dur-base) ease; }
.home__explore-link b { color: inherit; }
:root.bs-dark .home__explore { background: radial-gradient(circle at 88% 18%, rgba(255, 228, 138, .16), transparent 34%), linear-gradient(135deg, rgba(44, 35, 68, .82), rgba(33, 26, 54, .74)); }
.home__explore-link:hover { transform: translate(-2px, -3px) rotate(-1deg); box-shadow: 5px 6px 0 var(--bs-ink-line); }
.home__explore-orbit { position: relative; display: grid; place-items: center; width: 1.7rem; height: 1.7rem; border: 1px solid var(--bs-accent-ink); border-radius: 50%; }
.home__explore-orbit i { position: absolute; width: .3rem; height: .3rem; border-radius: 50%; background: var(--bs-accent-strong); }
.home__explore-orbit i:first-child { top: -.15rem; left: .55rem; }
.home__explore-orbit i:last-child { right: -.1rem; bottom: .25rem; background: var(--bs-link); }
.home__explore-label b { transition: transform var(--bs-dur-quick) ease; }
.home__explore-link:hover .home__explore-label b { transform: translateX(3px); }
.home__path { display: flex; align-items: center; justify-content: space-between; gap: .5rem; padding: .85rem 1rem; border-radius: 1rem; background: var(--bs-surface); color: var(--bs-ink-body); text-decoration: none; transition: var(--bs-dur-quick) ease; }
.home__path strong { color: var(--bs-ink); }
.home__path span { color: var(--bs-ink-muted); font-size: .8rem; }
.home__path:hover { background: rgba(255,228,138,.3); transform: translateY(-3px); }
@media (max-width: 700px) { .home__grid { grid-template-columns: 1fr; } .home__stats { grid-template-columns: repeat(2, 1fr); } .home__explore { grid-template-columns: 1fr; align-items: start; } }
</style>
