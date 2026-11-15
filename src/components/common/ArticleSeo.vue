<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getSiteUrl, siteConfig } from '@/config/site';
import { buildArticleSeo } from '@/seo/metadata';

interface ArticleSeoData {
  id: number | string;
  articleTitle: string;
  articleContent?: string;
  content?: string;
  articleCover?: string;
  createTime?: string;
  updateTime?: string;
  category?: string;
  tags?: string[];
}

const props = defineProps<{ article: ArticleSeoData }>();
const route = useRoute();
const siteName = siteConfig.name;
const jsonLdId = 'blackstar-article-jsonld';

const stripMarkup = (value: string) => value
  .replace(/```[\s\S]*?```/g, ' ')
  .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
  .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
  .replace(/[#>*_`~-]/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const upsertMeta = (name: string, content: string, property = false) => {
  if (!content || typeof document === 'undefined') return;
  const attr = property ? 'property' : 'name';
  let element = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, name);
    document.head.appendChild(element);
  }
  element.content = content;
};

const upsertCanonical = (url: string) => {
  if (typeof document === 'undefined') return;
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = url;
};

const updateSeo = () => {
  if (typeof window === 'undefined') return;
  const article = props.article;
  const descriptionSource = stripMarkup(article.articleContent || article.content || '') || '记录技术成长，分享编程心得';
  const origin = getSiteUrl() || window.location.origin;
  const url = new URL(route.fullPath, origin).toString();
  const image = article.articleCover ? new URL(article.articleCover, origin).toString() : '';
  const seo = buildArticleSeo({
    title: article.articleTitle,
    description: descriptionSource,
    url,
    image,
    publishedAt: article.createTime,
    updatedAt: article.updateTime,
    category: article.category,
    tags: article.tags,
    author: siteConfig.author,
  }, siteName);
  const title = seo.title;
  const description = seo.description;

  document.title = title;
  upsertCanonical(url);
  upsertMeta('description', description);
  upsertMeta('og:type', 'article', true);
  upsertMeta('og:title', title, true);
  upsertMeta('og:description', description, true);
  upsertMeta('og:url', url, true);
  upsertMeta('og:site_name', siteName, true);
  upsertMeta('og:image', image, true);
  upsertMeta('article:published_time', article.createTime || '', true);
  upsertMeta('article:modified_time', article.updateTime || article.createTime || '', true);
  upsertMeta('twitter:card', 'summary_large_image');
  upsertMeta('twitter:title', title);
  upsertMeta('twitter:description', description);
  upsertMeta('twitter:image', image);

  let script = document.getElementById(jsonLdId) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = jsonLdId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(seo.jsonLd);
};

watch(() => [props.article, route.fullPath], updateSeo, { immediate: true, deep: true });

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.getElementById(jsonLdId)?.remove();
    document.querySelector('meta[property="article:published_time"]')?.remove();
    document.querySelector('meta[property="article:modified_time"]')?.remove();
    document.querySelector('meta[property="og:image"]')?.remove();
    document.querySelector('meta[name="twitter:image"]')?.remove();
  }
});
</script>

<template>
  <span class="article-seo-anchor" aria-hidden="true"></span>
</template>
