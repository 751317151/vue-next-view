<script setup lang="ts">
defineProps<{
  eyebrow: string;
  title: string;
  description: string;
}>();
</script>

<template>
  <section class="migration-page">
    <header class="migration-page__head">
      <span class="migration-page__orb migration-page__orb--one" aria-hidden="true"></span>
      <span class="migration-page__orb migration-page__orb--two" aria-hidden="true"></span>
      <p class="migration-page__eyebrow">
        <span class="migration-page__spark" aria-hidden="true">✦</span>
        {{ eyebrow }}
      </p>
      <h1>{{ title }}</h1>
      <p class="migration-page__description">{{ description }}</p>
      <span class="migration-page__squiggle" aria-hidden="true"></span>
    </header>
    <div class="migration-page__slot"><slot /></div>
  </section>
</template>

<style scoped>
.migration-page { max-width: 820px; margin: 0 auto; padding: 2.4rem 0 6rem; }

.migration-page__head { position: relative; padding: 1.6rem 0 .4rem; }
.migration-page__orb { position: absolute; z-index: -1; border-radius: 50%; filter: blur(18px); opacity: .55; pointer-events: none; }
.migration-page__orb--one { top: -1.2rem; left: -2rem; width: 9rem; height: 9rem; background: radial-gradient(circle, rgba(255, 143, 179, .55), transparent 70%); }
.migration-page__orb--two { top: 1.6rem; right: -1.4rem; width: 11rem; height: 11rem; background: radial-gradient(circle, rgba(185, 167, 255, .45), transparent 70%); }

.migration-page__eyebrow { display: inline-flex; align-items: center; gap: .4rem; margin: 0; padding: .3rem .8rem; border: 1px dashed rgba(177, 118, 140, .45); border-radius: 999px; background: rgba(255, 255, 255, .5); color: #b1768c; font-size: .74rem; letter-spacing: .16em; text-transform: uppercase; }
.migration-page__spark { color: #ffbd8a; }
@media (prefers-reduced-motion: no-preference) {
  .migration-page__spark { animation: mp-spark 2.6s ease-in-out infinite; }
}
@keyframes mp-spark {
  0%, 100% { transform: rotate(-12deg) scale(1); opacity: .8; }
  50% { transform: rotate(20deg) scale(1.25); opacity: 1; }
}

.migration-page h1 { margin: .9rem 0 .2rem; color: #392d4f; font-size: clamp(2.2rem, 6vw, 4.5rem); line-height: 1.08; }

.migration-page__description { max-width: 620px; margin: .6rem 0 0; color: #746b86; font-size: 1.1rem; line-height: 1.8; }

.migration-page__squiggle { display: block; width: 7.5rem; height: .6rem; margin-top: 1.2rem; background: linear-gradient(90deg, #ff8fb3, #ffe48a, #b9a7ff, #9ee6d0); border-radius: 999px; opacity: .8; }

.migration-page__slot { margin-top: 2rem; padding: 1.5rem; border: 1px solid rgba(255, 255, 255, .72); border-radius: 1.4rem; background: rgba(255, 255, 255, .56); box-shadow: 0 16px 44px rgba(95, 66, 118, .1); color: #4b3d60; line-height: 1.85; }
</style>
