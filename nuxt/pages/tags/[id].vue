<script setup lang="ts">
import { siteConfig } from '../../../src/config/site';
import type { PublicArticle, PublicTag } from '../../types/public';
usePublicCanonical(`/tags/${id}`);

const route = useRoute();
const id = String(route.params.id || '');
const [{ data: tag, error: tagError }, { data: articles }] = await Promise.all([
  useAsyncData<PublicTag>(`tag-${id}`, () => $fetch(`/api/tags/${encodeURIComponent(id)}`)),
  useAsyncData<PublicArticle[]>(`tag-articles-${id}`, () => $fetch('/api/articles')),
]);
if (tagError.value || !tag.value) throw createError({ statusCode: 404, statusMessage: '标签不存在' });
const relatedArticles = computed(() => (articles.value || []).filter((article) => article.tags?.includes(tag.value?.tagName || '')));
useSeoMeta({ title: `#${tag.value.tagName} | ${siteConfig.name}`, description: `浏览带有 #${tag.value.tagName} 标签的文章。` });
</script>

<template>
  <MigrationPage eyebrow="TAG" :title="`#${tag.tagName}`" :description="`这里收集所有与 ${tag.tagName} 有关的故事。`">
    <div class="related-list">
      <NuxtLink v-for="article in relatedArticles" :key="article.id" :to="`/article/${article.slug}`" class="related-item">
        <strong>{{ article.articleTitle }}</strong><small>{{ article.createTime }}</small>
      </NuxtLink>
      <p v-if="relatedArticles.length === 0">这个标签还在等待第一篇故事。</p>
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
