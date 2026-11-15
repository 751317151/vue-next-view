<template>
  <div class="nuxt-migration-shell">
    <ClientOnly>
      <AmbientConstellation />
      <PointerGlow />
      <MochiCompanion />
    </ClientOnly>
    <header class="nuxt-migration-shell__header">
      <NuxtLink to="/" class="nuxt-migration-shell__brand">生活倒影</NuxtLink>
      <nav aria-label="主导航">
        <NuxtLink to="/archive">归档</NuxtLink>
        <NuxtLink to="/categories">分类</NuxtLink>
        <NuxtLink to="/tags">标签</NuxtLink>
        <NuxtLink to="/search">搜索</NuxtLink>
        <NuxtLink to="/about">关于</NuxtLink>
      </nav>
    </header>
    <main><slot /></main>
  </div>
</template>

<script setup lang="ts">
import AmbientConstellation from '../../src/components/common/AmbientConstellation.vue';
import PointerGlow from '../../src/components/common/PointerGlow.vue';
import MochiCompanion from '../../src/components/common/MochiCompanion.vue';
</script>

<style scoped>
.nuxt-migration-shell { min-height: 100vh; padding: 1rem clamp(1rem, 4vw, 4rem) 4rem; }
.nuxt-migration-shell__header { display: flex; align-items: center; justify-content: space-between; max-width: 1180px; margin: 0 auto 4rem; padding: .8rem 1.1rem; border: 1px solid rgba(255,255,255,.7); border-radius: 999px; background: rgba(255,250,245,.72); box-shadow: 0 12px 40px rgba(95,66,118,.12); backdrop-filter: blur(20px); }
.nuxt-migration-shell__brand { color: #392d4f; font-weight: 800; text-decoration: none; text-shadow: 2px 2px 0 rgba(255,228,138,.6); }
nav { display: flex; gap: .35rem; flex-wrap: wrap; justify-content: flex-end; }
nav a { padding: .45rem .7rem; border-radius: 999px; color: #746b86; font-size: .9rem; text-decoration: none; transition: 180ms ease; }
nav a:hover, nav a.router-link-active { color: #392d4f; background: rgba(255,143,179,.16); transform: translateY(-2px); }
@media (max-width: 640px) { .nuxt-migration-shell__header { align-items: flex-start; gap: .75rem; flex-direction: column; border-radius: 1.25rem; } nav { justify-content: flex-start; } }
</style>
