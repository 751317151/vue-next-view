<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { siteConfig } from '../src/config/site';

const runtimeConfig = useRuntimeConfig();
const siteUrl = String(runtimeConfig.public.siteUrl || '').replace(/\/$/, '');

// 浏览器/系统状态栏配色。useAppearance.applyTheme 会按当前主题更新这一个 meta；
// 跟随系统时的首屏配色由 nuxt.config.ts 的 boot 脚本负责。
const THEME_COLORS = { light: '#ffb6c8', dark: '#191327' } as const;

const siteStructuredData = computed(() => [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteUrl || '/',
    description: siteConfig.description,
    inLanguage: siteConfig.locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${siteUrl}/glints#item-list`,
    name: '微光',
    description: '生活里值得记一笔的小事。',
    url: `${siteUrl}/glints`,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteConfig.author,
    url: siteUrl || '/',
  },
]);

useHead({
  htmlAttrs: { lang: siteConfig.locale },
  titleTemplate: (title) => title || siteConfig.name,
  meta: [
    { name: 'author', content: siteConfig.author },
    { name: 'theme-color', content: THEME_COLORS.light },
    { property: 'og:site_name', content: siteConfig.name },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
  link: [
    { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/lxgw-wenkai.woff2', crossorigin: 'anonymous' },
    { rel: 'alternate', type: 'application/rss+xml', href: '/rss.xml', title: `${siteConfig.name} RSS` },
  ],
  script: [
    {
      key: 'site-ld',
      type: 'application/ld+json',
      innerHTML: JSON.stringify(siteStructuredData.value),
    },
  ],
});
</script>
