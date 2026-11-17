<script setup lang="ts">
import { siteConfig } from '../../src/config/site';
import type { PublicSearchResult, PublicTag } from '../types/public';
usePublicCanonical('/search');

const route = useRoute();
const query = computed(() => String(route.query.q || '').trim());
const searchInput = ref(query.value);
const { data: results } = await useAsyncData<PublicSearchResult[]>(
  'search-results',
  () => query.value ? $fetch(`/api/search?q=${encodeURIComponent(query.value)}`) : Promise.resolve([]),
  { watch: [query] },
);
const { data: tags } = await useAsyncData<PublicTag[]>('search-tags', () => $fetch('/api/tags'));

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

    <div v-if="query && results?.length" class="search-hits">
      <p class="search-hits__count">找到 {{ results.length }} 篇相关故事</p>
      <div class="search-hits__grid">
        <ArticleCard v-for="article in results" :key="article.id" :article="article" />
      </div>
    </div>

    <p v-else-if="query" class="search-empty">暂时没有找到这颗星星，换个关键词试试看吧。</p>

    <div v-else class="search-hints">
      <h2>试试这些热门标签</h2>
      <div class="search-hints__chips">
        <NuxtLink v-for="tag in tags?.slice(0, 8) || []" :key="tag.id" :to="`/tags/${tag.id}`" class="search-hints__chip">
          #{{ tag.tagName }}
        </NuxtLink>
      </div>
    </div>
  </MigrationPage>
</template>

<style scoped>
.search-form { display: flex; gap: .6rem; }
.search-form input { min-width: 0; flex: 1; padding: .8rem 1rem; border: 1px solid rgba(185,167,255,.45); border-radius: 999px; outline: none; background: rgba(255,255,255,.75); color: #392d4f; }
.search-form input:focus { border-color: #ff8fb3; box-shadow: 0 0 0 4px rgba(255,143,179,.12); }
.search-form button { padding: .8rem 1rem; border: 0; border-radius: 999px; background: linear-gradient(135deg,#ffe48a,#ffb6c8); color: #392d4f; cursor: pointer; }
.search-hits { margin-top: 1.5rem; }
.search-hits__count { margin: 0 0 1rem; color: #9485a3; font-size: .88rem; }
.search-hits__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.search-empty { margin: 2rem 0 0; color: #9485a3; }
.search-hints { margin-top: 1.8rem; }
.search-hints h2 { color: #392d4f; }
.search-hints__chips { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: .8rem; }
.search-hints__chip { padding: .5rem .8rem; border-radius: 999px; background: rgba(185,167,255,.18); color: #624d72; font-size: .85rem; text-decoration: none; transition: 180ms ease; }
.search-hints__chip:nth-child(3n) { background: rgba(158,230,208,.24); }
.search-hints__chip:nth-child(3n + 1) { background: rgba(255,228,138,.34); }
.search-hints__chip:hover { transform: translateY(-3px) rotate(-1deg); }
@media (max-width: 640px) { .search-hits__grid { grid-template-columns: 1fr; } .search-form { flex-direction: column; } }
</style>
