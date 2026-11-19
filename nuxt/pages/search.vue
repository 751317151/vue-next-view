<script setup lang="ts">
import { siteConfig } from '../../src/config/site';
import type { PublicSearchResult, PublicTag } from '../types/public';
usePublicCanonical('/search');

const route = useRoute();
const query = computed(() => String(route.query.q || '').trim());
const searchInput = ref(query.value);
const pending = ref(false);
const { data: results, status } = await useAsyncData<PublicSearchResult[]>(
  'search-results',
  () => query.value ? $fetch(`/api/search?q=${encodeURIComponent(query.value)}`) : Promise.resolve([]),
  { watch: [query] },
);
const { data: tags } = await useAsyncData<PublicTag[]>('search-tags', () => $fetch('/api/tags'));

const isSearching = computed(() => pending.value || status.value === 'pending');

watch(query, (value) => { searchInput.value = value; });
watch(searchInput, () => { pending.value = false; });

const submitSearch = async () => {
  const next = searchInput.value.trim();
  pending.value = Boolean(next) && next !== query.value;
  await navigateTo({ path: '/search', query: { q: next || undefined } });
  pending.value = false;
};

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
      <button type="submit" :disabled="isSearching">{{ isSearching ? '寻找中…' : '搜索 ✦' }}</button>
    </form>

    <div v-if="isSearching" class="search-loading" aria-live="polite">
      <span class="search-loading__star">✦</span>
      正在星海里翻找「{{ searchInput || query }}」…
    </div>

    <div v-else-if="query && results?.length" class="search-hits">
      <p class="search-hits__count">找到 {{ results.length }} 篇相关故事</p>
      <div class="search-hits__grid">
        <ArticleCard v-for="article in results" :key="article.id" :article="article" />
      </div>
    </div>

    <p v-else-if="query" class="search-empty">暂时没有找到这颗星星，换个关键词试试看吧。</p>

    <div v-else class="search-hints">
      <h2>试试这些热门标签</h2>
      <div class="search-hints__chips">
        <NuxtLink v-for="tag in tags?.slice(0, 8) || []" :key="tag.id" :to="`/tags/${tag.slug}`" class="search-hints__chip">
          #{{ tag.tagName }}
        </NuxtLink>
      </div>
    </div>
  </MigrationPage>
</template>

<style scoped>
.search-form { display: flex; gap: .6rem; }
.search-form input { min-width: 0; flex: 1; padding: .8rem 1rem; border: 1px solid rgba(185,167,255,.45); border-radius: 999px; outline: none; background: var(--bs-surface-strong); color: var(--bs-ink); }
.search-form input:focus { border-color: var(--bs-pink); box-shadow: 0 0 0 4px rgba(255,143,179,.12); }
.search-form button { padding: .8rem 1rem; border: 0; border-radius: 999px; background: linear-gradient(135deg, var(--bs-yellow), var(--bs-pink)); color: var(--bs-ink); cursor: pointer; }
.search-form button:disabled { opacity: .6; cursor: wait; }
.search-loading { display: flex; gap: .6rem; align-items: center; margin-top: 2rem; color: var(--bs-ink-soft); }
.search-loading__star { display: inline-block; color: var(--bs-peach); animation: search-spin 1.4s ease-in-out infinite; }
@keyframes search-spin { 0%, 100% { transform: rotate(-12deg) scale(1); } 50% { transform: rotate(18deg) scale(1.25); } }
@media (prefers-reduced-motion: reduce) { .search-loading__star { animation: none; } }
.search-hits { margin-top: 1.5rem; }
.search-hits__count { margin: 0 0 1rem; color: var(--bs-ink-muted); font-size: .88rem; }
.search-hits__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.search-empty { margin: 2rem 0 0; color: var(--bs-ink-muted); }
.search-hints { margin-top: 1.8rem; }
.search-hints h2 { color: var(--bs-ink); }
.search-hints__chips { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: .8rem; }
.search-hints__chip { padding: .5rem .8rem; border-radius: 999px; background: var(--bs-tint-lilac); color: var(--bs-ink-body); font-size: .85rem; text-decoration: none; transition: var(--bs-dur-quick) ease; }
.search-hints__chip:nth-child(3n) { background: rgba(158,230,208,.24); }
.search-hints__chip:nth-child(3n + 1) { background: var(--bs-tint-yellow); }
.search-hints__chip:hover { transform: translateY(-3px) rotate(-1deg); }
@media (max-width: 640px) { .search-hits__grid { grid-template-columns: 1fr; } .search-form { flex-direction: column; } }
</style>
