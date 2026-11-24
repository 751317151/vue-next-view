<script setup lang="ts">
import { siteConfig } from '../../../src/config/site';
import type { PublicArticle, PublicCategory, PublicTag } from '../../types/public';
const route = useRoute();
const id = String(route.params.id || '');
const [{ data: category, error: categoryError }, { data: articles }, { data: categories }, { data: tags }] = await Promise.all([
  useAsyncData<PublicCategory>(`category-${id}`, () => $fetch<PublicCategory>(`/api/categories/${encodeURIComponent(id)}`)),
  useAsyncData<PublicArticle[]>(`category-articles-${id}`, () => $fetch<PublicArticle[]>('/api/articles')),
  useAsyncData<PublicCategory[]>('public-categories', () => $fetch<PublicCategory[]>('/api/categories')),
  useAsyncData<PublicTag[]>('public-tags', () => $fetch<PublicTag[]>('/api/tags')),
]);
if (categoryError.value || !category.value) throw createError({ statusCode: 404, statusMessage: '分类不存在' });
const currentCategory = category.value;

// Links minted against the old index-based ids must land on the name-based
// canonical URL instead of serving duplicate content on two addresses.
if (id !== currentCategory.slug) {
  await navigateTo(`/categories/${encodeURIComponent(currentCategory.slug)}`, { redirectCode: 301 });
}

const relatedArticles = computed(() => (articles.value || []).filter((article) => article.category === currentCategory.categoryName));
const siblingRooms = computed(() => (categories.value || [])
  .filter((entry) => entry.slug !== currentCategory.slug)
  .map((entry) => ({
    key: entry.id,
    label: entry.categoryName,
    to: `/categories/${encodeURIComponent(entry.slug)}`,
    count: entry.articleCount || 0,
  })));

useCollectionSeo({
  path: `/categories/${currentCategory.slug}`,
  title: `${currentCategory.categoryName} | ${siteConfig.name}`,
  description: currentCategory.description || `浏览${currentCategory.categoryName}相关的文章。`,
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
        { '@type': 'ListItem', position: 2, name: '分类', item: `${siteUrl}/categories` },
        { '@type': 'ListItem', position: 3, name: currentCategory.categoryName, item: `${siteUrl}/categories/${encodeURIComponent(currentCategory.slug)}` },
      ],
    }),
  }],
});
</script>

<template>
  <MigrationPage :title="currentCategory.categoryName" description="">
    <TopicShelf
      kind="category"
      :title="currentCategory.categoryName"
      :description="currentCategory.description || `这些故事都住在 ${currentCategory.categoryName} 这间小房间里。`"
      :articles="relatedArticles"
      :tags="tags || []"
      :siblings="siblingRooms"
    />
  </MigrationPage>
</template>

<style scoped>
/* 内容层次由 TopicShelf 维护；这里只保留页面级的外壳。 */
</style>
