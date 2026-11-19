<script setup lang="ts">
import { siteConfig } from '../../../src/config/site';
import type { PublicCategory } from '../../types/public';
usePageSeo({
  path: '/categories',
  title: `分类 | ${siteConfig.name}`,
  description: '按主题探索生活倒影中的技术文章。',
});
const { data: categories } = await useAsyncData<PublicCategory[]>('public-categories', () => $fetch('/api/categories'));

const totalArticles = computed(() => (categories.value || []).reduce((sum, item) => sum + (item.articleCount || 0), 0));

// Each room gets its own doorway colour and a matching little mascot.
const ROOMS = [
  { emoji: '🧁', tint: 'rgba(255, 143, 179, .22)', ink: 'var(--bs-accent-ink)' },
  { emoji: '🍵', tint: 'rgba(158, 230, 208, .24)', ink: '#4f6d67' },
  { emoji: '🌙', tint: 'rgba(185, 167, 255, .24)', ink: '#6b5a9e' },
  { emoji: '✨', tint: 'rgba(255, 228, 138, .32)', ink: '#8a6a2f' },
];
const roomOf = (index: number) => ROOMS[index % ROOMS.length]!;
</script>

<template>
  <MigrationPage eyebrow="CATEGORIES" title="每个兴趣，都有自己的小房间。" description="从前端、工程到创意实验，按主题进入不同的探索路径。">
    <div class="rooms">
      <p class="rooms__summary">
        <span aria-hidden="true">🏠</span>
        {{ (categories || []).length }} 间小房间，收着 {{ totalArticles }} 篇文章
      </p>
      <div class="rooms__grid">
        <NuxtLink
          v-for="(category, index) in categories || []"
          :key="category.id"
          :to="`/categories/${category.slug}`"
          class="room"
          :style="{ '--room-tint': roomOf(index).tint, '--room-ink': roomOf(index).ink }"
        >
          <span class="room__door" aria-hidden="true">
            <b>{{ roomOf(index).emoji }}</b>
            <i class="room__knob"></i>
          </span>
          <span class="room__text">
            <strong>{{ category.categoryName }}</strong>
            <small>{{ category.articleCount || 0 }} 篇文章</small>
            <span>{{ category.description || '等待更多故事入住。' }}</span>
          </span>
          <span class="room__arrow" aria-hidden="true">→</span>
        </NuxtLink>
      </div>
      <p v-if="!(categories || []).length" class="rooms__empty">小房间还在装修中，很快就开门。</p>
    </div>
  </MigrationPage>
</template>

<style scoped>
.rooms { display: grid; gap: 1.1rem; }
.rooms__summary { display: inline-flex; align-items: center; gap: .45rem; margin: 0; color: var(--bs-ink-muted); font-size: .86rem; }
.rooms__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .85rem; }

.room {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: .9rem;
  align-items: center;
  padding: 1rem;
  border: 1px solid var(--bs-border);
  border-radius: 1.25rem;
  background: var(--bs-surface);
  color: var(--bs-ink-body);
  text-decoration: none;
  overflow: hidden;
  transition: transform var(--bs-dur-base) var(--bs-ease-pop), box-shadow var(--bs-dur-base) ease, border-color var(--bs-dur-base) ease;
}
.room::before {
  position: absolute;
  inset: auto auto -3rem -2rem;
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  background: radial-gradient(circle, var(--room-tint), transparent 70%);
  content: "";
  opacity: .9;
  transition: transform var(--bs-dur-mid) ease;
}
.room:hover { transform: translateY(-5px) rotate(-.4deg); border-color: rgba(255, 143, 179, .42); box-shadow: var(--bs-shadow-hover); }
.room:hover::before { transform: scale(1.35) translate(6px, -6px); }

.room__door {
  position: relative;
  display: grid;
  place-items: center;
  width: 3.1rem;
  height: 3.6rem;
  border-radius: 1.5rem 1.5rem .35rem .35rem;
  background: linear-gradient(160deg, var(--room-tint), rgba(255, 255, 255, .7));
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .8);
  transform-origin: 0 100%;
  transition: transform var(--bs-dur-mid) ease;
}
.room:hover .room__door { transform: perspective(220px) rotateY(-18deg); }
.room__door b { font-size: 1.4rem; line-height: 1; }
.room__knob { position: absolute; right: .42rem; top: 55%; width: .3rem; height: .3rem; border-radius: 50%; background: var(--room-ink); opacity: .7; }

.room__text { display: grid; gap: .12rem; min-width: 0; }
.room__text strong { color: var(--bs-ink); font-size: 1.02rem; }
.room__text small { color: var(--room-ink); font-size: .76rem; letter-spacing: .04em; }
.room__text span { display: -webkit-box; overflow: hidden; color: var(--bs-ink-muted); font-size: .84rem; line-height: 1.6; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }

.room__arrow { color: var(--room-ink); font-size: 1.05rem; opacity: 0; transform: translateX(-6px); transition: var(--bs-dur-base) ease; }
.room:hover .room__arrow { opacity: .85; transform: translateX(0); }

.rooms__empty { margin: 0; color: var(--bs-ink-muted); }

@media (max-width: 640px) { .rooms__grid { grid-template-columns: 1fr; } }
@media (prefers-reduced-motion: reduce) {
  .room, .room::before, .room__door, .room__arrow { transition: none; }
  .room:hover { transform: none; }
  .room:hover .room__door { transform: none; }
}
</style>
