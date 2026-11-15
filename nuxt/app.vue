<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { siteConfig } from '../src/config/site';

useHead({
  htmlAttrs: { lang: siteConfig.locale },
  titleTemplate: (title) => title || siteConfig.name,
  meta: [
    { name: 'author', content: siteConfig.author },
    { name: 'theme-color', content: '#ffb6c8' },
  ],
  link: [{ rel: 'alternate', type: 'application/rss+xml', href: '/rss.xml', title: `${siteConfig.name} RSS` }],
});
</script>
