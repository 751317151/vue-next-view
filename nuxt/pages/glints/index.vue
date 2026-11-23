<script setup lang="ts">
import { siteConfig } from '../../../src/config/site';
import type { PublicGlint } from '../../types/public';

const { data: glints } = await useAsyncData<PublicGlint[]>(
  'public-glints',
  () => $fetch<PublicGlint[]>('/api/glints'),
);

useCollectionSeo({
  path: '/glints',
  title: `微光 | ${siteConfig.name}`,
  description: '生活里那些值得记一笔的小事：一段路、一句话、一束光。',
  items: () => (glints.value || []).map((glint) => ({
    articleTitle: glint.title,
    slug: glint.slug,
    path: glint.path || `/glints#${encodeURIComponent(glint.slug)}`,
  })),
});

const total = computed(() => (glints.value || []).length);
const view = ref<'calendar' | 'list'>('calendar');
</script>

<template>
  <div class="glints-page">
    <header class="glints-page__head">
      <span class="glints-page__lantern" aria-hidden="true">
        <i></i><b>✦</b>
      </span>
      <div>
        <h1>微光</h1>
        <p class="glints-page__lede">不必每件事都写成文章。有些日子，记住一束光就够了。</p>
      </div>
      <span class="glints-page__count">{{ total }} 则</span>
    </header>

    <template v-if="glints?.length">
      <div class="glints-page__view" role="group" aria-label="微光浏览方式">
        <button
          type="button"
          class="glints-page__view-btn"
          :class="{ 'is-active': view === 'calendar' }"
          :aria-pressed="view === 'calendar'"
          @click="view = 'calendar'"
        >
          <span aria-hidden="true">🗓</span> 拾光年历
        </button>
        <button
          type="button"
          class="glints-page__view-btn"
          :class="{ 'is-active': view === 'list' }"
          :aria-pressed="view === 'list'"
          @click="view = 'list'"
        >
          <span aria-hidden="true">📜</span> 纸带清单
        </button>
      </div>

      <GlintCalendar v-if="view === 'calendar'" :glints="glints" />
      <GlintStrip v-else :glints="glints" :limit="999" />
    </template>
    <p v-else class="glints-page__empty">第一束微光还在路上。</p>
  </div>
</template>

<style scoped>
.glints-page { max-width: 780px; margin: 0 auto; padding: 1.6rem 0 6rem; }

/* 页头是一盏挂在纸页边上的小灯：不是大标题海报，只是一个打开手账的动作。 */
.glints-page__head {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.4rem;
  padding: 1rem 1.15rem;
  border: 1px solid var(--bs-border);
  border-radius: 1.4rem;
  background: var(--bs-paper-strong);
  box-shadow: var(--bs-shadow-soft);
}
.glints-page__lantern {
  position: relative;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 2.8rem;
  height: 3.2rem;
  border: 1.5px solid var(--bs-ink-line);
  border-radius: 45% 45% 38% 38% / 30% 30% 55% 55%;
  background: radial-gradient(circle at 50% 35%, var(--bs-yellow), var(--bs-peach) 72%);
  box-shadow: 3px 3px 0 var(--bs-ink-line);
  transform: rotate(-4deg);
}
.glints-page__lantern i { position: absolute; top: -.5rem; width: 1.1rem; height: .45rem; border: 1.5px solid var(--bs-ink-line); border-radius: 999px; background: var(--bs-paper); }
.glints-page__lantern b { color: var(--bs-ink-on-accent); font-size: 1.1rem; }

.glints-page__head h1 { margin: 0; color: var(--bs-ink); font-size: clamp(1.5rem, 3vw, 1.95rem); line-height: 1.25; }
.glints-page__lede { margin: .2rem 0 0; color: var(--bs-ink-soft); font-size: .88rem; line-height: 1.7; }
.glints-page__count { flex: 0 0 auto; align-self: flex-start; padding: .1rem .5rem; border: 1px dashed var(--bs-border-accent); border-radius: 999px; color: var(--bs-accent-ink); font-size: .7rem; }
.glints-page__empty { padding: 2rem 0; color: var(--bs-ink-muted); text-align: center; }

/* 两种翻看方式：年历与纸带。选中像一枚被指甲轻轻按下的贴纸。 */
.glints-page__view { display: inline-flex; gap: .25rem; margin-bottom: .85rem; padding: .22rem; border: 1px solid var(--bs-border); border-radius: 999px; background: var(--bs-surface-soft); }
.glints-page__view-btn { display: inline-flex; gap: .3rem; align-items: center; padding: .32rem .7rem; border: 1px solid transparent; border-radius: 999px; background: transparent; color: var(--bs-ink-soft); font: inherit; font-size: .75rem; cursor: pointer; transition: transform var(--bs-dur-quick) var(--bs-ease-pop), background var(--bs-dur-quick) ease, color var(--bs-dur-quick) ease, border-color var(--bs-dur-quick) ease; }
.glints-page__view-btn:hover { color: var(--bs-ink); transform: translateY(-1px); }
.glints-page__view-btn.is-active { border-color: var(--bs-border-accent); background: var(--bs-tint-yellow); color: var(--bs-accent-ink); box-shadow: 1.5px 1.5px 0 var(--bs-ink-line); }
.glints-page__view-btn:focus-visible { outline: 3px solid rgba(185, 167, 255, .72); outline-offset: 2px; }

@media (max-width: 560px) {
  .glints-page { padding-top: 1rem; }
  .glints-page__head { align-items: flex-start; padding: .9rem; }
  .glints-page__count { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .glints-page__lantern { transform: none; }
}
</style>
