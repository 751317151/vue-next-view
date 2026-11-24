<script setup lang="ts">
import { siteConfig } from '../../../src/config/site';
import type { PublicArticle, PublicTag } from '../../types/public';
const route = useRoute();
const id = String(route.params.id || '');
const [{ data: tag, error: tagError }, { data: articles }, { data: allTags }] = await Promise.all([
  useAsyncData<PublicTag>(`tag-${id}`, () => $fetch<PublicTag>(`/api/tags/${encodeURIComponent(id)}`)),
  useAsyncData<PublicArticle[]>(`tag-articles-${id}`, () => $fetch<PublicArticle[]>('/api/articles')),
  useAsyncData<PublicTag[]>('public-tags', () => $fetch<PublicTag[]>('/api/tags')),
]);
if (tagError.value || !tag.value) throw createError({ statusCode: 404, statusMessage: '标签不存在' });
const currentTag = tag.value;

// Same durable-URL contract as categories: numeric ids redirect to the
// name-based slug so an old link never becomes a duplicate page.
if (id !== currentTag.slug) {
  await navigateTo(`/tags/${encodeURIComponent(currentTag.slug)}`, { redirectCode: 301 });
}

const relatedArticles = computed(() => (articles.value || []).filter((article) => article.tags?.includes(currentTag.tagName)));
const siblingTags = computed(() => (allTags.value || [])
  .filter((entry) => entry.slug !== currentTag.slug)
  .map((entry) => ({
    key: entry.id,
    label: `#${entry.tagName}`,
    to: `/tags/${encodeURIComponent(entry.slug)}`,
    count: entry.articleCount || 0,
  })));

useCollectionSeo({
  path: `/tags/${currentTag.slug}`,
  title: `#${currentTag.tagName} | ${siteConfig.name}`,
  description: `浏览带有 #${currentTag.tagName} 标签的文章。`,
  items: relatedArticles,
});

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
        { '@type': 'ListItem', position: 3, name: currentTag.tagName, item: `${siteUrl}/tags/${encodeURIComponent(currentTag.slug)}` },
      ],
    }),
  }],
});
</script>

<template>
  <MigrationPage :title="`#${currentTag.tagName}`" description="">
    <TopicShelf
      kind="tag"
      :title="`#${currentTag.tagName}`"
      :description="`这些故事都在这里留下了 #${currentTag.tagName} 的记号。`"
      :articles="relatedArticles"
      :tags="allTags || []"
      :siblings="siblingTags"
    />
  </MigrationPage>
</template>

<style scoped>
/* 内容层次由 TopicShelf 维护；这里只保留页面级的外壳。 */
</style>
