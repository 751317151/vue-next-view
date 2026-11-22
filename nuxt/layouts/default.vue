<template>
  <div class="site-shell" :class="{ 'site-shell--home': isHome }">
    <a class="site-shell__skip" href="#main-content">跳到正文 ✦</a>
    <ClientOnly>
      <AmbientConstellation />
      <PointerGlow />
    </ClientOnly>

    <!-- Reading progress is global: every page gets the same indicator, not
         only the article template. -->
    <ClientOnly>
      <ReadingProgress />
    </ClientOnly>

    <header
      class="site-shell__header"
      :class="{ 'is-tucked': headerTucked, 'is-scrolled': scrolled }"
    >
      <NuxtLink to="/" class="site-shell__brand">
        <span class="site-shell__brand-mark">🌙</span>
        <span>{{ siteConfig.author }}</span>
      </NuxtLink>
      <nav class="site-shell__desktop-nav" aria-label="主导航">
        <NuxtLink to="/explore" class="site-shell__explore">漫游 ✦</NuxtLink>
        <NuxtLink to="/archive">归档</NuxtLink>
        <NuxtLink to="/categories">分类</NuxtLink>
        <NuxtLink to="/tags">标签</NuxtLink>
        <NuxtLink to="/desk" class="site-shell__desk">书桌 ✦</NuxtLink>
        <NuxtLink to="/about">关于</NuxtLink>
        <NuxtLink to="/message">留言板</NuxtLink>
        <NuxtLink to="/search" class="site-shell__search">搜索 ✦</NuxtLink>
        <ThemeToggle />
      </nav>
      <div class="site-shell__actions">
        <!-- The buttons render on the server so a phone on a slow connection
             still has a way to open the menu before hydration finishes. Only
             the overlays themselves need ClientOnly. -->
        <button
          type="button"
          class="site-shell__icon-btn site-shell__compass-btn"
          aria-label="打开星海罗盘（Ctrl+K 或 ⌘K）"
          aria-haspopup="dialog"
          :aria-expanded="compassOpen"
          aria-keyshortcuts="Control+K Meta+K"
          title="星海罗盘 · Ctrl+K / ⌘K"
          @click="openCompass()"
        >
          <span class="site-shell__compass-glyph" aria-hidden="true">✦</span>
        </button>
        <button
          type="button"
          class="site-shell__icon-btn"
          aria-label="主题与设置"
          aria-haspopup="dialog"
          :aria-expanded="settingsOpen"
          @click="settingsOpen = true"
        >
          <span aria-hidden="true">⚙</span>
        </button>
        <button
          type="button"
          class="site-shell__icon-btn site-shell__menu-btn"
          :aria-expanded="drawerOpen"
          aria-haspopup="dialog"
          aria-label="打开菜单"
          @click="drawerOpen = true"
        >
          <span aria-hidden="true">☰</span>
        </button>
      </div>
    </header>
    <!-- 星愿瓶刻意放在 ClientOnly 之外：瓶子本身在 SSR 就能画出来（初始为空瓶），
         水合后只是把本地收藏填进去，不会造成布局跳动或首屏空白。 -->
    <StarJar />
    <main id="main-content" class="site-shell__main" tabindex="-1"><slot /></main>
    <ClientOnly>
      <BackToTop />
      <MobileDrawer v-model="drawerOpen" @settings="settingsOpen = true" @compass="openCompass('drawer')" />
      <SettingsSheet :open="settingsOpen" @close="settingsOpen = false" />
      <StarCompass :open="compassOpen" :source="compassSource" @close="compassOpen = false" @settings="openSettingsFromCompass" />
      <ExcerptShelf />
      <!-- 团子现在有 Nuxt 版实现了，走统一停靠区，叠在回到顶部上方。 -->
      <MochiCompanion />
    </ClientOnly>
    <footer class="site-shell__footer">
      <div class="site-shell__footer-inner">
        <div class="site-shell__footer-brand">
          <strong>🌙 {{ siteConfig.name }}</strong>
          <p>把技术、生活和灵感，写成会发光的小故事。</p>
        </div>
        <nav class="site-shell__footer-links" aria-label="页脚导航">
          <NuxtLink to="/explore">灵感星图</NuxtLink>
          <NuxtLink to="/archive">归档</NuxtLink>
          <NuxtLink to="/categories">分类</NuxtLink>
          <NuxtLink to="/tags">标签</NuxtLink>
          <NuxtLink to="/desk">我的书桌</NuxtLink>
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
// The Nuxt copy supersedes the legacy one: it reacts to the star jar and fixes
// the orb/card layout. Auto-import would pick this up, but the explicit import
// of the legacy path was shadowing it.
import MochiCompanion from '../components/MochiCompanion.vue';
import { siteConfig } from '../../src/config/site';

const drawerOpen = ref(false);
const settingsOpen = ref(false);
const compassOpen = ref(false);
const compassSource = ref<'menu' | 'drawer'>('menu');
const route = useRoute();
const isHome = computed(() => route.path === '/');

/** 打开罗盘时收起其它弹层，保证同一时间只有一个 aria-modal 接管焦点。 */
const openCompass = (source: 'menu' | 'drawer' = 'menu') => {
  drawerOpen.value = false;
  settingsOpen.value = false;
  compassSource.value = source;
  compassOpen.value = true;
};

/** 罗盘里的"主题与设置"：先收起罗盘，再打开设置面板。 */
const openSettingsFromCompass = () => {
  compassOpen.value = false;
  settingsOpen.value = true;
};

/** Ctrl/⌘+K 是桌面用户的主入口，`/` 则照顾习惯 Vim 式搜索的人。 */
const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
};

const onCompassShortcut = (event: KeyboardEvent) => {
  if (event.defaultPrevented || event.isComposing) return;
  const key = event.key.toLowerCase();
  const combo = (event.metaKey || event.ctrlKey) && !event.altKey && key === 'k';
  const slash = key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && !isEditableTarget(event.target);
  if (!combo && !slash) return;
  event.preventDefault();
  openCompass();
};

// Apply the stored theme as soon as the client takes over. The inline boot
// script already set the class before paint; this hydrates the reactive state
// so the Settings sheet shows the correct selection.
const { init } = useAppearance();
onMounted(init);

/**
 * Hide the header while scrolling down and bring it back on the way up, so a
 * phone screen is not permanently spending 60px on navigation. The threshold
 * stops a jittery finger from flickering it in and out.
 */
const headerTucked = ref(false);
const scrolled = ref(false);
let lastY = 0;
let frame = 0;
let downTravel = 0;
let upTravel = 0;

const onScroll = () => {
  if (frame) return;
  frame = window.requestAnimationFrame(() => {
    const y = window.scrollY;
    scrolled.value = y > 8;
    const delta = y - lastY;
    // Accumulate direction instead of comparing single frames: a slow phone
    // scroll moves only 1–2px per frame, and a per-frame threshold would make
    // the bar wait several hundred milliseconds before tucking.
    if (delta > 0) {
      downTravel += delta;
      upTravel = 0;
    } else if (delta < 0) {
      upTravel -= delta;
      downTravel = 0;
    }
    if (y <= 16 || upTravel >= 4) headerTucked.value = false;
    else if (downTravel >= 4) headerTucked.value = true;
    if (drawerOpen.value || settingsOpen.value) headerTucked.value = false;
    lastY = y;
    frame = 0;
  });
};

onMounted(() => {
  lastY = window.scrollY;
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('keydown', onCompassShortcut);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('keydown', onCompassShortcut);
  if (frame) window.cancelAnimationFrame(frame);
});

// Opening a panel must always reveal the header underneath it.
watch([drawerOpen, settingsOpen], ([drawer, sheet]) => {
  if (drawer || sheet) headerTucked.value = false;
});
</script>

<style scoped>
.site-shell { display: flex; min-height: 100vh; flex-direction: column; padding: 1rem clamp(1rem, 4vw, 4rem) 0; position: relative; }

/* Screentone texture scoped to the shell, behind everything it contains.
   The body pseudo-elements already host the drifting colour orbs. */
.site-shell::before {
  position: fixed;
  inset: 0;
  z-index: 0;
  background-image: var(--bs-halftone);
  background-size: var(--bs-halftone-size);
  content: "";
  opacity: .45;
  pointer-events: none;
  -webkit-mask-image: radial-gradient(ellipse at 50% 0%, #000 0%, transparent 72%);
  mask-image: radial-gradient(ellipse at 50% 0%, #000 0%, transparent 72%);
}
/* Lift only the layout children above the texture. Using `.site-shell > *`
   here would also override position:fixed on the ambient overlays, dragging
   them back into normal flow and pushing the header down by their full size.
   The header is deliberately excluded: it is fixed, and this selector would
   out-specify that and force it back into flow. */
.site-shell > main,
.site-shell > footer { position: relative; z-index: 1; }

.site-shell__header {
  /* Fixed rather than sticky: a sticky bar scrolls out of the viewport once the
     page passes its height, so translating it back on scroll-up had no effect
     (it was already 288px above the fold). Fixed keeps it anchored to the
     viewport and lets the tuck animation actually bring it back. */
  position: fixed;
  top: .6rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 70;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  max-width: 1180px;
  width: calc(100% - 2 * clamp(1rem, 4vw, 4rem));
  padding: .7rem 1.2rem;
  border: 1px solid var(--bs-hairline);
  border-radius: 999px;
  /* A flat translucent fill disappeared against the very light page gradient,
     reading as an empty strip. A subtle two-stop gradient plus a stronger
     opaque base gives the bar an edge to sit against. */
  background:
    linear-gradient(135deg, rgba(255, 250, 245, .97), rgba(255, 240, 247, .95));
  box-shadow: 0 12px 40px rgba(95, 66, 118, .12), inset 0 1px 0 rgba(255, 255, 255, .7);
  will-change: transform;
  transition: transform var(--bs-dur-base) var(--bs-ease-glide), box-shadow var(--bs-dur-base) ease, background-color var(--bs-dur-base) ease;
}

/* Scrolled a little: tighten the shadow so the bar separates from content. */
.site-shell__header.is-scrolled { box-shadow: 0 16px 44px rgba(95, 66, 118, .18), inset 0 1px 0 rgba(255, 255, 255, .7); }

/* Dark theme needs its own fill; the light gradient above would glow. */
:root.bs-dark .site-shell__header {
  background: linear-gradient(135deg, rgba(48, 40, 64, .97), rgba(40, 33, 55, .95));
  box-shadow: 0 12px 40px rgba(0, 0, 0, .4), inset 0 1px 0 rgba(255, 255, 255, .06);
}
:root.bs-dark .site-shell__header.is-scrolled { box-shadow: 0 16px 44px rgba(0, 0, 0, .48), inset 0 1px 0 rgba(255, 255, 255, .06); }

/* Scrolling down tucks it above the viewport; scrolling up drops it back. */
.site-shell__header.is-tucked { transform: translateX(-50%) translateY(calc(-100% - .8rem)); }

/* Content pages clear the fixed bar; the home hero sits underneath it. */
.site-shell__main { padding-top: 3.9rem; }
.site-shell--home .site-shell__main { padding-top: 0; }

/* The brand is a wordmark, not a headline: keep it close to the nav text so it
   does not dominate the bar. */
.site-shell__brand { display: inline-flex; align-items: center; gap: .4rem; color: var(--bs-ink); font-size: .95rem; font-weight: 700; letter-spacing: .01em; text-decoration: none; text-shadow: 1px 1px 0 rgba(255, 228, 138, .55); }
:root.bs-dark .site-shell__brand { text-shadow: 1px 1px 0 rgba(255, 228, 138, .16); }
.site-shell__brand-mark { font-size: 1rem; transition: transform var(--bs-dur-base) ease; }
.site-shell__brand:hover .site-shell__brand-mark { transform: rotate(-14deg) scale(1.15); }
.site-shell__header nav { display: flex; align-items: center; gap: .3rem; flex-wrap: wrap; justify-content: flex-end; }
.site-shell__header nav a { position: relative; padding: .45rem .75rem; border-radius: 999px; color: var(--bs-ink-soft); font-size: .9rem; text-decoration: none; transition: var(--bs-dur-quick) ease; }
.site-shell__skip { position: fixed; top: .45rem; left: 1rem; z-index: 130; padding: .48rem .8rem; border: 1.5px solid var(--bs-ink-line); border-radius: 999px; background: var(--bs-yellow); color: var(--bs-ink-on-accent); font-size: .8rem; font-weight: 700; text-decoration: none; box-shadow: var(--bs-sticker-shadow); transform: translateY(-.4rem); opacity: 0; pointer-events: none; transition: opacity var(--bs-dur-quick) ease, transform var(--bs-dur-quick) var(--bs-ease-pop); }
.site-shell__skip:focus-visible { opacity: 1; pointer-events: auto; transform: none; outline: 3px solid rgba(185, 167, 255, .72); outline-offset: 3px; }
.site-shell__main:focus { outline: none; }
.site-shell__header nav a::after { content: ''; position: absolute; inset: auto .8rem -1px; height: 2px; border-radius: 999px; background: linear-gradient(90deg, var(--bs-pink), var(--bs-peach), var(--bs-lilac)); opacity: 0; transform: scaleX(.3); transition: var(--bs-dur-base) ease; }
.site-shell__header nav a:hover, .site-shell__header nav a.router-link-active { color: var(--bs-ink); background: rgba(255, 143, 179, .16); transform: translateY(-2px); }
:root.bs-dark .site-shell__header nav a:hover, :root.bs-dark .site-shell__header nav a.router-link-active { background: rgba(255, 143, 179, .22); }
.site-shell__header nav a:hover::after, .site-shell__header nav a.router-link-active::after { opacity: 1; transform: scaleX(1); }
.site-shell__header nav .site-shell__search { border: 1px dashed rgba(185, 167, 255, .6); }
/* The star-map entry is the one playful detour in a conventionally ordered
   navigation. A warm daub keeps it discoverable without shouting over the
   content links, and its tilt is reset on hover so the label stays legible. */
.site-shell__header nav .site-shell__explore { margin-right: .15rem; border: 1px solid rgba(255, 143, 179, .34); background: linear-gradient(135deg, rgba(255, 228, 138, .34), rgba(255, 143, 179, .18)); color: var(--bs-accent-ink); font-weight: 600; transform: rotate(-1.2deg); }
.site-shell__header nav .site-shell__explore:hover, .site-shell__header nav .site-shell__explore.router-link-active { background: linear-gradient(135deg, rgba(255, 228, 138, .64), rgba(255, 143, 179, .3)); transform: rotate(0) translateY(-2px); }
.site-shell__header nav .site-shell__desk { border: 1px dashed rgba(158, 230, 208, .75); background: rgba(158, 230, 208, .13); color: var(--bs-ink); font-weight: 600; }
.site-shell__header nav .site-shell__desk:hover, .site-shell__header nav .site-shell__desk.router-link-active { background: rgba(158, 230, 208, .28); }

.site-shell__actions { display: flex; align-items: center; gap: .4rem; }
.site-shell__icon-btn { display: grid; place-items: center; width: 2.35rem; height: 2.35rem; padding: 0; border: 1px solid var(--bs-hairline); border-radius: 50%; background: var(--bs-surface-soft); color: var(--bs-ink); font-size: 1rem; line-height: 1; cursor: pointer; transition: var(--bs-dur-quick) var(--bs-ease-pop); }
.site-shell__icon-btn:hover { background: rgba(255, 143, 179, .18); transform: translateY(-2px) rotate(-6deg); }
.site-shell__icon-btn:focus-visible { outline: 3px solid rgba(185, 167, 255, .72); outline-offset: 3px; }
.site-shell__compass-btn { border-color: rgba(255, 228, 138, .7); background: linear-gradient(135deg, rgba(255, 228, 138, .3), rgba(255, 143, 179, .16)); }
.site-shell__compass-glyph { color: var(--bs-accent-ink); transition: transform var(--bs-dur-base) var(--bs-ease-pop); }
.site-shell__compass-btn:hover .site-shell__compass-glyph { transform: rotate(90deg) scale(1.15); }
/* The drawer is the phone navigation; the hamburger only appears when the
   horizontal nav would wrap into an unreadable stack. */
.site-shell__menu-btn { display: none; }
.site-shell__main { flex: 1; width: 100%; max-width: 1180px; margin: 0 auto; }
.site-shell__footer { width: 100%; margin-top: 5rem; }
.site-shell__footer-inner { max-width: 1180px; margin: 0 auto; padding: 1.6rem 1.4rem 1.2rem; border: 1px solid var(--bs-hairline); border-radius: 1.6rem 1.6rem 0 0; background: var(--bs-paper-strong); box-shadow: 0 -12px 40px rgba(95, 66, 118, .08); backdrop-filter: blur(18px); }
.site-shell__footer-brand strong { color: var(--bs-ink); }
.site-shell__footer-brand p { margin: .3rem 0 0; color: var(--bs-ink-soft); font-size: .9rem; }
.site-shell__footer-links { display: flex; flex-wrap: wrap; gap: .35rem .5rem; margin: .9rem 0 .5rem; }
.site-shell__footer-links a { display: inline-flex; align-items: center; min-height: 2.75rem; padding: .3rem .55rem; border-radius: 999px; color: var(--bs-link); font-size: .88rem; text-decoration: none; transition: var(--bs-dur-quick) ease; }
.site-shell__footer-links a:hover { color: var(--bs-accent-strong); background: var(--bs-tint-pink); transform: translateY(-2px); }
.site-shell__footer-note { margin: 0; color: var(--bs-ink-soft); font-size: .8rem; }

@media (max-width: 860px) {
  /* The phone bar keeps only the brand and the two icon buttons. */
  .site-shell__header { top: .45rem; gap: .5rem; padding: .5rem .7rem .5rem .95rem; }
  .site-shell__header .site-shell__desktop-nav { display: none; }
  .site-shell__header .site-shell__menu-btn { display: grid; }
  .site-shell__actions { gap: .3rem; }
  .site-shell__brand { gap: .35rem; font-size: .95rem; }
  .site-shell__icon-btn { width: 2.1rem; height: 2.1rem; }
}
@media (max-width: 480px) {
  .site-shell { padding: .5rem .6rem 0; }
  .site-shell__brand span:last-child { font-size: .86rem; }
  .site-shell__header { padding: .45rem .55rem .45rem .85rem; }
  .site-shell__icon-btn { width: 2rem; height: 2rem; font-size: .92rem; }
}

/* Keep the artwork flush with the viewport on every breakpoint while the
   navigation keeps its own floating inset. */
.site-shell--home { padding-top: 0; }

@media (prefers-reduced-motion: reduce) {
  .site-shell__header { transition: none; }
}
.site-shell__header.is-tucked { pointer-events: none; }
</style>
