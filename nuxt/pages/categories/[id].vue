<script setup lang="ts">
import { siteConfig } from '../../../src/config/site';
import type { PublicArticle, PublicCategory } from '../../types/public';
usePublicCanonical(`/categories/${id}`);

const route = useRoute();
const id = String(route.params.id || '');
const [{ data: category, error: categoryError }, { data: articles }] = await Promise.all([
  useAsyncData<PublicCategory>(`category-${id}`, () => $fetch(`/api/categories/${encodeURIComponent(id)}`)),
  useAsyncData<PublicArticle[]>(`category-articles-${id}`, () => $fetch('/api/articles')),
]);
if (categoryError.value || !category.value) throw createError({ statusCode: 404, statusMessage: '分类不存在' });
const relatedArticles = computed(() => (articles.value || []).filter((article) => article.category === category.value?.categoryName));
useSeoMeta({ title: `${category.value.categoryName} | ${siteConfig.name}`, description: category.value.description || `浏览${category.value.categoryName}相关的文章。` });
</script>

<template>
  <MigrationPage eyebrow="CATEGORY" :title="category.categoryName" :description="category.description || '沿着这个主题继续探索。'">
    <div class="related-list">
      <NuxtLink v-for="article in relatedArticles" :key="article.id" :to="`/article/${article.slug}`" class="related-item">
        <strong>{{ article.articleTitle }}</strong><small>{{ article.createTime }}</small>
      </NuxtLink>
      <p v-if="relatedArticles.length === 0">这个房间还在等待第一篇故事。</p>
    </div>
  </MigrationPage>
</template>

<style scoped>
.related-list { display: grid; gap: .7rem; }
.related-item { display: flex; justify-content: space-between; gap: 1rem; padding: .9rem 0; border-bottom: 1px dashed rgba(185,167,255,.45); color: #4b3d60; text-decoration: none; }
.related-item:hover strong { color: #e1799c; }
.related-item small { color: #9485a3; white-space: nowrap; }
@media (max-width: 640px) { .related-item { flex-direction: column; gap: .25rem; } }
</style>
