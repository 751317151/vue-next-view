<script setup lang="ts">
import { siteConfig } from '../../src/config/site';
import type { PublicArticle, PublicCategory, PublicGlint, PublicTag } from '../types/public';
usePageSeo({
  path: '/',
  title: siteConfig.name,
  description: siteConfig.description,
});

// The resting middle image is bg1 after swapping the left and middle artwork.
useHead({ link: [{ rel: 'preload', as: 'image', href: '/bg1.jpg', fetchpriority: 'high' }] });
// 首页的 100svh 大图会盖住 body 的固定渐变，切到纯色底能省掉一层全屏合成。
useHead({ bodyAttrs: { class: 'bs-home' } });

const [{ data: articles }, { data: categories }, { data: tags }, { data: glints }] = await Promise.all([
  useAsyncData<PublicArticle[]>('public-articles', () => $fetch<PublicArticle[]>('/api/articles')),
  useAsyncData<PublicCategory[]>('public-categories', () => $fetch<PublicCategory[]>('/api/categories')),
  useAsyncData<PublicTag[]>('public-tags', () => $fetch<PublicTag[]>('/api/tags')),
  useAsyncData<PublicGlint[]>('public-glints', () => $fetch<PublicGlint[]>('/api/glints')),
]);

const latest = computed(() => (articles.value || []).slice(0, 6));
const totalWords = computed(() => (articles.value || []).reduce((sum, article) => sum + (article.articleContent || '').length, 0));

/**
 * 「接着读」只在客户端出现：localStorage 里没有记录时整块不渲染，
 * SSR 和首次水合都不会多出一块占位，首页不会跳。
 */
const { items: readingTrail, hydrate: hydrateReadingTrail } = useReadingTrail();
const nextRead = computed(() => {
  const inProgress = readingTrail.value
    .filter((item) => item.progress >= 0.03 && item.progress < 0.97)
    .sort((a, b) => b.at - a.at);
  const picked = inProgress[0];
  if (!picked) return null;
  return {
    ...picked,
    percent: Math.min(99, Math.max(1, Math.round(picked.progress * 100))),
  };
});

onMounted(hydrateReadingTrail);
</script>

<template>
  <div class="home-page">
    <HomeHero />

    <div id="home-body" class="home">
      <dl class="home__stats">
        <div><dt>文章</dt><dd>{{ articles?.length ?? 0 }}</dd></div>
        <div><dt>分类</dt><dd>{{ categories?.length ?? 0 }}</dd></div>
        <div><dt>标签</dt><dd>{{ tags?.length ?? 0 }}</dd></div>
        <div><dt>写下</dt><dd>{{ Math.round(totalWords / 1000) }}k 字</dd></div>
      </dl>

      <ClientOnly>
        <NuxtLink v-if="nextRead" :to="`/article/${nextRead.slug}`" class="home__continue">
          <span class="home__continue-art" aria-hidden="true">{{ nextRead.emoji }}</span>
          <span class="home__continue-copy">
            <small>接着读 · 上次停在这里</small>
            <strong>{{ nextRead.title }}</strong>
            <span class="home__continue-track" aria-hidden="true">
              <span :style="{ width: `${nextRead.percent}%` }"></span>
            </span>
            <em>
              读到 {{ nextRead.percent }}%
              <template v-if="nextRead.headingText"> ·「{{ nextRead.headingText }}」</template>
            </em>
          </span>
          <span class="home__continue-arrow" aria-hidden="true">→</span>
        </NuxtLink>
      </ClientOnly>

      <!-- 微光：短记录比长文更适合日常更新，也让首页永远有新东西可读。 -->
      <section v-if="glints?.length" class="home__glints" aria-labelledby="home-glints-title">
        <div class="home__section-head">
          <h2 id="home-glints-title">微光</h2>
          <NuxtLink to="/glints">全部微光 →</NuxtLink>
        </div>
        <GlintStrip :glints="glints" :limit="3" />
      </section>

      <section class="home__latest" aria-labelledby="latest-articles-title">
        <div class="home__section-head">
          <h2 id="latest-articles-title">最近写下的故事</h2>
          <span class="home__section-links">
            <NuxtLink to="/desk" class="home__desk-link">我的书桌 ✦</NuxtLink>
            <NuxtLink to="/archive">查看全部 →</NuxtLink>
          </span>
        </div>
        <div class="home__grid">
          <ArticleCard v-for="article in latest" :key="article.id" :article="article" />
        </div>
      </section>

      <hr class="bs-halftone-divider" aria-hidden="true" />

      <!-- 星图漫游是首页到内容发现之间的“任意门”：它不复制文章列表，
           而是把心情、时间和随机抽取组合成一条不同的浏览路径。 -->
      <section class="home__explore" aria-labelledby="home-explore-title">
        <div class="home__explore-copy">
          <h2 id="home-explore-title">去星图漫游</h2>
          <p class="home__explore-sub">按心情和年份，遇见下一篇刚好想读的故事。</p>
        </div>
        <NuxtLink to="/explore" class="home__explore-link">
          <span class="home__explore-orbit" aria-hidden="true"><i></i><i></i></span>
          <span class="home__explore-label">去星图漫游 <b aria-hidden="true">→</b></span>
        </NuxtLink>
      </section>

      <section v-if="categories?.length" class="home__paths" aria-labelledby="home-paths-title">
        <div class="home__section-head">
          <h2 id="home-paths-title">分类</h2>
          <NuxtLink to="/categories">全部分类 →</NuxtLink>
        </div>
        <div class="home__paths-grid">
          <NuxtLink v-for="category in categories" :key="category.id" :to="`/categories/${category.slug}`" class="home__path">
            <strong>{{ category.categoryName }}</strong>
            <span>{{ category.articleCount || 0 }} 篇</span>
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.home-page { padding-bottom: 1rem; }
.home { max-width: 820px; margin: 0 auto; padding: 1.2rem 0 3rem; }
.home__stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .6rem; margin: 0 0 3.4rem; }
.home__stats > div { padding: .8rem .5rem; border: 1px solid var(--bs-border); border-radius: 1.1rem; background: var(--bs-surface); text-align: center; }
.home__stats dt { color: var(--bs-ink-muted); font-size: .78rem; }
.home__stats dd { margin: .15rem 0 0; color: var(--bs-ink); font-size: 1.25rem; font-weight: 700; }

/* 接着读：一张横放的旧书签，压在统计和最新文章之间。 */
.home__continue { position: relative; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: .85rem; align-items: center; margin: 0 0 2.6rem; padding: .9rem 1.1rem; overflow: hidden; border: 1.5px dashed rgba(255, 143, 179, .5); border-radius: 1.2rem; background: linear-gradient(135deg, rgba(255, 228, 138, .26), rgba(185, 167, 255, .16)); color: var(--bs-ink-body); text-decoration: none; transition: transform var(--bs-dur-base) var(--bs-ease-pop), box-shadow var(--bs-dur-base) ease, border-color var(--bs-dur-base) ease; }
.home__continue::after { position: absolute; right: -2.2rem; bottom: -2.6rem; width: 7rem; height: 7rem; border: 1px dashed rgba(185, 167, 255, .38); border-radius: 50%; content: ""; pointer-events: none; }
.home__continue:hover { border-color: var(--bs-pink); transform: translateY(-3px) rotate(-.35deg); box-shadow: 0 16px 36px rgba(255, 143, 179, .22); }
.home__continue:focus-visible { outline: 3px solid rgba(185, 167, 255, .72); outline-offset: 3px; }
.home__continue-art { display: grid; place-items: center; width: 2.6rem; height: 2.6rem; flex: 0 0 auto; border: 1.5px solid var(--bs-ink-line); border-radius: .85rem; background: var(--bs-surface-strong); font-size: 1.2rem; box-shadow: 2px 2px 0 var(--bs-ink-line); transform: rotate(-4deg); transition: transform var(--bs-dur-base) var(--bs-ease-pop); }
.home__continue:hover .home__continue-art { transform: rotate(3deg) scale(1.06); }
.home__continue-copy { position: relative; z-index: 1; display: grid; gap: .12rem; min-width: 0; }
.home__continue-copy small { color: var(--bs-accent-ink); font-size: .66rem; letter-spacing: .14em; }
.home__continue-copy strong { overflow: hidden; color: var(--bs-ink); font-size: .95rem; text-overflow: ellipsis; white-space: nowrap; }
.home__continue-track { display: block; width: 100%; height: .26rem; margin-top: .25rem; overflow: hidden; border-radius: 999px; background: rgba(57, 45, 79, .12); }
.home__continue-track span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--bs-lilac), var(--bs-pink), var(--bs-yellow)); transition: width var(--bs-dur-slow) var(--bs-ease-pop); }
.home__continue-copy em { overflow: hidden; color: var(--bs-ink-soft); font-size: .72rem; font-style: normal; text-overflow: ellipsis; white-space: nowrap; }
.home__continue-arrow { color: var(--bs-accent-ink); font-size: 1.05rem; transition: transform var(--bs-dur-quick) ease; }
.home__continue:hover .home__continue-arrow { transform: translateX(4px); }
:root.bs-dark .home__continue { background: linear-gradient(135deg, rgba(255, 228, 138, .12), rgba(185, 167, 255, .16)); }
:root.bs-dark .home__continue-track { background: rgba(244, 236, 255, .16); }

.home__latest, .home__paths { margin-top: 3.4rem; }
.home__latest { margin-top: 3.4rem; }
.home__glints { margin-top: 0; padding: 1.1rem 1.15rem 1.2rem; border: 1px dashed rgba(255, 189, 138, .55); border-radius: 1.4rem; background: linear-gradient(140deg, rgba(255, 228, 138, .14), rgba(255, 240, 247, .36)); }
:root.bs-dark .home__glints { border-color: rgba(255, 201, 155, .32); background: linear-gradient(140deg, rgba(255, 233, 160, .07), rgba(44, 35, 68, .5)); }
.home__glints .home__section-head { margin-bottom: .7rem; }
.home__section-head { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; }
.home__section-head h2 { color: var(--bs-ink); }
.home__section-head a { color: var(--bs-link); text-decoration: none; }
.home__section-links { display: inline-flex; flex-wrap: wrap; align-items: baseline; gap: .75rem; }
.home__section-head a.home__desk-link { padding: .18rem .6rem; border: 1px dashed rgba(158, 230, 208, .8); border-radius: 999px; background: rgba(158, 230, 208, .14); color: var(--bs-ink-body); font-size: .82rem; white-space: nowrap; transition: background var(--bs-dur-quick) ease, transform var(--bs-dur-quick) var(--bs-ease-pop), border-color var(--bs-dur-quick) ease; }
.home__section-head a.home__desk-link:hover { border-color: var(--bs-mint); background: rgba(158, 230, 208, .3); color: var(--bs-ink); transform: translateY(-2px) rotate(-1deg); }
:root.bs-dark .home__section-head a.home__desk-link { border-color: rgba(158, 230, 208, .42); background: rgba(158, 230, 208, .12); }
.home__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin-top: 1.1rem; }
.home__paths-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: .7rem; margin-top: 1.1rem; }
.home__explore { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 1.4rem; margin-top: 1rem; padding: clamp(1.1rem, 3vw, 1.6rem); overflow: hidden; border: 1px solid var(--bs-border); border-radius: 1.5rem; background: radial-gradient(circle at 88% 18%, rgba(255, 228, 138, .32), transparent 34%), linear-gradient(135deg, rgba(255, 240, 247, .7), rgba(246, 243, 255, .62)); box-shadow: var(--bs-shadow-soft); }
.home__explore::after { position: absolute; top: -2.8rem; right: -2rem; width: 10rem; height: 10rem; border: 1px dashed rgba(185, 167, 255, .45); border-radius: 50%; content: ""; pointer-events: none; }
.home__explore-copy { position: relative; z-index: 1; }
.home__explore h2 { margin: 0 0 .3rem; color: var(--bs-ink); font-size: clamp(1.15rem, 2.6vw, 1.5rem); }
.home__explore-sub { margin: 0; color: var(--bs-ink-soft); font-size: .88rem; line-height: 1.7; }
.home__explore-link { position: relative; z-index: 1; display: inline-flex; align-items: center; gap: .6rem; min-height: 3rem; padding: .55rem 1rem; border: 1.5px solid var(--bs-ink-line); border-radius: 999px; background: var(--bs-yellow); color: var(--bs-ink-on-accent); font-weight: 700; text-decoration: none; box-shadow: var(--bs-sticker-shadow); transition: transform var(--bs-dur-base) var(--bs-ease-pop), box-shadow var(--bs-dur-base) ease; }
.home__explore-link b { color: inherit; }
:root.bs-dark .home__explore { background: radial-gradient(circle at 88% 18%, rgba(255, 228, 138, .16), transparent 34%), linear-gradient(135deg, rgba(44, 35, 68, .82), rgba(33, 26, 54, .74)); }
.home__explore-link:hover { transform: translate(-2px, -3px) rotate(-1deg); box-shadow: 5px 6px 0 var(--bs-ink-line); }
.home__explore-orbit { position: relative; display: grid; place-items: center; width: 1.7rem; height: 1.7rem; border: 1px solid var(--bs-accent-ink); border-radius: 50%; }
.home__explore-orbit i { position: absolute; width: .3rem; height: .3rem; border-radius: 50%; background: var(--bs-accent-strong); }
.home__explore-orbit i:first-child { top: -.15rem; left: .55rem; }
.home__explore-orbit i:last-child { right: -.1rem; bottom: .25rem; background: var(--bs-link); }
.home__explore-label b { transition: transform var(--bs-dur-quick) ease; }
.home__explore-link:hover .home__explore-label b { transform: translateX(3px); }
.home__path { display: flex; align-items: center; justify-content: space-between; gap: .5rem; padding: .85rem 1rem; border-radius: 1rem; background: var(--bs-surface); color: var(--bs-ink-body); text-decoration: none; transition: var(--bs-dur-quick) ease; }
.home__path strong { color: var(--bs-ink); }
.home__path span { color: var(--bs-ink-muted); font-size: .8rem; }
.home__path:hover { background: rgba(255,228,138,.3); transform: translateY(-3px); }
@media (max-width: 700px) { .home__grid { grid-template-columns: 1fr; } .home__stats { grid-template-columns: repeat(2, 1fr); } .home__explore { grid-template-columns: 1fr; align-items: start; } }
</style>
