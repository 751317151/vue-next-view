<script setup lang="ts">
import { siteConfig } from '../../../src/config/site';
import type { PublicArticle, PublicCategory } from '../../types/public';
const route = useRoute();
const id = String(route.params.id || '');
usePublicCanonical(`/categories/${id}`);
const [{ data: category, error: categoryError }, { data: articles }] = await Promise.all([
  useAsyncData<PublicCategory>(`category-${id}`, () => $fetch(`/api/categories/${encodeURIComponent(id)}`)),
  useAsyncData<PublicArticle[]>(`category-articles-${id}`, () => $fetch('/api/articles')),
]);
if (categoryError.value || !category.value) throw createError({ statusCode: 404, statusMessage: '分类不存在' });
const currentCategory = category.value;
const relatedArticles = computed(() => (articles.value || []).filter((article) => article.category === currentCategory.categoryName));
useSeoMeta({ title: `${currentCategory.categoryName} | ${siteConfig.name}`, description: currentCategory.description || `浏览${currentCategory.categoryName}相关的文章。` });

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
        { '@type': 'ListItem', position: 3, name: currentCategory.categoryName, item: `${siteUrl}/categories/${id}` },
      ],
    }),
  }],
});
</script>

<template>
  <MigrationPage eyebrow="CATEGORY" :title="currentCategory.categoryName" :description="currentCategory.description || '沿着这个主题继续探索。'">
    <p class="collection-count">共 {{ relatedArticles.length }} 篇故事</p>
    <div v-if="relatedArticles.length" class="collection-grid">
      <ArticleCard v-for="article in relatedArticles" :key="article.id" :article="article" />
    </div>
    <p v-else class="collection-empty">这个房间还在等待第一篇故事。</p>
  </MigrationPage>
</template>

<style scoped>
.collection-count { margin: 0 0 1rem; color: #9485a3; font-size: .88rem; }
.collection-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.collection-empty { color: #9485a3; }
@media (max-width: 640px) { .collection-grid { grid-template-columns: 1fr; } }
</style>
