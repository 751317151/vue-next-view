<script setup lang="ts">
import { siteConfig, getSiteUrl } from '../../../src/config/site';
import type { PublicArticle } from '../../types/public';

const route = useRoute();
const slug = String(route.params.slug || '');
const runtimeConfig = useRuntimeConfig();
const siteUrl = runtimeConfig.public.siteUrl || useRequestURL().origin || getSiteUrl();

if (!slug) {
  throw createError({ statusCode: 404, statusMessage: '文章不存在' });
}

const { data: article, error } = await useAsyncData<PublicArticle>(`article-${slug}`, () => $fetch(`/api/articles/${encodeURIComponent(slug)}`));
if (error.value || !article.value) {
  throw createError({ statusCode: 404, statusMessage: '文章不存在' });
}

const articleData = article.value;

if (/^\d+$/.test(slug) && articleData.slug) {
  await navigateTo(`/article/${articleData.slug}`, { redirectCode: 301 });
}

// Resolve the real category slug instead of encoding the display name: names
// like "Spring Boot" or "创意实验" do not survive a round-trip through the URL,
// and the category page only matches on its own slug.
const { data: categoryIndex } = await useAsyncData<Array<{ slug: string; categoryName: string }>>(
  'article-category-index',
  () => $fetch('/api/categories'),
);
const categoryHref = computed(() => {
  const match = (categoryIndex.value || []).find((entry) => entry.categoryName === articleData.category);
  return match ? `/categories/${encodeURIComponent(match.slug)}` : null;
});
const { data: tagIndex } = await useAsyncData<Array<{ slug: string; tagName: string }>>(
  'article-tag-index',
  () => $fetch('/api/tags'),
);
const articleTags = computed(() => (articleData.tags || []).map((name) => ({
  name,
  slug: (tagIndex.value || []).find((entry) => entry.tagName === name)?.slug || '',
})));

const articleSeo = {
  title: articleData.articleTitle,
  // 优先用后端统一算好的摘要；没有才退回正文，交给下游截断。
  description: articleData.summary || articleData.articleContent,
  url: `${siteUrl || ''}/article/${encodeURIComponent(articleData.slug || slug)}`,
  image: articleData.articleCover,
  publishedAt: articleData.createTime,
  updatedAt: articleData.updateTime,
  category: articleData.category,
  categoryUrl: categoryHref.value ? `${siteUrl || ''}${categoryHref.value}` : undefined,
  tags: articleData.tags,
  author: siteConfig.author,
};
const seo = useArticleSeo(articleSeo);
const hero = articleArt({ id: articleData.id, category: articleData.category });
const heroEmoji = hero.emoji;
const heroStyle = hero.style;

// Re-create the page per article path so switching between stories never shows stale content.
definePageMeta({ key: (route) => route.fullPath });

const tocItems = computed(() => {
  const items: Array<{ id: string; text: string; level: number }> = [];
  const pattern = /<h([23]) id="([^"]+)">([\s\S]*?)<\/h\1>/g;
  for (const match of articleData.contentHtml?.matchAll(pattern) ?? []) {
    items.push({ id: match[2]!, level: Number(match[1]!), text: match[3]!.replace(/<[^>]+>/g, '') });
  }
  return items;
});

const activeHeadingId = ref('');
let spyFrame = 0;

const runSpy = () => {
  let current = '';
  for (const item of tocItems.value) {
    const heading = document.getElementById(item.id);
    if (heading && heading.getBoundingClientRect().top <= 140) current = item.id;
  }
  activeHeadingId.value = current;
};

const onSpyScroll = () => {
  if (spyFrame) return;
  spyFrame = window.requestAnimationFrame(() => {
    runSpy();
    spyFrame = 0;
  });
};

const copyText = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const area = document.createElement('textarea');
    area.value = value;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
};

const enhanceCodeBlocks = () => {
  document.querySelectorAll('.reading__body pre').forEach((pre) => {
    if (!(pre instanceof HTMLPreElement) || pre.querySelector('.code-copy')) return;
    const code = pre.querySelector('code');
    if (!code) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-copy';
    button.textContent = '复制 ✧';
    button.setAttribute('aria-label', '复制代码');
    button.addEventListener('click', () => {
      void copyText(code.innerText).then(() => {
        button.textContent = '复制好啦 ✨';
        window.setTimeout(() => { button.textContent = '复制 ✧'; }, 1600);
      });
    });
    pre.appendChild(button);
  });
  document.querySelectorAll('.reading__body h2, .reading__body h3, .reading__body h4').forEach((heading) => {
    if (!(heading instanceof HTMLElement) || heading.dataset.anchorReady) return;
    heading.dataset.anchorReady = '1';
    heading.addEventListener('click', () => {
      if (!heading.id) return;
      window.history.replaceState(null, '', `#${heading.id}`);
      heading.classList.add('is-flashing');
      window.setTimeout(() => heading.classList.remove('is-flashing'), 900);
    });
  });
};

const jumpToHeading = (id: string) => {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.history.replaceState(null, '', `#${id}`);
};

const backToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

onMounted(() => {
  enhanceCodeBlocks();
  window.addEventListener('scroll', onSpyScroll, { passive: true });
  runSpy();
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onSpyScroll);
  if (spyFrame) window.cancelAnimationFrame(spyFrame);
});
</script>

<template>
  <article class="reading">
    <!-- The progress bar is rendered once by the layout, so every page has it. -->

    <aside v-if="tocItems.length >= 2" class="reading__toc" aria-label="文章目录">
      <p class="reading__toc-title">目录 ✦</p>
      <ul>
        <li
          v-for="item in tocItems"
          :key="item.id"
          :class="[`reading__toc-item--h${item.level}`, { 'is-active': item.id === activeHeadingId }]"
        >
          <a :href="`#${item.id}`" @click.prevent="jumpToHeading(item.id)">{{ item.text }}</a>
        </li>
      </ul>
    </aside>

    <nav class="reading__crumbs" aria-label="面包屑">
      <NuxtLink to="/">首页</NuxtLink>
      <template v-if="articleData.category">
        <span>✧</span>
        <NuxtLink v-if="categoryHref" :to="categoryHref">{{ articleData.category }}</NuxtLink>
        <span v-else>{{ articleData.category }}</span>
      </template>
      <span>✧</span>
      <span aria-current="page">{{ articleData.articleTitle }}</span>
    </nav>

    <header class="reading__hero" :style="heroStyle">
      <b class="reading__hero-emoji">{{ heroEmoji }}</b>
    </header>

    <p class="reading__eyebrow">{{ siteConfig.name }} · 原创故事</p>
    <h1>{{ articleData.articleTitle }}</h1>
    <div class="reading__meta">
      <span><time :datetime="articleData.createTime">{{ formatDate(articleData.createTime) }}</time></span>
      <span>约 {{ readingMinutes(articleData.articleContent) }} 分钟</span>
      <span v-if="articleData.category">{{ articleData.category }}</span>
      <StarToggle
        class="reading__star"
        :item="{
          slug: articleData.slug || slug,
          title: articleData.articleTitle,
          emoji: heroEmoji,
          category: articleData.category,
        }"
      />
    </div>

    <img
      v-if="articleData.articleCover"
      class="reading__cover"
      :src="articleData.articleCover"
      :alt="articleData.articleTitle"
      loading="lazy"
      decoding="async"
    />

    <div class="reading__body" v-html="articleData.contentHtml"></div>

    <ul v-if="articleData.tags?.length" class="reading__tags" aria-label="文章标签">
      <li v-for="tag in articleTags" :key="tag.name">
        <NuxtLink v-if="tag.slug" :to="`/tags/${encodeURIComponent(tag.slug)}`">#{{ tag.name }}</NuxtLink>
        <span v-else>#{{ tag.name }}</span>
      </li>
    </ul>

    <section class="reading__finale" aria-label="读完啦">
      <p class="reading__finale-mark">✧･ﾟ</p>
      <strong>读到这里啦</strong>
      <p class="reading__finale-text">谢谢你把这篇小故事读完。愿它给你的今天，加一点柔软的光。</p>
      <div class="reading__finale-actions">
        <button type="button" @click="backToTop">回到顶部 ☝</button>
        <NuxtLink to="/archive" class="reading__finale-ghost">再读一篇 ✦</NuxtLink>
      </div>
    </section>

    <section v-if="articleData.recommendations?.length" class="reading__next" aria-labelledby="recommendations-title">
      <h2 id="recommendations-title">继续探索 ✦</h2>
      <div class="reading__next-grid">
        <NuxtLink v-for="recommendation in articleData.recommendations" :key="recommendation.id" :to="`/article/${recommendation.slug}`" class="reading__next-card">
          <span class="reading__next-art" :style="articleArt(recommendation).style">
            <b>{{ articleArt(recommendation).emoji }}</b>
          </span>
          <strong>{{ recommendation.articleTitle }}</strong>
          <small>{{ formatDate(recommendation.createTime) }}</small>
        </NuxtLink>
      </div>
    </section>
  </article>
</template>

<style scoped>
.reading { max-width: 820px; margin: 0 auto; padding: 1.5rem 0 5rem; }
.reading__crumbs { display: flex; flex-wrap: wrap; gap: .45rem; align-items: center; color: var(--bs-ink-muted); font-size: .84rem; }
.reading__crumbs a { color: var(--bs-link); text-decoration: none; }
.reading__crumbs a:hover { color: var(--bs-accent-strong); }
.reading__hero { position: relative; display: grid; place-items: center; height: 11rem; margin-top: 1.4rem; border-radius: 1.8rem; box-shadow: 0 20px 55px rgba(95,66,118,.16); overflow: hidden; }
.reading__hero::after { content: ''; position: absolute; inset: auto 1.2rem 0; height: 3px; border-radius: 999px; background: linear-gradient(90deg, var(--bs-pink), var(--bs-peach), var(--bs-lilac), var(--bs-mint)); }
.reading__hero-emoji { font-size: 3.6rem; filter: drop-shadow(0 10px 22px rgba(57,45,79,.2)); }
.reading__eyebrow { margin-top: 1.8rem; color: var(--bs-accent-ink); letter-spacing: .12em; }
.reading h1 { margin: .6rem 0 1rem; color: var(--bs-ink); font-size: clamp(2rem, 5.5vw, 3.6rem); line-height: 1.15; }
.reading__meta { display: flex; flex-wrap: wrap; gap: .55rem; }
.reading__meta span { padding: .35rem .7rem; border-radius: 999px; background: rgba(185,167,255,.16); color: var(--bs-ink-body); font-size: .82rem; }
.reading__star { align-self: center; margin-left: .1rem; }
.reading__cover { display: block; width: 100%; max-height: 26rem; margin-top: 1.8rem; border-radius: 1.5rem; object-fit: cover; box-shadow: 0 18px 50px rgba(95,66,118,.16); }
.reading__body { margin-top: 2rem; padding: 1.6rem 1.7rem; border: 1px solid var(--bs-border); border-radius: 1.5rem; background: var(--bs-surface); color: var(--bs-ink-body); line-height: 1.9; }
.reading__body :deep(h2), .reading__body :deep(h3), .reading__body :deep(h4) { margin: 1.7rem 0 .7rem; color: var(--bs-ink); }
.reading__body :deep(p) { margin: .85rem 0; }
.reading__body :deep(a) { color: var(--bs-link-strong); text-decoration-color: rgba(164,100,188,.4); }
.reading__body :deep(code) { padding: .12rem .4rem; border-radius: .4rem; background: rgba(185,167,255,.2); }
.reading__body :deep(pre) { overflow-x: auto; padding: 1.1rem; border-radius: 1rem; background: var(--bs-code-bg); color: var(--bs-code-ink); }
.reading__body :deep(pre code) { padding: 0; background: transparent; }
.reading__body :deep(img) { max-width: 100%; border-radius: .9rem; }
.reading__body :deep(blockquote) { margin: 1.2rem 0; padding: .8rem 1.1rem; border-left: 4px solid var(--bs-pink); border-radius: .8rem; background: var(--bs-tint-yellow); color: var(--bs-ink-body); }
.reading__tags { display: flex; flex-wrap: wrap; gap: .6rem; margin: 1.8rem 0 0; padding: 0; list-style: none; }
.reading__tags li { padding: .45rem .8rem; border-radius: 999px; background: rgba(158,230,208,.26); color: #4f6d67; font-size: .84rem; transition: transform var(--bs-dur-quick) var(--bs-ease-pop), background-color var(--bs-dur-quick) ease; }
.reading__tags a { display: inline-block; color: inherit; text-decoration: none; }
.reading__tags li:hover { background: rgba(158,230,208,.44); transform: translateY(-2px) rotate(-1.5deg); }
.reading__tags a:focus-visible { outline: 2px solid var(--bs-ink-line); outline-offset: 3px; border-radius: .4rem; }
:root.bs-dark .reading__tags li { color: var(--bs-mint); }
.reading__next { margin-top: 3.4rem; }
.reading__next h2 { color: var(--bs-ink); }
.reading__next-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .9rem; margin-top: 1rem; }
.reading__next-card { display: grid; gap: .45rem; padding: .9rem; border-radius: 1.2rem; background: var(--bs-surface); color: var(--bs-ink-body); text-decoration: none; transition: var(--bs-dur-base) ease; }
.reading__next-card:hover { transform: translateY(-4px) rotate(-.4deg); box-shadow: 0 16px 38px rgba(95,66,118,.16); }
.reading__next-art { display: grid; place-items: center; height: 6.5rem; border-radius: .9rem; }
.reading__next-art b { font-size: 2rem; filter: drop-shadow(0 6px 14px rgba(57,45,79,.18)); }
.reading__next-card strong { color: var(--bs-ink); line-height: 1.45; }
.reading__next-card small { color: var(--bs-ink-muted); }

/* Floating table of contents on wide screens. */
.reading__toc { position: fixed; top: 50%; right: max(1rem, calc(50vw - 604px)); z-index: 5; display: none; width: 11.5rem; max-height: 62vh; overflow: auto; padding: .9rem .8rem .7rem; border: 1px solid var(--bs-border); border-radius: 1.1rem; background: rgba(255,250,245,.8); box-shadow: 0 14px 38px rgba(95,66,118,.14); backdrop-filter: blur(14px); transform: translateY(-50%); }
:root.bs-dark .reading__toc { background: rgba(33, 26, 54, .86); box-shadow: 0 14px 38px rgba(0, 0, 0, .4); }
@media (min-width: 1240px) { .reading__toc { display: block; } }
.reading__toc-title { margin: 0 0 .45rem; color: var(--bs-accent-ink); font-size: .76rem; letter-spacing: .12em; }
.reading__toc ul { margin: 0; padding: 0; list-style: none; }
.reading__toc li { margin: .08rem 0; }
.reading__toc a { display: block; padding: .28rem .55rem; border-left: 2px solid transparent; border-radius: .55rem; color: var(--bs-ink-soft); font-size: .8rem; line-height: 1.5; text-decoration: none; transition: var(--bs-dur-quick) ease; }
.reading__toc li.reading__toc-item--h3 a { padding-left: 1.25rem; }
.reading__toc a:hover { color: var(--bs-ink); background: rgba(255,143,179,.14); }
.reading__toc li.is-active a { border-left-color: var(--bs-pink); background: rgba(255,228,138,.26); color: var(--bs-accent-ink); }

/* Code copy buttons and heading anchors (progressive enhancement over v-html). */
.reading__body :deep(pre) { position: relative; }
.reading__body :deep(.code-copy) { position: absolute; top: .6rem; right: .6rem; padding: .26rem .6rem; border: 1px solid rgba(255,250,245,.4); border-radius: 999px; background: rgba(255,250,245,.16); color: var(--bs-code-ink); font-size: .72rem; cursor: pointer; opacity: 0; transition: var(--bs-dur-quick) ease; }
.reading__body :deep(pre:hover .code-copy), .reading__body :deep(.code-copy:focus-visible) { opacity: 1; }
.reading__body :deep(.code-copy:hover) { background: rgba(255,143,179,.42); transform: translateY(-1px); }
@media (hover: none) { .reading__body :deep(.code-copy) { opacity: 1; } }
.reading__body :deep(h2), .reading__body :deep(h3), .reading__body :deep(h4) { position: relative; scroll-margin-top: 1.4rem; cursor: pointer; }
.reading__body :deep(h2)::before, .reading__body :deep(h3)::before, .reading__body :deep(h4)::before { position: absolute; left: -1.25rem; color: var(--bs-pink); content: '✦'; opacity: 0; transition: opacity var(--bs-dur-base) ease; }
.reading__body :deep(h2:hover)::before, .reading__body :deep(h3:hover)::before, .reading__body :deep(h4:hover)::before { opacity: .85; }
.reading__body :deep(.is-flashing) { animation: heading-flash var(--bs-dur-slow) ease; }
@keyframes heading-flash { 0% { text-shadow: none; } 40% { text-shadow: 0 0 18px rgba(255,143,179,.8); } 100% { text-shadow: none; } }

/* End-of-article thank-you card. */
.reading__finale { margin-top: 2.4rem; padding: 1.5rem 1.4rem; border: 1.5px dashed rgba(255,143,179,.5); border-radius: 1.5rem; background: rgba(255,228,138,.16); text-align: center; }
.reading__finale-mark { margin: 0; color: var(--bs-peach); letter-spacing: .3em; }
.reading__finale strong { display: block; margin-top: .4rem; color: var(--bs-ink); font-size: 1.15rem; }
.reading__finale-text { max-width: 30rem; margin: .45rem auto 0; color: var(--bs-ink-soft); font-size: .92rem; line-height: 1.8; }
.reading__finale-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: .7rem; margin-top: 1.1rem; }
.reading__finale-actions button, .reading__finale-actions a { padding: .55rem 1rem; border: 0; border-radius: 999px; background: linear-gradient(135deg, var(--bs-yellow), var(--bs-pink)); color: var(--bs-ink); font-weight: 600; text-decoration: none; cursor: pointer; transition: var(--bs-dur-quick) ease; }
.reading__finale-actions .reading__finale-ghost { background: var(--bs-surface-strong); box-shadow: 0 10px 26px rgba(95,66,118,.1); }
.reading__finale-actions button:hover, .reading__finale-actions a:hover { transform: translateY(-3px) rotate(-1deg); box-shadow: 0 14px 34px rgba(255,143,179,.28); }

@media (max-width: 640px) { .reading__next-grid { grid-template-columns: 1fr; } }
</style>
