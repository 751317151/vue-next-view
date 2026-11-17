<script setup lang="ts">
import { siteConfig, getSiteUrl } from '../../../src/config/site';
import type { PublicArticle } from '../../types/public';

const route = useRoute();
const slug = String(route.params.slug || '');
const runtimeConfig = useRuntimeConfig();
const siteUrl = runtimeConfig.public.siteUrl || useRequestURL().origin || getSiteUrl();

if (!slug) {
  throw createError({ statusCode: 404, statusMessage: '文章不存在' });
}

const { data: article, error } = await useAsyncData<PublicArticle>(`article-${slug}`, () => $fetch(`/api/articles/${encodeURIComponent(slug)}`));
if (error.value || !article.value) {
  throw createError({ statusCode: 404, statusMessage: '文章不存在' });
}

const articleData = article.value;

if (/^\d+$/.test(slug) && articleData.slug) {
  await navigateTo(`/article/${articleData.slug}`, { redirectCode: 301 });
}

const articleSeo = {
  title: articleData.articleTitle,
  description: articleData.articleContent,
  url: `${siteUrl || ''}/article/${articleData.slug || slug}`,
  image: articleData.articleCover,
  publishedAt: articleData.createTime,
  updatedAt: articleData.updateTime,
  category: articleData.category,
  tags: articleData.tags,
  author: siteConfig.author,
};
const seo = useArticleSeo(articleSeo);

const categoryHref = `/categories/${articleData.category ? encodeURIComponent(articleData.category) : ''}`;
const hero = articleArt({ id: articleData.id, category: articleData.category });
const heroEmoji = hero.emoji;
const heroStyle = hero.style;
</script>

<template>
  <article class="reading">
    <nav class="reading__crumbs" aria-label="面包屑">
      <NuxtLink to="/">首页</NuxtLink>
      <span>✧</span>
      <NuxtLink v-if="articleData.category" :to="categoryHref">{{ articleData.category }}</NuxtLink>
      <span v-if="articleData.category">✧</span>
      <span aria-current="page">{{ articleData.articleTitle }}</span>
    </nav>

    <header class="reading__hero" :style="heroStyle">
      <b class="reading__hero-emoji">{{ heroEmoji }}</b>
    </header>

    <p class="reading__eyebrow">{{ siteConfig.name }} · 原创故事</p>
    <h1>{{ articleData.articleTitle }}</h1>
    <div class="reading__meta">
      <span><time :datetime="articleData.createTime">{{ formatDate(articleData.createTime) }}</time></span>
      <span>约 {{ readingMinutes(articleData.articleContent) }} 分钟</span>
      <span v-if="articleData.category">{{ articleData.category }}</span>
    </div>

    <img v-if="articleData.articleCover" class="reading__cover" :src="articleData.articleCover" :alt="articleData.articleTitle" />

    <div class="reading__body" v-html="articleData.contentHtml"></div>

    <ul v-if="articleData.tags?.length" class="reading__tags" aria-label="文章标签">
      <li v-for="tag in articleData.tags" :key="tag">#{{ tag }}</li>
    </ul>

    <section v-if="articleData.recommendations?.length" class="reading__next" aria-labelledby="recommendations-title">
      <h2 id="recommendations-title">继续探索 ✦</h2>
      <div class="reading__next-grid">
        <NuxtLink v-for="recommendation in articleData.recommendations" :key="recommendation.id" :to="`/article/${recommendation.slug}`" class="reading__next-card">
          <span class="reading__next-art" :style="articleArt(recommendation).style">
            <b>{{ articleArt(recommendation).emoji }}</b>
          </span>
          <strong>{{ recommendation.articleTitle }}</strong>
          <small>{{ formatDate(recommendation.createTime) }}</small>
        </NuxtLink>
      </div>
    </section>
  </article>
</template>

<style scoped>
.reading { max-width: 820px; margin: 0 auto; padding: 1.5rem 0 5rem; }
.reading__crumbs { display: flex; flex-wrap: wrap; gap: .45rem; align-items: center; color: #9485a3; font-size: .84rem; }
.reading__crumbs a { color: #8b73c5; text-decoration: none; }
.reading__crumbs a:hover { color: #e1799c; }
.reading__hero { position: relative; display: grid; place-items: center; height: 11rem; margin-top: 1.4rem; border-radius: 1.8rem; box-shadow: 0 20px 55px rgba(95,66,118,.16); overflow: hidden; }
.reading__hero::after { content: ''; position: absolute; inset: auto 1.2rem 0; height: 3px; border-radius: 999px; background: linear-gradient(90deg, #ff8fb3, #ffbd8a, #b9a7ff, #9ee6d0); }
.reading__hero-emoji { font-size: 3.6rem; filter: drop-shadow(0 10px 22px rgba(57,45,79,.2)); }
.reading__eyebrow { margin-top: 1.8rem; color: #b1768c; letter-spacing: .12em; }
.reading h1 { margin: .6rem 0 1rem; color: #392d4f; font-size: clamp(2rem, 5.5vw, 3.6rem); line-height: 1.15; }
.reading__meta { display: flex; flex-wrap: wrap; gap: .55rem; }
.reading__meta span { padding: .35rem .7rem; border-radius: 999px; background: rgba(185,167,255,.16); color: #624d72; font-size: .82rem; }
.reading__cover { display: block; width: 100%; max-height: 26rem; margin-top: 1.8rem; border-radius: 1.5rem; object-fit: cover; box-shadow: 0 18px 50px rgba(95,66,118,.16); }
.reading__body { margin-top: 2rem; padding: 1.6rem 1.7rem; border: 1px solid rgba(255,255,255,.66); border-radius: 1.5rem; background: rgba(255,255,255,.6); color: #4b3d60; line-height: 1.9; }
.reading__body :deep(h2), .reading__body :deep(h3), .reading__body :deep(h4) { margin: 1.7rem 0 .7rem; color: #392d4f; }
.reading__body :deep(p) { margin: .85rem 0; }
.reading__body :deep(a) { color: #a464bc; text-decoration-color: rgba(164,100,188,.4); }
.reading__body :deep(code) { padding: .12rem .4rem; border-radius: .4rem; background: rgba(185,167,255,.2); }
.reading__body :deep(pre) { overflow-x: auto; padding: 1.1rem; border-radius: 1rem; background: #392d4f; color: #fffaf5; }
.reading__body :deep(pre code) { padding: 0; background: transparent; }
.reading__body :deep(img) { max-width: 100%; border-radius: .9rem; }
.reading__body :deep(blockquote) { margin: 1.2rem 0; padding: .8rem 1.1rem; border-left: 4px solid #ffb6c8; border-radius: .8rem; background: rgba(255,228,138,.22); color: #5c4b73; }
.reading__tags { display: flex; flex-wrap: wrap; gap: .6rem; margin: 1.8rem 0 0; padding: 0; list-style: none; }
.reading__tags li { padding: .45rem .8rem; border-radius: 999px; background: rgba(158,230,208,.26); color: #4f6d67; font-size: .84rem; }
.reading__next { margin-top: 3.4rem; }
.reading__next h2 { color: #392d4f; }
.reading__next-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .9rem; margin-top: 1rem; }
.reading__next-card { display: grid; gap: .45rem; padding: .9rem; border-radius: 1.2rem; background: rgba(255,255,255,.6); color: #4b3d60; text-decoration: none; transition: 220ms ease; }
.reading__next-card:hover { transform: translateY(-4px) rotate(-.4deg); box-shadow: 0 16px 38px rgba(95,66,118,.16); }
.reading__next-art { display: grid; place-items: center; height: 6.5rem; border-radius: .9rem; }
.reading__next-art b { font-size: 2rem; filter: drop-shadow(0 6px 14px rgba(57,45,79,.18)); }
.reading__next-card strong { color: #392d4f; line-height: 1.45; }
.reading__next-card small { color: #9485a3; }
@media (max-width: 640px) { .reading__next-grid { grid-template-columns: 1fr; } }
</style>
