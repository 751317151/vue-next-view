<script setup lang="ts">
import { siteConfig } from '../../../src/config/site';
import type { PublicGlint } from '../../types/public';

const route = useRoute();
const slug = String(route.params.slug || '');

// 微光之间通过前后链接互相跳转；强制按完整路径重建页面，
// 避免复用组件时仍显示上一条微光的标题和正文。
definePageMeta({ key: (current) => current.fullPath });

if (!slug) {
  throw createError({ statusCode: 404, statusMessage: '微光不存在' });
}

const { data: glint, error } = await useAsyncData<PublicGlint>(
  `public-glint-${slug}`,
  () => $fetch<PublicGlint>(`/api/glints/${encodeURIComponent(slug)}`),
);

if (error.value || !glint.value) {
  throw createError({ statusCode: 404, statusMessage: '微光不存在' });
}

const item = glint.value;
const canonicalPath = `/glints/${encodeURIComponent(item.slug)}`;
const runtimeConfig = useRuntimeConfig();
const requestUrl = useRequestURL();
const origin = String(runtimeConfig.public.siteUrl || '').replace(/\/$/, '') || requestUrl.origin;
const canonical = new URL(canonicalPath, origin).toString();
const description = item.summary || item.text.slice(0, 150);
const image = new URL('/bg1.jpg', origin).toString();

usePageSeo({
  path: canonicalPath,
  title: `${item.title} | 微光 | ${siteConfig.name}`,
  description,
  type: 'article',
  image,
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'SocialMediaPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    headline: item.title,
    description,
    image,
    articleBody: item.text,
    datePublished: item.date,
    dateModified: item.date,
    inLanguage: siteConfig.locale,
    author: { '@type': 'Person', name: siteConfig.author },
    publisher: { '@type': 'Person', name: siteConfig.author },
    isPartOf: {
      '@type': 'CollectionPage',
      name: '微光',
      url: new URL('/glints', origin).toString(),
    },
  },
});

useSeoMeta({
  articlePublishedTime: item.date,
  articleModifiedTime: item.date,
  articleAuthor: [siteConfig.author],
  ogImageAlt: item.title,
});

const dayLabel = (value: string) => {
  const match = /^\d{4}-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${Number(match[1])} 月 ${Number(match[2])} 日` : value;
};

const { data: allGlints } = await useAsyncData<PublicGlint[]>(
  'public-glints',
  () => $fetch<PublicGlint[]>('/api/glints'),
);
const neighbours = computed(() => {
  const list = allGlints.value || [];
  const index = list.findIndex((entry) => entry.slug === item.slug);
  return index < 0 ? { newer: null, older: null } : {
    newer: list[index - 1] || null,
    older: list[index + 1] || null,
  };
});

const copied = ref(false);
let copyTimer = 0;
const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(canonical);
    copied.value = true;
    window.clearTimeout(copyTimer);
    copyTimer = window.setTimeout(() => { copied.value = false; }, 1800);
  } catch {
    window.location.href = canonical;
  }
};

onBeforeUnmount(() => window.clearTimeout(copyTimer));
</script>

<template>
  <article class="glint-detail">
    <nav class="glint-detail__crumbs" aria-label="面包屑">
      <NuxtLink to="/">首页</NuxtLink>
      <span aria-hidden="true">✧</span>
      <NuxtLink to="/glints">微光</NuxtLink>
      <span aria-hidden="true">✧</span>
      <span aria-current="page">{{ item.title }}</span>
    </nav>

    <div class="glint-detail__stage">
      <span class="glint-detail__orbit glint-detail__orbit--one" aria-hidden="true"></span>
      <span class="glint-detail__orbit glint-detail__orbit--two" aria-hidden="true"></span>
      <span class="glint-detail__spark glint-detail__spark--one" aria-hidden="true">✦</span>
      <span class="glint-detail__spark glint-detail__spark--two" aria-hidden="true">✧</span>

      <header class="glint-detail__head">
        <span class="glint-detail__stamp" aria-hidden="true">{{ item.emoji }}</span>
        <div class="glint-detail__heading">
          <p class="glint-detail__date">
            <time :datetime="item.date">{{ dayLabel(item.date) }}</time>
            <span aria-hidden="true">·</span>
            <span>一则微光</span>
          </p>
          <h1>{{ item.title }}</h1>
          <p v-if="item.summary" class="glint-detail__summary">{{ item.summary }}</p>
        </div>
        <span class="glint-detail__pin" aria-hidden="true"></span>
      </header>

      <div class="glint-detail__paper">
        <span class="glint-detail__tape" aria-hidden="true"></span>
        <div class="glint-detail__body" v-html="item.html"></div>
        <div class="glint-detail__signature" aria-hidden="true">
          <span></span>
          <b>✦</b>
          <span></span>
        </div>
      </div>

      <div class="glint-detail__actions">
        <NuxtLink to="/glints" class="glint-detail__all">回到微光 <span aria-hidden="true">↩</span></NuxtLink>
        <button type="button" class="glint-detail__copy" @click="copyLink">
          {{ copied ? '链接收好啦 ✦' : '收藏这条链接 ↗' }}
        </button>
      </div>
    </div>

    <nav v-if="neighbours.newer || neighbours.older" class="glint-detail__neighbours" aria-label="前后微光">
      <NuxtLink v-if="neighbours.newer" :to="neighbours.newer.path || `/glints/${encodeURIComponent(neighbours.newer.slug)}`" class="glint-detail__neighbour">
        <span>更近的一束光</span>
        <strong><b aria-hidden="true">{{ neighbours.newer.emoji }}</b>{{ neighbours.newer.title }}</strong>
      </NuxtLink>
      <span v-else></span>
      <NuxtLink v-if="neighbours.older" :to="neighbours.older.path || `/glints/${encodeURIComponent(neighbours.older.slug)}`" class="glint-detail__neighbour glint-detail__neighbour--older">
        <span>再往前一点</span>
        <strong><b aria-hidden="true">{{ neighbours.older.emoji }}</b>{{ neighbours.older.title }}</strong>
      </NuxtLink>
    </nav>
  </article>
</template>

<style scoped>
.glint-detail { max-width: 780px; margin: 0 auto; padding: 1.4rem 0 6rem; }
.glint-detail__crumbs { display: flex; flex-wrap: wrap; gap: .45rem; align-items: center; color: var(--bs-ink-muted); font-size: .82rem; }
.glint-detail__crumbs a { color: var(--bs-link); text-decoration: none; }
.glint-detail__crumbs a:hover { color: var(--bs-accent-strong); }

.glint-detail__stage {
  position: relative;
  margin-top: 1.25rem;
  padding: clamp(1rem, 3vw, 2rem);
  overflow: hidden;
  border: 1px solid var(--bs-border);
  border-radius: 1.8rem;
  background:
    radial-gradient(circle at 88% 12%, rgba(255, 228, 138, .32), transparent 28%),
    radial-gradient(circle at 8% 80%, rgba(185, 167, 255, .18), transparent 30%),
    var(--bs-paper-strong);
  box-shadow: var(--bs-shadow);
}
:root.bs-dark .glint-detail__stage {
  background:
    radial-gradient(circle at 88% 12%, rgba(255, 228, 138, .1), transparent 28%),
    radial-gradient(circle at 8% 80%, rgba(185, 167, 255, .12), transparent 30%),
    var(--bs-paper-strong);
}
.glint-detail__orbit { position: absolute; border: 1px dashed rgba(185, 167, 255, .35); border-radius: 50%; pointer-events: none; }
.glint-detail__orbit--one { top: -4rem; right: -4rem; width: 13rem; height: 13rem; animation: glint-orbit 18s linear infinite; }
.glint-detail__orbit--two { bottom: -6rem; left: -5rem; width: 15rem; height: 15rem; animation: glint-orbit 24s linear infinite reverse; }
.glint-detail__spark { position: absolute; color: var(--bs-yellow); text-shadow: 0 0 15px rgba(255, 228, 138, .8); pointer-events: none; }
.glint-detail__spark--one { top: 1.4rem; right: 1.5rem; font-size: 1.25rem; animation: glint-twinkle 3s ease-in-out infinite; }
.glint-detail__spark--two { right: 2.8rem; bottom: 3rem; color: var(--bs-lilac); font-size: .8rem; animation: glint-twinkle 4s ease-in-out infinite .8s; }

.glint-detail__head { position: relative; z-index: 1; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 1rem; align-items: start; }
.glint-detail__stamp {
  display: grid;
  place-items: center;
  width: 3.6rem;
  height: 3.6rem;
  border: 1.5px solid var(--bs-ink-line);
  border-radius: 44% 56% 48% 52%;
  background: linear-gradient(145deg, var(--bs-yellow), var(--bs-peach) 70%);
  color: var(--bs-ink-on-accent);
  font-size: 1.65rem;
  box-shadow: var(--bs-sticker-shadow);
  transform: rotate(-5deg);
}
.glint-detail__heading { min-width: 0; }
.glint-detail__date { display: flex; flex-wrap: wrap; gap: .35rem; margin: 0; color: var(--bs-accent-ink); font-size: .72rem; letter-spacing: .08em; }
.glint-detail__head h1 { margin: .3rem 0 .38rem; color: var(--bs-ink); font-size: clamp(1.65rem, 4.2vw, 2.55rem); line-height: 1.25; }
.glint-detail__summary { max-width: 570px; margin: 0; color: var(--bs-ink-soft); font-size: .92rem; line-height: 1.8; }
.glint-detail__pin { width: 1rem; height: 1rem; margin: .1rem .2rem 0 0; border: 1.5px solid var(--bs-ink-line); border-radius: 50%; background: var(--bs-pink); box-shadow: inset 0 0 0 3px var(--bs-paper-strong), 2px 2px 0 var(--bs-ink-line); transform: rotate(12deg); }

.glint-detail__paper {
  position: relative;
  z-index: 1;
  margin-top: 1.35rem;
  padding: 2rem clamp(1.1rem, 3.4vw, 2.4rem) 1.5rem;
  border: 1px solid var(--bs-border-accent);
  border-radius: .4rem .5rem 1.1rem .5rem;
  background:
    linear-gradient(90deg, transparent 2.4rem, rgba(255, 189, 138, .15) 2.4rem, rgba(255, 189, 138, .15) 2.47rem, transparent 2.47rem),
    var(--bs-surface-strong);
  box-shadow: 0 14px 34px rgba(95, 66, 118, .12);
  transform: rotate(.18deg);
}
.glint-detail__tape { position: absolute; top: -.55rem; left: 50%; width: 5.2rem; height: 1.2rem; background: rgba(255, 228, 138, .72); box-shadow: 0 2px 5px rgba(95, 66, 118, .1); transform: translateX(-50%) rotate(-1.4deg); clip-path: polygon(3% 14%, 96% 0, 100% 88%, 4% 100%); }
.glint-detail__body { color: var(--bs-ink-body); font-size: clamp(.96rem, 2vw, 1.04rem); line-height: 2.05; }
.glint-detail__body :deep(p) { margin: 0 0 1rem; }
.glint-detail__body :deep(p:last-child) { margin-bottom: 0; }
.glint-detail__signature { display: flex; gap: .55rem; align-items: center; justify-content: flex-end; margin-top: 1.5rem; color: var(--bs-accent-ink); }
.glint-detail__signature span { width: 2.2rem; height: 1px; background: linear-gradient(90deg, transparent, var(--bs-border-accent)); }
.glint-detail__signature span:last-child { background: linear-gradient(90deg, var(--bs-border-accent), transparent); }
.glint-detail__signature b { font-size: .72rem; }

.glint-detail__actions { position: relative; z-index: 1; display: flex; flex-wrap: wrap; justify-content: space-between; gap: .75rem; align-items: center; margin-top: 1.2rem; }
.glint-detail__all, .glint-detail__copy { min-height: 2.55rem; padding: .45rem .85rem; border: 1px solid var(--bs-hairline); border-radius: 999px; background: var(--bs-surface-soft); color: var(--bs-ink-body); font: inherit; font-size: .8rem; text-decoration: none; cursor: pointer; transition: transform var(--bs-dur-quick) var(--bs-ease-pop), background var(--bs-dur-quick) ease; }
.glint-detail__all:hover, .glint-detail__copy:hover { background: var(--bs-tint-yellow); transform: translateY(-2px); }
.glint-detail__copy { border-color: var(--bs-border-accent); color: var(--bs-accent-ink); }
.glint-detail__all:focus-visible, .glint-detail__copy:focus-visible { outline: 3px solid rgba(185, 167, 255, .72); outline-offset: 2px; }

.glint-detail__neighbours { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .8rem; margin-top: 1.1rem; }
.glint-detail__neighbour { display: grid; gap: .22rem; min-width: 0; padding: .82rem .9rem; border: 1px dashed var(--bs-border); border-radius: 1rem; color: var(--bs-ink-body); text-decoration: none; transition: transform var(--bs-dur-base) var(--bs-ease-pop), background var(--bs-dur-base) ease; }
.glint-detail__neighbour:hover { background: var(--bs-surface-strong); transform: translateY(-3px); }
.glint-detail__neighbour--older { text-align: right; }
.glint-detail__neighbour > span { color: var(--bs-ink-muted); font-size: .7rem; }
.glint-detail__neighbour strong { display: flex; gap: .4rem; align-items: center; overflow: hidden; color: var(--bs-ink); font-size: .84rem; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.glint-detail__neighbour--older strong { justify-content: flex-end; }

@keyframes glint-orbit { to { transform: rotate(360deg); } }
@keyframes glint-twinkle { 0%, 100% { opacity: .45; transform: scale(.8) rotate(-8deg); } 50% { opacity: 1; transform: scale(1.18) rotate(8deg); } }

@media (max-width: 560px) {
  .glint-detail { padding-top: .9rem; }
  .glint-detail__stage { padding: 1rem; border-radius: 1.4rem; }
  .glint-detail__head { grid-template-columns: auto minmax(0, 1fr); gap: .75rem; }
  .glint-detail__stamp { width: 3rem; height: 3rem; font-size: 1.35rem; }
  .glint-detail__pin { display: none; }
  .glint-detail__paper { padding: 1.7rem .95rem 1.2rem; background: var(--bs-surface-strong); }
  .glint-detail__neighbours { grid-template-columns: 1fr; }
  .glint-detail__neighbour--older { text-align: left; }
  .glint-detail__neighbour--older strong { justify-content: flex-start; }
}
@media (prefers-reduced-motion: reduce) {
  .glint-detail__orbit, .glint-detail__spark { animation: none; }
  .glint-detail__paper { transform: none; }
  .glint-detail__all, .glint-detail__copy, .glint-detail__neighbour { transition: none; }
}
html.bs-reduced-motion .glint-detail__orbit,
html.bs-reduced-motion .glint-detail__spark { animation: none; }
html.bs-reduced-motion .glint-detail__paper { transform: none; }
html.bs-reduced-motion .glint-detail__all,
html.bs-reduced-motion .glint-detail__copy,
html.bs-reduced-motion .glint-detail__neighbour { transition: none; }
</style>
