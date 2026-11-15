<script setup lang="ts">
import { siteConfig } from '../../../src/config/site';
import type { PublicCategory } from '../../types/public';
usePublicCanonical('/categories');
useSeoMeta({ title: `分类 | ${siteConfig.name}`, description: '按主题探索生活倒影中的技术文章。' });
const { data: categories } = await useAsyncData<PublicCategory[]>('public-categories', () => $fetch('/api/categories'));
</script>
<template>
  <MigrationPage eyebrow="CATEGORIES" title="每个兴趣，都有自己的小房间。" description="从前端、工程到创意实验，按主题进入不同的探索路径。">
    <div class="taxonomy-grid">
      <NuxtLink v-for="category in categories || []" :key="category.id" :to="`/categories/${category.id}`" class="taxonomy-card">
        <strong>{{ category.categoryName }}</strong>
        <span>{{ category.articleCount || 0 }} 篇文章</span>
        <small>{{ category.description || '等待更多故事入住。' }}</small>
      </NuxtLink>
    </div>
  </MigrationPage>
</template>

<style scoped>
.taxonomy-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .8rem; }
.taxonomy-card { display: grid; gap: .35rem; padding: 1.1rem; border-radius: 1.1rem; background: rgba(255,255,255,.58); color: #4b3d60; text-decoration: none; transition: 180ms ease; }
.taxonomy-card:hover { transform: translateY(-4px); background: rgba(255,228,138,.34); }
.taxonomy-card strong { color: #392d4f; }
.taxonomy-card span, .taxonomy-card small { color: #9485a3; }
@media (max-width:640px) { .taxonomy-grid { grid-template-columns: 1fr; } }
</style>
