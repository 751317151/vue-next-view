<script setup lang="ts">
const props = defineProps<{ error: { statusCode?: number; statusMessage?: string } }>();

useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] });
const goHome = () => clearError({ redirect: '/' });
</script>

<template>
  <main class="nuxt-error-page">
    <p class="nuxt-error-page__code">{{ props.error.statusCode || 500 }}</p>
    <h1>{{ props.error.statusMessage || '页面暂时走神了' }}</h1>
    <p>这颗小星星没有找到正确的路，我们先回到首页吧。</p>
    <button type="button" @click="goHome">回到首页 ✦</button>
  </main>
</template>

<style scoped>
.nuxt-error-page { max-width: 680px; margin: 0 auto; padding: 12vh 0; text-align: center; }
.nuxt-error-page__code { color: #ff8fb3; font-size: 5rem; font-weight: 800; line-height: 1; }
h1 { color: #392d4f; }
p:not(.nuxt-error-page__code) { color: #746b86; line-height: 1.8; }
button { margin-top: 1rem; padding: .75rem 1.2rem; border: 0; border-radius: 999px; background: linear-gradient(135deg,#ffe48a,#ffb6c8); color: #392d4f; cursor: pointer; }
</style>
