<template>
  <div class="site-shell">
    <ClientOnly>
      <AmbientConstellation />
      <PointerGlow />
      <MochiCompanion />
    </ClientOnly>
    <header class="site-shell__header">
      <NuxtLink to="/" class="site-shell__brand">
        <span class="site-shell__brand-mark">🌙</span>
        <span>生活倒影</span>
      </NuxtLink>
      <nav class="site-shell__desktop-nav" aria-label="主导航">
        <NuxtLink to="/archive">归档</NuxtLink>
        <NuxtLink to="/categories">分类</NuxtLink>
        <NuxtLink to="/tags">标签</NuxtLink>
        <NuxtLink to="/about">关于</NuxtLink>
        <NuxtLink to="/message">留言板</NuxtLink>
        <NuxtLink to="/search" class="site-shell__search">搜索 ✦</NuxtLink>
      </nav>
      <div class="site-shell__actions">
        <!-- The buttons render on the server so a phone on a slow connection
             still has a way to open the menu before hydration finishes. Only
             the overlays themselves need ClientOnly. -->
        <button type="button" class="site-shell__icon-btn" aria-label="主题与设置" @click="settingsOpen = true">
          <span aria-hidden="true">⚙</span>
        </button>
        <button
          type="button"
          class="site-shell__icon-btn site-shell__menu-btn"
          :aria-expanded="drawerOpen"
          aria-label="打开菜单"
          @click="drawerOpen = true"
        >
          <span aria-hidden="true">☰</span>
        </button>
      </div>
    </header>
    <main class="site-shell__main"><slot /></main>
    <ClientOnly>
      <BackToTop />
      <MobileDrawer v-model="drawerOpen" @settings="settingsOpen = true" />
      <SettingsSheet :open="settingsOpen" @close="settingsOpen = false" />
    </ClientOnly>
    <footer class="site-shell__footer">
      <div class="site-shell__footer-inner">
        <div class="site-shell__footer-brand">
          <strong>🌙 生活倒影</strong>
          <p>把技术、生活和灵感，写成会发光的小故事。</p>
        </div>
        <nav class="site-shell__footer-links" aria-label="页脚导航">
          <NuxtLink to="/archive">归档</NuxtLink>
          <NuxtLink to="/categories">分类</NuxtLink>
          <NuxtLink to="/tags">标签</NuxtLink>
          <NuxtLink to="/about">关于</NuxtLink>
          <NuxtLink to="/message">留言板</NuxtLink>
          <a href="/rss.xml" target="_blank" rel="noopener">RSS</a>
          <a href="/sitemap.xml" target="_blank" rel="noopener">站点地图</a>
        </nav>
        <p class="site-shell__footer-note">
          © 2024–{{ new Date().getFullYear() }} {{ siteConfig.author }} · 用 Vue 与星光写成
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import AmbientConstellation from '../../src/components/common/AmbientConstellation.vue';
import PointerGlow from '../../src/components/common/PointerGlow.vue';
import MochiCompanion from '../../src/components/common/MochiCompanion.vue';
import { siteConfig } from '../../src/config/site';

const drawerOpen = ref(false);
const settingsOpen = ref(false);

// Apply the stored theme as soon as the client takes over. The inline boot
// script already set the class before paint; this hydrates the reactive state
// so the Settings sheet shows the correct selection.
const { init } = useAppearance();
onMounted(init);
</script>

<style scoped>
.site-shell { display: flex; min-height: 100vh; flex-direction: column; padding: 1rem clamp(1rem, 4vw, 4rem) 0; }
.site-shell__header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; max-width: 1180px; width: 100%; margin: 0 auto; padding: .7rem 1.2rem; border: 1px solid rgba(255,255,255,.7); border-radius: 999px; background: rgba(255,250,245,.72); box-shadow: 0 12px 40px rgba(95,66,118,.12); backdrop-filter: blur(20px); }
.site-shell__brand { display: inline-flex; align-items: center; gap: .45rem; color: #392d4f; font-weight: 800; text-decoration: none; text-shadow: 2px 2px 0 rgba(255,228,138,.6); }
.site-shell__brand-mark { font-size: 1.1rem; transition: transform 260ms ease; }
.site-shell__brand:hover .site-shell__brand-mark { transform: rotate(-14deg) scale(1.15); }
.site-shell__header nav { display: flex; align-items: center; gap: .3rem; flex-wrap: wrap; justify-content: flex-end; }
.site-shell__header nav a { position: relative; padding: .45rem .75rem; border-radius: 999px; color: #746b86; font-size: .9rem; text-decoration: none; transition: 180ms ease; }
:root.bs-dark .site-shell__header nav a { color: var(--bs-ink-soft); }
.site-shell__header nav a::after { content: ''; position: absolute; inset: auto .8rem -1px; height: 2px; border-radius: 999px; background: linear-gradient(90deg, #ff8fb3, #ffbd8a, #b9a7ff); opacity: 0; transform: scaleX(.3); transition: 220ms ease; }
.site-shell__header nav a:hover, .site-shell__header nav a.router-link-active { color: #392d4f; background: rgba(255,143,179,.16); transform: translateY(-2px); }
:root.bs-dark .site-shell__header nav a:hover, :root.bs-dark .site-shell__header nav a.router-link-active { color: var(--bs-ink); background: rgba(255,143,179,.22); }
.site-shell__header nav a:hover::after, .site-shell__header nav a.router-link-active::after { opacity: 1; transform: scaleX(1); }
.site-shell__header nav .site-shell__search { border: 1px dashed rgba(185,167,255,.6); }

.site-shell__actions { display: flex; align-items: center; gap: .4rem; }
.site-shell__icon-btn { display: grid; place-items: center; width: 2.35rem; height: 2.35rem; padding: 0; border: 1px solid var(--bs-hairline); border-radius: 50%; background: var(--bs-surface-soft); color: var(--bs-ink); font-size: 1rem; line-height: 1; cursor: pointer; transition: 200ms cubic-bezier(.2,.9,.3,1.2); }
.site-shell__icon-btn:hover { background: rgba(255,143,179,.18); transform: translateY(-2px) rotate(-6deg); }
.site-shell__icon-btn:focus-visible { outline: 3px solid rgba(185,167,255,.72); outline-offset: 3px; }
/* The drawer is the phone navigation; the hamburger only appears when the
   horizontal nav would wrap into an unreadable stack. */
.site-shell__menu-btn { display: none; }
.site-shell__main { flex: 1; width: 100%; max-width: 1180px; margin: 0 auto; }
.site-shell__footer { width: 100%; margin-top: 5rem; }
.site-shell__footer-inner { max-width: 1180px; margin: 0 auto; padding: 1.6rem 1.4rem 1.2rem; border: 1px solid rgba(255,255,255,.6); border-radius: 1.6rem 1.6rem 0 0; background: rgba(255,250,245,.66); box-shadow: 0 -12px 40px rgba(95,66,118,.08); backdrop-filter: blur(18px); }
.site-shell__footer-brand strong { color: #392d4f; }
.site-shell__footer-brand p { margin: .3rem 0 0; color: #746b86; font-size: .9rem; }
.site-shell__footer-links { display: flex; flex-wrap: wrap; gap: .9rem; margin: 1rem 0 .6rem; }
.site-shell__footer-links a { color: #8b73c5; font-size: .88rem; text-decoration: none; transition: 180ms ease; }
.site-shell__footer-links a:hover { color: #e1799c; transform: translateY(-2px); }
.site-shell__footer-note { margin: 0; color: #9485a3; font-size: .8rem; }
@media (max-width: 860px) {
  .site-shell__header { align-items: center; flex-direction: row; border-radius: 999px; padding: .55rem .9rem; }
  /* Must out-specify the base .site-shell__header nav rule (0,1,1), or the
     horizontal nav keeps rendering next to the hamburger. */
  .site-shell__header .site-shell__desktop-nav { display: none; }
  .site-shell__header .site-shell__menu-btn { display: grid; }
}
@media (max-width: 480px) {
  .site-shell { padding: .6rem .7rem 0; }
  .site-shell__brand span:last-child { font-size: .95rem; }
}
</style>
