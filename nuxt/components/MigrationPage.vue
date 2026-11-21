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
      <!-- 氛围光球不能参与页面横向尺寸：右侧那颗原本会超出视口，把整页撑出
           13px 的横向滚动。交给一个裁剪容器，再用负 z-index 藏到文字后。 -->
      <span class="migration-page__glow" aria-hidden="true">
        <i class="migration-page__orb migration-page__orb--one"></i>
        <i class="migration-page__orb migration-page__orb--two"></i>
      </span>
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
.migration-page__glow { position: absolute; inset: -1.6rem 0 0; z-index: -1; overflow: hidden; border-radius: inherit; pointer-events: none; }
.migration-page__orb { position: absolute; display: block; border-radius: 50%; filter: blur(18px); opacity: .55; pointer-events: none; }
.migration-page__orb--one { top: -1.2rem; left: -2rem; width: 9rem; height: 9rem; background: radial-gradient(circle, rgba(255, 143, 179, .55), transparent 70%); }
.migration-page__orb--two { top: 1.6rem; right: -1.4rem; width: 11rem; height: 11rem; background: radial-gradient(circle, rgba(185, 167, 255, .45), transparent 70%); }

.migration-page__eyebrow { display: inline-flex; align-items: center; gap: .4rem; margin: 0; padding: .3rem .8rem; border: 1px dashed rgba(177, 118, 140, .45); border-radius: 999px; background: var(--bs-surface); color: var(--bs-accent-ink); font-size: .74rem; letter-spacing: .16em; text-transform: uppercase; }
.migration-page__spark { color: var(--bs-peach); }
@media (prefers-reduced-motion: no-preference) {
  .migration-page__spark { animation: mp-spark 2.6s ease-in-out infinite; }
}
@keyframes mp-spark {
  0%, 100% { transform: rotate(-12deg) scale(1); opacity: .8; }
  50% { transform: rotate(20deg) scale(1.25); opacity: 1; }
}

.migration-page h1 { margin: .9rem 0 .2rem; color: var(--bs-ink); font-size: clamp(2.2rem, 6vw, 4.5rem); line-height: 1.08; }

.migration-page__description { max-width: 620px; margin: .6rem 0 0; color: var(--bs-ink-soft); font-size: 1.1rem; line-height: 1.8; }

.migration-page__squiggle { display: block; width: 7.5rem; height: .6rem; margin-top: 1.2rem; background: linear-gradient(90deg, var(--bs-pink), var(--bs-yellow), var(--bs-lilac), var(--bs-mint)); border-radius: 999px; opacity: .8; }

.migration-page__slot { margin-top: 2rem; padding: 1.5rem; border: 1px solid var(--bs-border); border-radius: 1.4rem; background: var(--bs-surface); box-shadow: var(--bs-shadow); color: var(--bs-ink-body); line-height: 1.85; }
</style>
