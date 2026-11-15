<script setup lang="ts">
import { siteConfig } from '../../src/config/site';
usePublicCanonical('/about');
useSeoMeta({ title: `关于 | ${siteConfig.name}`, description: '认识 BlackStar，以及这个博客为什么存在。' });
</script>
<template><MigrationPage eyebrow="ABOUT" title="你好，我是 BlackStar。" description="我喜欢把复杂的技术，写成温暖、清晰、会让人想继续探索的小故事。"><p>关于作者、技术方向和博客愿景将在这里持续更新。</p></MigrationPage></template>
