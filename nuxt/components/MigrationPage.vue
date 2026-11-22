<script setup lang="ts">
withDefaults(defineProps<{
  title: string;
  description?: string;
}>(), {
  description: '',
});
</script>

<template>
  <section class="migration-page">
    <header class="migration-page__head">
      <span class="migration-page__glow" aria-hidden="true">
        <i class="migration-page__orb migration-page__orb--one"></i>
        <i class="migration-page__orb migration-page__orb--two"></i>
      </span>
      <span class="migration-page__seal" aria-hidden="true">✦</span>
      <div class="migration-page__title">
        <h1>{{ title }}</h1>
        <span class="migration-page__underline" aria-hidden="true"></span>
        <p v-if="description" class="migration-page__description">{{ description }}</p>
      </div>
    </header>
    <div class="migration-page__slot"><slot /></div>
  </section>
</template>

<style scoped>
.migration-page { max-width: 820px; margin: 0 auto; padding: 1.4rem 0 6rem; }

.migration-page__head { position: relative; display: flex; align-items: center; gap: .85rem; padding: .2rem 0 .3rem; }
.migration-page__glow { position: absolute; inset: -2rem 0 0; z-index: -1; overflow: hidden; pointer-events: none; }
.migration-page__orb { position: absolute; display: block; border-radius: 50%; filter: blur(18px); opacity: .45; pointer-events: none; }
.migration-page__orb--one { top: -2rem; left: -2rem; width: 8rem; height: 8rem; background: radial-gradient(circle, rgba(255, 143, 179, .45), transparent 70%); }
.migration-page__orb--two { top: .4rem; right: -1rem; width: 9rem; height: 9rem; background: radial-gradient(circle, rgba(185, 167, 255, .38), transparent 70%); }

/* A stamped seal next to the title gives every interior page the same small
   signature, without turning the heading into a poster. */
.migration-page__seal {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 2.4rem;
  height: 2.4rem;
  border: 1.5px solid var(--bs-ink-line);
  border-radius: 46% 54% 50% 50%;
  background: linear-gradient(145deg, var(--bs-yellow), var(--bs-pink) 62%, var(--bs-lilac));
  color: var(--bs-ink-on-accent);
  font-size: 1rem;
  box-shadow: var(--bs-sticker-shadow);
  transform: rotate(-7deg);
  transition: transform var(--bs-dur-base) var(--bs-ease-pop);
}
.migration-page__head:hover .migration-page__seal { transform: rotate(5deg) scale(1.05); }

.migration-page__title { min-width: 0; }
.migration-page h1 { margin: 0; color: var(--bs-ink); font-size: clamp(1.4rem, 2.7vw, 1.8rem); line-height: 1.25; letter-spacing: .01em; }
/* A hand-drawn underline that draws itself in on arrival. */
.migration-page__underline { display: block; width: 4.2rem; height: .3rem; margin-top: .28rem; border-radius: 999px; background: linear-gradient(90deg, var(--bs-pink), var(--bs-yellow) 48%, var(--bs-lilac)); transform-origin: left; animation: page-underline-in var(--bs-dur-slow) var(--bs-ease-pop) both; }
@keyframes page-underline-in { from { transform: scaleX(.15); opacity: 0; } to { transform: scaleX(1); opacity: .85; } }

.migration-page__description { max-width: 620px; margin: .35rem 0 0; color: var(--bs-ink-soft); font-size: .9rem; line-height: 1.75; }

.migration-page__slot { margin-top: 1rem; padding: 1.5rem; border: 1px solid var(--bs-border); border-radius: 1.4rem; background: var(--bs-surface); box-shadow: var(--bs-shadow); color: var(--bs-ink-body); line-height: 1.85; }

@media (max-width: 640px) {
  .migration-page { padding-top: .8rem; }
  .migration-page__seal { width: 2.05rem; height: 2.05rem; font-size: .86rem; }
  .migration-page__slot { margin-top: .8rem; padding: 1.1rem; border-radius: 1.2rem; }
}
@media (prefers-reduced-motion: reduce) {
  .migration-page__underline { animation: none; }
  .migration-page__seal { transition: none; }
}
html.bs-reduced-motion .migration-page__underline { animation: none; }
</style>
