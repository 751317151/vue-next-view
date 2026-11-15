<script setup lang="ts">
import { siteConfig } from '../../src/config/site';
import type { PublicSearchResult } from '../types/public';
usePublicCanonical('/search');

const route = useRoute();
const query = computed(() => String(route.query.q || '').trim());
const searchInput = ref(query.value);
const { data: results } = await useAsyncData<PublicSearchResult[]>(
  'search-results',
  () => query.value ? $fetch(`/api/search?q=${encodeURIComponent(query.value)}`) : Promise.resolve([]),
  { watch: [query] },
);

watch(query, (value) => { searchInput.value = value; });
const submitSearch = () => navigateTo({ path: '/search', query: { q: searchInput.value.trim() || undefined } });

useSeoMeta({
  title: computed(() => query.value ? `搜索：${query.value} | ${siteConfig.name}` : `搜索 | ${siteConfig.name}`),
  description: computed(() => query.value ? `搜索与“${query.value}”相关的文章。` : '搜索生活倒影中的文章、分类和标签。'),
  robots: 'noindex, follow',
});
</script>

<template>
  <MigrationPage eyebrow="SEARCH" :title="query ? `找到关于「${query}」的故事` : '搜索一颗灵感星星'" description="从文章标题、摘要、分类和标签中寻找你想继续探索的方向。">
    <form class="search-form" @submit.prevent="submitSearch">
      <input v-model="searchInput" name="q" placeholder="输入关键词，例如 Vue、生活、动画" aria-label="搜索关键词" />
      <button type="submit">搜索 ✦</button>
    </form>
    <div v-if="query && results?.length" class="search-results">
      <NuxtLink v-for="article in results" :key="article.id" :to="`/article/${article.slug}`" class="search-result">
        <span>{{ article.category || '随笔' }}</span>
        <h2>{{ article.articleTitle }}</h2>
        <p>{{ article.articleContent }}</p>
      </NuxtLink>
    </div>
    <p v-else-if="query" class="search-empty">暂时没有找到这颗星星，换个关键词试试看吧。</p>
    <p v-else class="search-empty">输入关键词，开始一场小小的探索。</p>
  </MigrationPage>
</template>

<style scoped>
.search-form { display: flex; gap: .6rem; }
.search-form input { min-width: 0; flex: 1; padding: .8rem 1rem; border: 1px solid rgba(185,167,255,.45); border-radius: 999px; outline: none; background: rgba(255,255,255,.75); color: #392d4f; }
.search-form input:focus { border-color: #ff8fb3; box-shadow: 0 0 0 4px rgba(255,143,179,.12); }
.search-form button { padding: .8rem 1rem; border: 0; border-radius: 999px; background: linear-gradient(135deg,#ffe48a,#ffb6c8); color: #392d4f; cursor: pointer; }
.search-results { display: grid; gap: .8rem; margin-top: 1.5rem; }
.search-result { display: block; padding: 1rem; border-radius: 1.1rem; background: rgba(255,255,255,.6); color: #4b3d60; text-decoration: none; transition: 180ms ease; }
.search-result:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(95,66,118,.12); }
.search-result span { color: #b1768c; font-size: .75rem; }
.search-result h2 { margin: .35rem 0; color: #392d4f; font-size: 1.1rem; }
.search-result p { margin: 0; color: #746b86; line-height: 1.6; }
.search-empty { margin: 2rem 0 0; color: #9485a3; }
@media (max-width: 520px) { .search-form { flex-direction: column; } }
</style>
