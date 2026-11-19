<script setup lang="ts">
const props = defineProps<{ error: { statusCode?: number; statusMessage?: string } }>();

useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] });

const goHome = () => clearError({ redirect: '/' });
const goBack = () => {
  if (typeof window === 'undefined') return;
  if (window.history.length > 1) window.history.back();
  else clearError({ redirect: '/' });
};

// Nuxt's default statusMessage is the English router string ("Page not found:
// /foo"). Show a warm Chinese line instead, and keep the raw text out of the UI.
const friendlyTitle = computed(() => {
  const status = props.error.statusCode;
  if (status === 404) return '这条路好像走丢了';
  if (status === 403) return '这扇门暂时打不开';
  if (status && status >= 500) return '服务器打了个小盹';
  return '页面暂时走神了';
});
</script>

<template>
  <main class="nuxt-error-page">
    <LostSprite />

    <p class="nuxt-error-page__code">{{ props.error.statusCode || 500 }}</p>
    <h1>{{ friendlyTitle }}</h1>
    <p class="nuxt-error-page__hint">
      这颗小星星好像飘到别的地方去了。要不要回首页，或者退回上一页看看？
    </p>

    <div class="nuxt-error-page__actions">
      <button type="button" class="is-primary" @click="goHome">回到首页 ✦</button>
      <button type="button" class="is-ghost" @click="goBack">退回上一页</button>
    </div>
  </main>
</template>

<style scoped>
.nuxt-error-page { max-width: 680px; margin: 0 auto; padding: 9vh 1.2rem 12vh; text-align: center; }

.nuxt-error-page__code { margin: 0; color: var(--bs-pink, #ff8fb3); font-size: 4.4rem; font-weight: 800; line-height: 1; text-shadow: 3px 3px 0 var(--bs-ink-line, #392d4f); }
h1 { margin: .7rem 0 0; color: var(--bs-ink, #392d4f); font-size: clamp(1.3rem, 4vw, 1.8rem); }
.nuxt-error-page__hint { max-width: 24rem; margin: .7rem auto 0; color: var(--bs-ink-soft, #746b86); line-height: 1.8; }

.nuxt-error-page__actions { display: flex; flex-wrap: wrap; justify-content: center; gap: .7rem; margin-top: 1.6rem; }
.nuxt-error-page__actions button { padding: .7rem 1.2rem; border: 2px solid var(--bs-ink-line, #392d4f); border-radius: 999px; font-family: inherit; font-size: .9rem; font-weight: 600; cursor: pointer; transition: transform 200ms cubic-bezier(.2, .9, .3, 1.3), box-shadow 200ms ease; }
.nuxt-error-page__actions .is-primary { background: linear-gradient(135deg, var(--bs-yellow, #ffe48a), var(--bs-pink, #ffb6c8)); color: #392d4f; box-shadow: 3px 3px 0 var(--bs-ink-line, #392d4f); }
.nuxt-error-page__actions .is-ghost { background: var(--bs-surface, rgba(255, 255, 255, .6)); color: var(--bs-ink, #392d4f); box-shadow: 3px 3px 0 var(--bs-hairline, rgba(255, 255, 255, .8)); }
.nuxt-error-page__actions button:hover { transform: translate(-2px, -3px) rotate(-1deg); box-shadow: 5px 6px 0 var(--bs-ink-line, #392d4f); }
.nuxt-error-page__actions button:focus-visible { outline: 3px solid rgba(185, 167, 255, .8); outline-offset: 3px; }
</style>
