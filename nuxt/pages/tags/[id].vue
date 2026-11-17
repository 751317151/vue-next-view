<script setup lang="ts">
import { siteConfig } from '../../../src/config/site';
import type { PublicArticle, PublicTag } from '../../types/public';
const route = useRoute();
const id = String(route.params.id || '');
usePublicCanonical(`/tags/${id}`);
const [{ data: tag, error: tagError }, { data: articles }] = await Promise.all([
  useAsyncData<PublicTag>(`tag-${id}`, () => $fetch(`/api/tags/${encodeURIComponent(id)}`)),
  useAsyncData<PublicArticle[]>(`tag-articles-${id}`, () => $fetch('/api/articles')),
]);
if (tagError.value || !tag.value) throw createError({ statusCode: 404, statusMessage: '标签不存在' });
const currentTag = tag.value;
const relatedArticles = computed(() => (articles.value || []).filter((article) => article.tags?.includes(currentTag.tagName)));
useSeoMeta({ title: `#${currentTag.tagName} | ${siteConfig.name}`, description: `浏览带有 #${currentTag.tagName} 标签的文章。` });

const runtimeConfig = useRuntimeConfig();
const siteUrl = String(runtimeConfig.public.siteUrl || useRequestURL().origin).replace(/\/$/, '');
useHead({
  script: [{
    type: 'application/ld+json' as 'application/json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '首页', item: `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: '标签', item: `${siteUrl}/tags` },
        { '@type': 'ListItem', position: 3, name: currentTag.tagName, item: `${siteUrl}/tags/${id}` },
      ],
    }),
  }],
});
</script>

<template>
  <MigrationPage eyebrow="TAG" :title="`#${currentTag.tagName}`" :description="`这里收集所有与 ${currentTag.tagName} 有关的故事。`">
    <p class="collection-count">共 {{ relatedArticles.length }} 篇故事</p>
    <div v-if="relatedArticles.length" class="collection-grid">
      <ArticleCard v-for="article in relatedArticles" :key="article.id" :article="article" />
    </div>
    <p v-else class="collection-empty">这个标签还在等待第一篇故事。</p>
  </MigrationPage>
</template>

<style scoped>
.collection-count { margin: 0 0 1rem; color: #9485a3; font-size: .88rem; }
.collection-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.collection-empty { color: #9485a3; }
@media (max-width: 640px) { .collection-grid { grid-template-columns: 1fr; } }
</style>
