<script setup lang="ts">
import { siteConfig } from '../../src/config/site';
import type { PublicArticle } from '../types/public';
usePublicCanonical('/archive');
useSeoMeta({ title: `归档 | ${siteConfig.name}`, description: '按时间浏览生活倒影的文章归档。' });
const { data: articles } = await useAsyncData<PublicArticle[]>('archive-articles', () => $fetch('/api/articles'));
</script>
<template>
  <MigrationPage eyebrow="ARCHIVE" title="把走过的路，收进时间胶囊。" description="按时间整理文章、实验和那些值得回看的小发现。">
    <div class="archive-list">
      <NuxtLink v-for="article in articles || []" :key="article.id" :to="`/article/${article.slug}`" class="archive-item">
        <span>{{ article.createTime }}</span>
        <strong>{{ article.articleTitle }}</strong>
        <small>{{ article.category || '随笔' }}</small>
      </NuxtLink>
    </div>
  </MigrationPage>
</template>

<style scoped>
.archive-list { display: grid; gap: .6rem; }
.archive-item { display: grid; grid-template-columns: 8rem 1fr auto; gap: .75rem; align-items: center; padding: .9rem 0; border-bottom: 1px dashed rgba(185,167,255,.45); color: #4b3d60; text-decoration: none; }
.archive-item:hover strong { color: #e1799c; }
.archive-item span, .archive-item small { color: #9485a3; font-size: .82rem; }
@media (max-width: 640px) { .archive-item { grid-template-columns: 1fr; gap: .2rem; } }
</style>
