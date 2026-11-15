<script setup lang="ts">
defineProps<{
  eyebrow: string;
  title: string;
  description: string;
}>();
</script>

<template>
  <section class="migration-page">
    <p class="migration-page__eyebrow">{{ eyebrow }}</p>
    <h1>{{ title }}</h1>
    <p class="migration-page__description">{{ description }}</p>
    <div class="migration-page__slot"><slot /></div>
  </section>
</template>

<style scoped>
.migration-page { max-width: 820px; margin: 0 auto; padding: 2rem 0 6rem; }
.migration-page__eyebrow { color: #b1768c; letter-spacing: .1em; }
h1 { color: #392d4f; font-size: clamp(2.2rem, 6vw, 4.5rem); line-height: 1.08; }
.migration-page__description { max-width: 620px; color: #746b86; font-size: 1.1rem; line-height: 1.8; }
.migration-page__slot { margin-top: 2rem; padding: 1.5rem; border: 1px solid rgba(255,255,255,.72); border-radius: 1.4rem; background: rgba(255,255,255,.56); color: #4b3d60; line-height: 1.85; }
</style>
