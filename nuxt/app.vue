<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { siteConfig } from '../src/config/site';

const runtimeConfig = useRuntimeConfig();
const siteUrl = String(runtimeConfig.public.siteUrl || '').replace(/\/$/, '');

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
    { name: 'theme-color', content: '#ffb6c8' },
    { property: 'og:site_name', content: siteConfig.name },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
  link: [
    { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/lxgw-wenkai.woff2', crossorigin: 'anonymous' },
    { rel: 'alternate', type: 'application/rss+xml', href: '/rss.xml', title: `${siteConfig.name} RSS` },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(siteStructuredData.value),
    },
  ],
});
</script>
