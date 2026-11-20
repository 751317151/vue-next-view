<template>
  <button
    type="button"
    class="theme-toggle"
    aria-label="切换主题（白天 / 星夜 / 跟随系统）"
    title="切换主题：白天 / 星夜 / 跟随系统"
    @click="cycleTheme"
  >
    <span class="theme-toggle__sky" aria-hidden="true">
      <span class="theme-toggle__sun">☀</span>
      <span class="theme-toggle__moon">☾</span>
      <span class="theme-toggle__stars">✦ · ✧</span>
    </span>
    <span class="theme-toggle__label" aria-hidden="true">
      <span class="theme-toggle__label-light">白天</span>
      <span class="theme-toggle__label-dark">星夜</span>
      <span class="theme-toggle__label-system">跟随</span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { useAppearance } from '../composables/useAppearance';

// 与设置面板共用同一套主题状态，避免两套 storage key / DOM 标记互相打架。
const { cycleTheme } = useAppearance();
</script>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  padding: .3rem .65rem .3rem .4rem;
  border: 1px solid var(--bs-border);
  border-radius: 999px;
  background: var(--bs-surface-strong);
  color: var(--bs-ink-soft);
  font-family: inherit;
  font-size: .78rem;
  cursor: pointer;
  backdrop-filter: blur(12px);
  transition: transform var(--bs-dur-base) ease, background var(--bs-dur-base) ease, border-color var(--bs-dur-base) ease, color var(--bs-dur-base) ease;
}
.theme-toggle:hover { transform: translateY(-2px); border-color: var(--bs-border-accent); color: var(--bs-ink); }

.theme-toggle__sky { position: relative; display: grid; place-items: center; width: 1.6rem; height: 1.6rem; border-radius: 50%; background: linear-gradient(140deg, rgba(255, 228, 138, .6), rgba(255, 143, 179, .45)); overflow: hidden; transition: background var(--bs-dur-mid) ease; }
.theme-toggle__sun, .theme-toggle__moon, .theme-toggle__stars { position: absolute; line-height: 1; transition: opacity var(--bs-dur-mid) ease, transform var(--bs-dur-mid) var(--bs-ease-pop); }
.theme-toggle__sun { font-size: .9rem; color: #8a6a2f; }
.theme-toggle__moon { font-size: .95rem; color: #fffaf5; opacity: 0; transform: translateY(130%) rotate(-40deg); }
.theme-toggle__stars { font-size: .5rem; color: #fffaf5; letter-spacing: .1em; opacity: 0; transform: scale(.5); }

.theme-toggle__label > span { display: none; }
html:not([data-theme-mode]) .theme-toggle__label-system { display: inline; }

/* Keep the icon descendants scoped: wrapping only html in :global() drops
   the descendants during compilation and applies their transforms to html. */
html.bs-dark .theme-toggle__sky { background: linear-gradient(140deg, #3b2d63, #1a1430); }
html.bs-dark .theme-toggle__sun { opacity: 0; transform: translateY(-140%) rotate(40deg); }
html.bs-dark .theme-toggle__moon { opacity: 1; transform: translateY(0) rotate(0); }
html.bs-dark .theme-toggle__stars { opacity: .85; transform: scale(1) translateY(-.42rem); }

html[data-theme-mode="light"] .theme-toggle__label-light,
html[data-theme-mode="dark"] .theme-toggle__label-dark,
html[data-theme-mode="system"] .theme-toggle__label-system { display: inline !important; }

html[data-theme-mode="system"] .theme-toggle__sky { box-shadow: inset 0 0 0 1.5px rgba(185, 167, 255, .55); }

@media (max-width: 760px) { .theme-toggle__label { display: none; } .theme-toggle { padding: .3rem; } }

@media (prefers-reduced-motion: reduce) {
  .theme-toggle, .theme-toggle__sky, .theme-toggle__sun, .theme-toggle__moon, .theme-toggle__stars { transition: none; }
  .theme-toggle:hover { transform: none; }
}
</style>
