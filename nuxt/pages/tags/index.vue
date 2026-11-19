<script setup lang="ts">
import { siteConfig } from '../../../src/config/site';
import type { PublicTag } from '../../types/public';
usePageSeo({
  path: '/tags',
  title: `标签 | ${siteConfig.name}`,
  description: '通过标签发现相关的文章和灵感。',
});
const { data: tags } = await useAsyncData<PublicTag[]>('public-tags', () => $fetch('/api/tags'));

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
  <MigrationPage eyebrow="TAGS" title="给灵感贴一枚可爱的标签。" description="标签会把不同时间写下的想法重新连接起来。">
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
.tag-cloud__summary { display: inline-flex; align-items: center; gap: .45rem; margin: 0; color: #9485a3; font-size: .86rem; }
.tag-cloud__summary span { color: #ffbd8a; }
.tag-cloud__pills { display: flex; flex-wrap: wrap; gap: .65rem; }

.tag-pill { display: inline-flex; align-items: center; gap: .4rem; padding: .55rem .9rem; border: 1px solid rgba(255,255,255,.8); border-radius: 999px; background: rgba(185,167,255,.18); color: #624d72; font-size: calc(.92rem * var(--pill-scale, 1)); text-decoration: none; box-shadow: 0 8px 20px rgba(95,66,118,.07); transition: transform 220ms cubic-bezier(.2,.9,.3,1.3), background 220ms ease, box-shadow 220ms ease; }
.tag-pill:nth-child(3n) { background: rgba(158,230,208,.26); }
.tag-pill:nth-child(3n + 1) { background: rgba(255,228,138,.32); }
.tag-pill:hover { transform: translateY(-4px) rotate(-1.5deg) scale(1.04); background: rgba(255,143,179,.26); box-shadow: 0 16px 34px rgba(95,66,118,.16); }
.tag-pill__emoji { line-height: 1; transition: transform 260ms ease; }
.tag-pill:hover .tag-pill__emoji { transform: scale(1.28) rotate(12deg); }
.tag-pill__name { font-weight: 500; }
.tag-pill small { padding: .05rem .4rem; border-radius: 999px; background: rgba(255,255,255,.62); color: #9485a3; font-size: .72rem; }

.tag-cloud__empty { margin: 0; color: #9485a3; }

@media (prefers-reduced-motion: reduce) {
  .tag-pill, .tag-pill__emoji { transition: none; }
  .tag-pill:hover { transform: none; }
}
</style>
