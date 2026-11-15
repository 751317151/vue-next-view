<script setup lang="ts">
import { siteConfig } from '../../../src/config/site';
import type { PublicTag } from '../../types/public';
usePublicCanonical('/tags');
useSeoMeta({ title: `标签 | ${siteConfig.name}`, description: '通过标签发现相关的文章和灵感。' });
const { data: tags } = await useAsyncData<PublicTag[]>('public-tags', () => $fetch('/api/tags'));
</script>
<template>
  <MigrationPage eyebrow="TAGS" title="给灵感贴一枚可爱的标签。" description="标签会把不同时间写下的想法重新连接起来。">
    <div class="tag-cloud">
      <NuxtLink v-for="tag in tags || []" :key="tag.id" :to="`/tags/${tag.id}`" class="tag-pill">
        #{{ tag.tagName }} <small>{{ tag.articleCount || 0 }}</small>
      </NuxtLink>
    </div>
  </MigrationPage>
</template>

<style scoped>
.tag-cloud { display: flex; flex-wrap: wrap; gap: .7rem; }
.tag-pill { padding: .65rem .85rem; border-radius: 999px; background: rgba(185,167,255,.18); color: #624d72; text-decoration: none; transition: 180ms ease; }
.tag-pill:nth-child(3n) { background: rgba(158,230,208,.24); }
.tag-pill:nth-child(3n + 1) { background: rgba(255,228,138,.34); }
.tag-pill:hover { transform: translateY(-3px) rotate(-1deg); box-shadow: 0 10px 25px rgba(95,66,118,.12); }
.tag-pill small { opacity: .66; }
</style>
