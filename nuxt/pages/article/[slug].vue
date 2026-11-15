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
</script>

<template>
  <article class="migration-article">
    <p class="migration-article__eyebrow">文章 · {{ siteConfig.name }}</p>
    <h1>{{ articleData.articleTitle }}</h1>
    <p class="migration-article__summary">{{ articleData.articleContent }}</p>
    <img v-if="articleData.articleCover" class="migration-article__cover" :src="articleData.articleCover" :alt="articleData.articleTitle" />
    <div class="migration-article__body" v-html="articleData.contentHtml"></div>
    <section v-if="articleData.recommendations?.length" class="migration-article__recommendations" aria-labelledby="recommendations-title">
      <h2 id="recommendations-title">继续探索</h2>
      <div class="recommendation-grid">
        <NuxtLink v-for="recommendation in articleData.recommendations" :key="recommendation.id" :to="`/article/${recommendation.slug}`" class="recommendation-card">
          <img v-if="recommendation.articleCover" :src="recommendation.articleCover" :alt="recommendation.articleTitle" loading="lazy" />
          <span>{{ recommendation.category || '随笔' }}</span>
          <strong>{{ recommendation.articleTitle }}</strong>
          <small>{{ recommendation.createTime }}</small>
        </NuxtLink>
      </div>
    </section>
  </article>
</template>

<style scoped>
.migration-article { max-width: 820px; margin: 0 auto; padding: 2rem 0 6rem; }
.migration-article__eyebrow { color: #b1768c; letter-spacing: .1em; }
h1 { color: #392d4f; font-size: clamp(2.2rem, 6vw, 4.5rem); line-height: 1.08; }
.migration-article__summary { color: #746b86; font-size: 1.1rem; line-height: 1.8; }
.migration-article__cover { display: block; width: 100%; max-height: 28rem; margin-top: 2rem; border-radius: 1.4rem; object-fit: cover; box-shadow: 0 18px 50px rgba(95,66,118,.16); }
.migration-article__body { margin-top: 2rem; padding: 1.5rem; border-radius: 1.4rem; background: rgba(255,255,255,.56); color: #4b3d60; line-height: 1.85; }
.migration-article__body :deep(h2), .migration-article__body :deep(h3), .migration-article__body :deep(h4) { margin: 1.6rem 0 .65rem; color: #392d4f; }
.migration-article__body :deep(p) { margin: .8rem 0; }
.migration-article__body :deep(a) { color: #a464bc; }
.migration-article__body :deep(code) { padding: .12rem .35rem; border-radius: .35rem; background: rgba(185,167,255,.18); }
.migration-article__body :deep(pre) { overflow-x: auto; padding: 1rem; border-radius: .9rem; background: #392d4f; color: #fffaf5; }
.migration-article__body :deep(pre code) { padding: 0; background: transparent; }
.migration-article__body :deep(img) { max-width: 100%; border-radius: .8rem; }
.migration-article__recommendations { margin-top: 3rem; }
.migration-article__recommendations h2 { color: #392d4f; }
.recommendation-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .8rem; }
.recommendation-card { display: grid; gap: .35rem; padding: .8rem; border-radius: 1rem; background: rgba(255,255,255,.58); color: #4b3d60; text-decoration: none; transition: 180ms ease; }
.recommendation-card:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(95,66,118,.14); }
.recommendation-card img { width: 100%; height: 7rem; border-radius: .7rem; object-fit: cover; }
.recommendation-card span { color: #b1768c; font-size: .72rem; }
.recommendation-card small { color: #9485a3; }
@media (max-width: 640px) { .recommendation-grid { grid-template-columns: 1fr; } }
</style>
