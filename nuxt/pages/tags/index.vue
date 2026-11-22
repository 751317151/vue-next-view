<script setup lang="ts">
import { siteConfig } from '../../../src/config/site';
import type { PublicTag } from '../../types/public';
usePageSeo({
  path: '/tags',
  title: `标签 | ${siteConfig.name}`,
  description: '通过标签发现相关的文章和灵感。',
});
const { data: tags } = await useAsyncData<PublicTag[]>(
  'public-tags',
  () => $fetch<PublicTag[]>('/api/tags'),
);

const sorted = computed(() => [...(tags.value || [])].sort((a, b) => (b.articleCount || 0) - (a.articleCount || 0)));
const maxCount = computed(() => Math.max(1, ...sorted.value.map((tag) => tag.articleCount || 0)));
const totalTagged = computed(() => sorted.value.reduce((sum, tag) => sum + (tag.articleCount || 0), 0));

// Scale each pill so popular tags feel heavier while every pill stays readable.
const weightOf = (count?: number) => {
  const ratio = Math.min(1, (count || 0) / maxCount.value);
  return Number((0.92 + ratio * 0.42).toFixed(2));
};
const emojis = ['🍓', '🌙', '🍵', '✨', '🫧', '🌷', '⭐', '🧁', '🌿', '🎐'];
</script>

<template>
  <MigrationPage title="标签" description="">
    <div class="tag-cloud">
      <p class="tag-cloud__summary">
        <span aria-hidden="true">✦</span>
        共 {{ sorted.length }} 枚标签，串起 {{ totalTagged }} 次相遇
      </p>
      <div class="tag-cloud__pills">
        <NuxtLink
          v-for="(tag, index) in sorted"
          :key="tag.id"
          :to="`/tags/${tag.slug}`"
          class="tag-pill"
          :style="{ '--pill-scale': weightOf(tag.articleCount) }"
        >
          <span class="tag-pill__emoji" aria-hidden="true">{{ emojis[index % emojis.length] }}</span>
          <span class="tag-pill__name">#{{ tag.tagName }}</span>
          <small>{{ tag.articleCount || 0 }}</small>
        </NuxtLink>
      </div>
      <p v-if="!sorted.length" class="tag-cloud__empty">还没有标签，等第一枚灵感贴上墙。</p>
    </div>
  </MigrationPage>
</template>

<style scoped>
.tag-cloud { display: grid; gap: 1.1rem; }
.tag-cloud__summary { display: inline-flex; align-items: center; gap: .45rem; margin: 0; color: var(--bs-ink-muted); font-size: .86rem; }
.tag-cloud__summary span { color: var(--bs-peach); }
.tag-cloud__pills { display: flex; flex-wrap: wrap; gap: .65rem; }

.tag-pill { display: inline-flex; align-items: center; gap: .4rem; padding: .5rem .9rem; border: 1.5px solid var(--bs-ink-line, #392d4f); border-radius: 999px; background: var(--bs-tint-lilac); color: var(--bs-ink-body); font-size: calc(.92rem * var(--pill-scale, 1)); text-decoration: none; box-shadow: 2.5px 2.5px 0 var(--bs-ink-line, #392d4f); transition: transform var(--bs-dur-base) var(--bs-ease-pop), background var(--bs-dur-base) ease, box-shadow var(--bs-dur-base) ease; }
.tag-pill:nth-child(3n) { background: rgba(158,230,208,.3); }
.tag-pill:nth-child(3n + 1) { background: rgba(255,228,138,.38); }
.tag-pill:hover { transform: translate(-2px, -4px) rotate(-2deg) scale(1.04); background: rgba(255,143,179,.34); box-shadow: 5px 6px 0 var(--bs-ink-line, #392d4f); }
.tag-pill__emoji { line-height: 1; transition: transform var(--bs-dur-base) ease; }
.tag-pill:hover .tag-pill__emoji { transform: scale(1.28) rotate(12deg); }
.tag-pill__name { font-weight: 500; }
.tag-pill small { padding: .05rem .4rem; border-radius: 999px; background: var(--bs-surface); color: var(--bs-ink-muted); font-size: .72rem; }

.tag-cloud__empty { margin: 0; color: var(--bs-ink-muted); }

@media (prefers-reduced-motion: reduce) {
  .tag-pill, .tag-pill__emoji { transition: none; }
  .tag-pill:hover { transform: none; }
}
</style>
