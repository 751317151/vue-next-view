<script setup lang="ts">
import { siteConfig } from '../../src/config/site';
usePublicCanonical('/friend');
useSeoMeta({ title: `友人帐 | ${siteConfig.name}`, description: '记录那些值得一起探索的站点和朋友。' });
</script>
<template><MigrationPage eyebrow="FRIENDS" title="一起发光的人，会互相找到。" description="这里收集友链、灵感来源和同行者。"><p>友链 API 接入后将在这里展示朋友卡片。</p></MigrationPage></template>
