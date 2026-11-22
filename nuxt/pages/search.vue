<script setup lang="ts">
import { siteConfig } from '../../src/config/site';
import type { PublicSearchResult, PublicTag } from '../types/public';
usePublicCanonical('/search');

const route = useRoute();
const query = computed(() => String(route.query.q || '').trim());
const searchInput = ref(query.value);
const pending = ref(false);
const retrying = ref(false);
const { data: results, status, error, refresh } = await useAsyncData<PublicSearchResult[]>(
  'search-results',
  (_, { signal }) => query.value ? $fetch('/api/search', { query: { q: query.value }, signal }) : Promise.resolve([]),
  { watch: [query] },
);
const { data: tags } = await useAsyncData<PublicTag[]>('search-tags', () => $fetch('/api/tags'));

const isSearching = computed(() => pending.value || retrying.value || status.value === 'pending');
// `showError` is a Nuxt auto-imported helper, so a local ref with the same
// name would shadow it and always look like a function in the template.
const hasSearchError = computed(() => Boolean(query.value && (retrying.value || (!isSearching.value && error.value))));
const showResults = computed(() => Boolean(query.value && !isSearching.value && status.value === 'success'));
const statusRegion = ref<HTMLElement | null>(null);
const retryButton = ref<HTMLButtonElement | null>(null);

watch(query, (value) => { searchInput.value = value; });

const retrySearch = async () => {
  if (!query.value || isSearching.value) return;
  retrying.value = true;
  try {
    await refresh();
  } finally {
    // The retry button disappears on success. Keep keyboard focus near the result.
    if (status.value === 'success' && document.activeElement === retryButton.value) {
      statusRegion.value?.focus();
    }
    retrying.value = false;
  }
};

const submitSearch = async () => {
  const next = searchInput.value.trim();
  if (next === query.value) {
    if (error.value) await retrySearch();
    return;
  }
  pending.value = Boolean(next);
  try {
    await navigateTo({ path: '/search', query: { q: next || undefined } });
  } finally {
    pending.value = false;
  }
};

useSeoMeta({
  title: computed(() => query.value ? `搜索：${query.value} | ${siteConfig.name}` : `搜索 | ${siteConfig.name}`),
  description: computed(() => query.value ? `搜索与“${query.value}”相关的文章。` : '搜索生活倒影中的文章、分类和标签。'),
  robots: 'noindex, follow',
});
</script>

<template>
  <MigrationPage eyebrow="SEARCH" :title="query ? `搜索「${query}」` : '搜索'" description="">
    <form class="search-form" role="search" @submit.prevent="submitSearch">
      <input v-model="searchInput" type="search" name="q" placeholder="输入关键词，例如 Vue、生活、动画" aria-label="搜索关键词" />
      <button type="submit" :disabled="isSearching">{{ isSearching ? '寻找中…' : '搜索' }}</button>
    </form>

    <div :class="{ 'search-error': hasSearchError }">
      <span v-if="hasSearchError" class="search-error__mark" aria-hidden="true">☁</span>
      <div ref="statusRegion" class="search-status" role="status" aria-live="polite" aria-atomic="true" tabindex="-1">
        <template v-if="hasSearchError">
          <strong>星云遮住了信号</strong>
          <p>{{ retrying ? '正在重新连接…' : '搜索暂时连不上，稍等片刻再试。' }}</p>
        </template>
        <p v-else-if="isSearching" class="search-loading">
          <span class="search-loading__star" aria-hidden="true">✦</span>
          正在星海里翻找「{{ pending ? searchInput : query }}」…
        </p>
        <p v-else-if="showResults" :class="results?.length ? 'search-hits__count' : 'search-empty'">
          {{ results?.length ? `找到 ${results.length} 篇相关故事` : '暂时没有找到这颗星星，换个关键词试试看吧。' }}
        </p>
      </div>
      <button v-if="hasSearchError" ref="retryButton" type="button" class="search-error__retry" :aria-disabled="retrying" @click="retrySearch">
        <span aria-hidden="true">↻</span> {{ retrying ? '连接中…' : '再试一次' }}
      </button>
    </div>

    <div v-if="showResults && results?.length" class="search-hits__grid">
      <ArticleCard v-for="article in results" :key="article.id" :article="article" />
    </div>

    <div v-else-if="!query && !isSearching" class="search-hints">
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
.search-form input { box-sizing: border-box; min-width: 0; min-height: 44px; flex: 1; padding: .65rem 1rem; border: 1px solid rgba(185,167,255,.45); border-radius: 999px; background: var(--bs-surface-strong); color: var(--bs-ink); font: inherit; }
.search-form input:focus { border-color: var(--bs-pink); box-shadow: 0 0 0 4px rgba(255,143,179,.12); }
.search-form button { min-height: 44px; padding: .65rem 1rem; border: 0; border-radius: 999px; background: linear-gradient(135deg, var(--bs-yellow), var(--bs-pink)); color: var(--bs-ink-on-accent); font: inherit; cursor: pointer; }
.search-form button:disabled { opacity: .6; cursor: wait; }
.search-form :focus-visible, .search-error__retry:focus-visible, .search-hints__chip:focus-visible, .search-status:focus-visible { outline: 2px solid var(--bs-ink-line); outline-offset: 3px; }
.search-loading { display: flex; gap: .6rem; align-items: center; margin: 2rem 0 0; color: var(--bs-ink-soft); overflow-wrap: anywhere; }
.search-loading__star { display: inline-block; color: var(--bs-peach); animation: search-spin 1.4s ease-in-out infinite; }
@keyframes search-spin { 0%, 100% { transform: rotate(-12deg) scale(1); } 50% { transform: rotate(18deg) scale(1.25); } }
html.bs-reduced-motion .search-loading__star { animation: none; }
@media (prefers-reduced-motion: reduce) { .search-loading__star { animation: none; } }
.search-error { display: flex; flex-wrap: wrap; align-items: center; gap: .55rem 1rem; margin-top: 1.5rem; padding: .75rem 1rem; border-inline-start: 3px solid var(--bs-lilac); border-radius: .65rem; background: var(--bs-tint-lilac); }
.search-error__mark { color: var(--bs-link); font-size: 1.45rem; line-height: 1; }
.search-error .search-status { flex: 1; min-width: 8rem; }
.search-error .search-status strong { color: var(--bs-ink); }
.search-error .search-status p { margin: 0; color: var(--bs-ink-body); font-size: .9rem; }
.search-error__retry { display: inline-flex; align-items: center; gap: .35rem; min-height: 44px; padding: .3rem .75rem; border: 1px dashed var(--bs-link); border-radius: 999px; background: var(--bs-surface-strong); color: var(--bs-ink); font: inherit; cursor: pointer; transition: background-color var(--bs-dur-quick) ease; }
.search-error__retry:not([aria-disabled='true']):hover { background: var(--bs-tint-yellow); }
.search-error__retry[aria-disabled='true'] { cursor: wait; }
.search-hits__count { margin: 1.5rem 0 1rem; color: var(--bs-ink-soft); font-size: .88rem; }
.search-hits__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.search-empty { margin: 2rem 0 0; color: var(--bs-ink-soft); }
.search-hints { margin-top: 1.8rem; }
.search-hints h2 { color: var(--bs-ink); }
.search-hints__chips { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: .8rem; }
.search-hints__chip { display: inline-flex; align-items: center; box-sizing: border-box; min-height: 44px; padding: .4rem .8rem; border-radius: 999px; background: var(--bs-tint-lilac); color: var(--bs-ink-body); font-size: .85rem; text-decoration: none; transition: var(--bs-dur-quick) ease; }
.search-hints__chip:nth-child(3n) { background: rgba(158,230,208,.24); }
.search-hints__chip:nth-child(3n + 1) { background: var(--bs-tint-yellow); }
.search-hints__chip:hover { transform: translateY(-3px) rotate(-1deg); }
@media (max-width: 640px) { .search-hits__grid { grid-template-columns: 1fr; } .search-form { flex-direction: column; } }
</style>
