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

const { data: article, error } = await useAsyncData<PublicArticle>(
  `article-${slug}`,
  () => $fetch<PublicArticle>(`/api/articles/${encodeURIComponent(slug)}`),
);
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
  () => $fetch<Array<{ slug: string; categoryName: string }>>('/api/categories'),
);
const categoryHref = computed(() => {
  const match = (categoryIndex.value || []).find((entry) => entry.categoryName === articleData.category);
  return match ? `/categories/${encodeURIComponent(match.slug)}` : null;
});
const { data: tagIndex } = await useAsyncData<Array<{ slug: string; tagName: string }>>(
  'article-tag-index',
  () => $fetch<Array<{ slug: string; tagName: string }>>('/api/tags'),
);
const articleTags = computed(() => (articleData.tags || []).map((name) => ({
  name,
  slug: (tagIndex.value || []).find((entry) => entry.tagName === name)?.slug || '',
})));

/**
 * 上一篇 / 下一篇。列表按发布时间从新到旧，所以"上一篇"是更早的那篇。
 * 用整份文章列表算，而不是详情接口里的推荐：推荐会随分类权重变化，
 * 翻页链接应该像书页一样稳定。数据已经在文章接口里带回来，不额外请求。
 */
const articleNeighbours = computed(() => {
  const pair = articleData.neighbours;
  return pair && (pair.previous || pair.next) ? pair : null;
});

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

/** 自动记录阅读足迹：进入文章 4 秒或滚动后开始更新，读到结尾记满进度。 */
const { track: trackReading, find: findReadingTrail } = useReadingTrail();
const { add: addExcerpt } = useExcerpts();
const { fontSize: readingSize, leading: readingLeading, setFontSize, setLeading, init: initReadingPrefs } = useReadingPrefs();
const bodyEl = ref<HTMLElement | null>(null);
const finaleEl = ref<HTMLElement | null>(null);
const resume = ref<{ progress: number; headingId?: string; headingText?: string } | null>(null);
const resumeDismissed = ref(false);
let readingTrailReady = false;
let readingTrailTimer = 0;
let lastTrackedProgress = 0;
let finaleObserver: IntersectionObserver | null = null;

/** 当前读到的小节：和目录高亮用同一个 160px 判定线，两处不会互相打架。 */
const currentHeading = () => {
  const body = bodyEl.value;
  if (!body) return null;
  let current: { id: string; text: string } | null = null;
  for (const heading of body.querySelectorAll<HTMLElement>('h2[id], h3[id], h4[id]')) {
    if (heading.getBoundingClientRect().top > 160) continue;
    current = {
      id: heading.id,
      text: (heading.textContent || '').trim().slice(0, 48),
    };
  }
  return current;
};

const recordProgress = (force = false) => {
  if (!readingTrailReady && !force) return;
  const body = bodyEl.value;
  if (!body) return;
  const rect = body.getBoundingClientRect();
  // 以正文底边进入视口的位置估算进度；正文离开视口时才是真正读完，
  // 短文章也不会一打开就被误判成“读完”。
  const progress = rect.height > 0
    ? Math.min(1, Math.max(0, (window.innerHeight - rect.top - window.innerHeight * 0.2) / rect.height))
    : 1;
  // 每 10% 才落一次盘，避免滚动时反复写 localStorage。
  if (!force && Math.abs(progress - lastTrackedProgress) < 0.1) return;
  lastTrackedProgress = progress;
  trackAt(Math.min(1, progress), currentHeading());
};

const trackAt = (progress: number, heading: { id: string; text: string } | null) => {
  trackReading({
    slug: articleData.slug || slug,
    title: articleData.articleTitle,
    category: articleData.category,
    emoji: heroEmoji,
    progress,
    headingId: heading?.id,
    headingText: heading?.text,
  });
};

const onReadingScroll = () => {
  if (!readingTrailReady) readingTrailReady = true;
  recordProgress();
};

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

/** 摘抄本跳回原文时，把"要找的那句话"暂存一次，避免把长句塞进 URL。 */
const PENDING_EXCERPT_KEY = 'blackstar-excerpt-jump';

/**
 * 从摘抄本跳回来时，把原文里那句话轻轻点亮一次。
 *
 * 正文由 markdown 渲染，一句话可能被 <strong>/<code> 拆开，所以按纯文本
 * 查找比按 HTML 结构更稳。找不到就只停在对应小节，不影响阅读。
 */
const flashExcerptTarget = (text: string) => {
  const body = bodyEl.value;
  if (!body || !text) return;
  const probe = text.slice(0, 40);
  // `window.find` 是非标准 API，TypeScript 的 DOM 类型里没有它。
  const findInPage = (window as unknown as {
    find?: (text: string, caseSensitive?: boolean, backwards?: boolean, wrapAround?: boolean, wholeWord?: boolean, searchInFrames?: boolean, showDialog?: boolean) => boolean;
  }).find;
  const found = typeof findInPage === 'function'
    ? findInPage(probe, false, false, true, false, true, false)
    : false;
  if (!found) return;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  // 只点亮确认落在正文里的选区，避免误标页面其它位置。
  if (!body.contains(range.commonAncestorContainer)) {
    selection.removeAllRanges();
    return;
  }
  selection.removeAllRanges();
  // CSS Custom Highlight 直接给文字上色，不需要插节点，也不会被正文背景盖住。
  const highlightCtor = (window as unknown as { Highlight?: new (r: Range) => unknown }).Highlight;
  const highlights = (CSS as unknown as { highlights?: Map<string, unknown> }).highlights;
  if (highlightCtor && highlights) {
    const name = 'excerpt-jump';
    highlights.set(name, new highlightCtor(range));
    window.setTimeout(() => highlights.delete(name), 2600);
    return;
  }
  // 老浏览器退化为给所在段落加一层淡黄底，同样两秒多后撤掉。
  const block = (range.startContainer instanceof Element ? range.startContainer : range.startContainer.parentElement)
    ?.closest<HTMLElement>('p, li, blockquote, td');
  if (!block) return;
  block.classList.add('is-excerpt-glance');
  window.setTimeout(() => block.classList.remove('is-excerpt-glance'), 2600);
};

/**
 * 划词摘抄：在正文里选中一段文字，浮出「夹进摘抄本」。
 *
 * 用 selectionchange 而不是 mouseup，触屏长按和键盘选区（Shift+方向键）
 * 也能触发。工具栏固定在视口坐标里，正文滚动时立刻收起，不会跟着飘。
 */
const excerptBar = reactive({
  visible: false,
  x: 0,
  y: 0,
  text: '',
  headingId: '' as string | undefined,
  headingText: '' as string | undefined,
});
const excerptSaved = ref(false);
let selectionFrame = 0;
let excerptToastTimer = 0;

/**
 * 选区属于哪一小节：找选区起点"之前最近"的标题。
 *
 * 不能从起点节点向上 closest('h2')——起点几乎总在 <p> 或文本节点里，
 * 祖先链上根本没有标题，结果会把所有摘抄都记成"无小节"。
 */
const headingForRange = (range: Range) => {
  const body = bodyEl.value;
  if (!body) return { headingId: undefined, headingText: undefined };
  let current: HTMLElement | null = null;
  for (const heading of body.querySelectorAll<HTMLElement>('h2[id], h3[id], h4[id]')) {
    // 标题整体在选区起点之后 → 还没读到它，停在上一个。
    if (range.comparePoint(heading, 0) > 0) break;
    current = heading;
  }
  if (!current) return { headingId: undefined, headingText: undefined };
  return {
    headingId: current.id,
    headingText: (current.textContent || '').trim().slice(0, 48) || undefined,
  };
};

const readSelection = () => {
  const body = bodyEl.value;
  const selection = window.getSelection();
  if (!body || !selection || selection.rangeCount === 0 || selection.isCollapsed) {
    excerptBar.visible = false;
    return;
  }
  const range = selection.getRangeAt(0);
  if (!body.contains(range.commonAncestorContainer)) {
    excerptBar.visible = false;
    return;
  }
  const text = selection.toString().replace(/\s+/g, ' ').trim();
  // 太短的选多半是误触（双击一个词也会选中），不打扰读者。
  if (text.length < 6) {
    excerptBar.visible = false;
    return;
  }
  const rect = range.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    excerptBar.visible = false;
    return;
  }
  const { headingId, headingText } = headingForRange(range);
  excerptBar.text = text.slice(0, 400);
  excerptBar.headingId = headingId;
  excerptBar.headingText = headingText;
  // 工具栏宽约 15rem：贴着选区上方居中，碰到视口边缘就收回来。
  excerptBar.x = Math.min(window.innerWidth - 132, Math.max(132, rect.left + rect.width / 2));
  excerptBar.y = Math.max(72, rect.top - 12);
  excerptBar.visible = true;
};

const onSelectionChange = () => {
  if (selectionFrame) return;
  selectionFrame = window.requestAnimationFrame(() => {
    readSelection();
    selectionFrame = 0;
  });
};

const hideExcerptBar = () => {
  excerptBar.visible = false;
};

const saveExcerpt = () => {
  if (!excerptBar.text) return;
  const saved = addExcerpt({
    slug: articleData.slug || slug,
    title: articleData.articleTitle,
    text: excerptBar.text,
    headingId: excerptBar.headingId,
    headingText: excerptBar.headingText,
  });
  if (!saved) return;
  excerptBar.visible = false;
  window.getSelection()?.removeAllRanges();
  pingExcerptShelf();
  excerptSaved.value = true;
  window.clearTimeout(excerptToastTimer);
  excerptToastTimer = window.setTimeout(() => { excerptSaved.value = false; }, 2200);
};

const copySelection = async () => {
  await copyText(excerptBar.text);
  excerptBar.visible = false;
  window.getSelection()?.removeAllRanges();
};

/** 从首页或罗盘回来时，把读者送回上次停下的段落。 */
const resumeReading = () => {
  const mark = resume.value;
  if (!mark) return;
  resumeDismissed.value = true;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const target = mark.headingId ? document.getElementById(mark.headingId) : null;
  if (target) {
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    return;
  }
  const body = bodyEl.value;
  if (!body) return;
  const top = body.getBoundingClientRect().top + window.scrollY + body.offsetHeight * mark.progress - 96;
  window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
};

onMounted(() => {
  enhanceCodeBlocks();
  initReadingPrefs();
  // 从摘抄本跳回来时，等页面落位再把那句话点亮；读完即清，刷新不会重放。
  try {
    const pending = window.sessionStorage.getItem(PENDING_EXCERPT_KEY);
    if (pending) {
      window.sessionStorage.removeItem(PENDING_EXCERPT_KEY);
      window.setTimeout(() => flashExcerptTarget(pending), 700);
    }
  } catch {
    // 存储不可用时跳过高亮，跳转本身仍然有效。
  }
  document.addEventListener('selectionchange', onSelectionChange);
  window.addEventListener('scroll', hideExcerptBar, { passive: true });
  // 只在"读到一半"时提示；读完的、刚打开的文章不打扰。
  const saved = findReadingTrail(articleData.slug || slug);
  if (saved && saved.progress >= 0.05 && saved.progress <= 0.97 && !window.location.hash) {
    resume.value = { progress: saved.progress, headingId: saved.headingId, headingText: saved.headingText };
  }
  readingTrailTimer = window.setTimeout(() => {
    readingTrailReady = true;
    recordProgress(true);
  }, 4000);
  if (finaleEl.value) {
    finaleObserver = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      readingTrailReady = true;
      lastTrackedProgress = 1;
      trackAt(1, currentHeading());
      finaleObserver?.disconnect();
      finaleObserver = null;
    }, { threshold: 0.4 });
    finaleObserver.observe(finaleEl.value);
  }
  window.addEventListener('scroll', onSpyScroll, { passive: true });
  window.addEventListener('scroll', onReadingScroll, { passive: true });
  runSpy();
});

onBeforeUnmount(() => {
  document.removeEventListener('selectionchange', onSelectionChange);
  window.removeEventListener('scroll', hideExcerptBar);
  finaleObserver?.disconnect();
  finaleObserver = null;
  window.removeEventListener('scroll', onSpyScroll);
  window.removeEventListener('scroll', onReadingScroll);
  window.clearTimeout(readingTrailTimer);
  window.clearTimeout(excerptToastTimer);
  if (selectionFrame) window.cancelAnimationFrame(selectionFrame);
  if (spyFrame) window.cancelAnimationFrame(spyFrame);
});
</script>

<template>
  <article class="reading">
    <!-- The progress bar is rendered once by the layout, so every page has it. -->

    <!-- 划词工具栏：固定定位，跟着选区走。用 button 而不是 div，
         键盘用户也能 Tab 到它；点完立刻收起。 -->
    <div
      v-if="excerptBar.visible"
      class="reading__excerpt-bar"
      :style="{ left: `${excerptBar.x}px`, top: `${excerptBar.y}px` }"
      role="toolbar"
      aria-label="摘抄工具栏"
    >
      <button type="button" class="is-primary" @click="saveExcerpt">夹进摘抄本 ✦</button>
      <button type="button" @click="copySelection">复制</button>
    </div>

    <p v-if="excerptSaved" class="reading__excerpt-toast" role="status">
      ✦ 夹好啦，想再看时掀开左下角的小本子
    </p>

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

    <!-- 回访提示：只在读到一半时出现，读完或刚打开都不打扰。 -->
    <div v-if="resume && !resumeDismissed" class="reading__resume">
      <span class="reading__resume-star" aria-hidden="true">✦</span>
      <div class="reading__resume-copy">
        <strong>欢迎回来，上次停在这里</strong>
        <p v-if="resume.headingText">读到「{{ resume.headingText }}」 · {{ Math.round(resume.progress * 100) }}%</p>
        <p v-else>读到 {{ Math.round(resume.progress * 100) }}% 的地方</p>
      </div>
      <div class="reading__resume-actions">
        <button type="button" class="is-primary" @click="resumeReading">接着读 ✦</button>
        <button type="button" class="is-ghost" @click="resumeDismissed = true">从头看</button>
      </div>
    </div>

    <img
      v-if="articleData.articleCover"
      class="reading__cover"
      :src="articleData.articleCover"
      :alt="articleData.articleTitle"
      loading="lazy"
      decoding="async"
    />

    <div
      ref="bodyEl"
      class="reading__body"
      :style="{ '--bs-read-size': readingSize === 'sm' ? '.94rem' : readingSize === 'lg' ? '1.12rem' : '1rem', '--bs-read-leading': readingLeading === 'snug' ? '1.7' : readingLeading === 'loose' ? '2.15' : '1.9' }"
      v-html="articleData.contentHtml"
    ></div>

    <ul v-if="articleData.tags?.length" class="reading__tags" aria-label="文章标签">
      <li v-for="tag in articleTags" :key="tag.name">
        <NuxtLink v-if="tag.slug" :to="`/tags/${encodeURIComponent(tag.slug)}`">#{{ tag.name }}</NuxtLink>
        <span v-else>#{{ tag.name }}</span>
      </li>
    </ul>

    <!-- 上一篇 / 下一篇：按发布时间给出确定性的内部链接，比随机推荐更好翻。 -->
    <nav v-if="articleNeighbours" class="reading__step" aria-label="相邻文章">
      <NuxtLink v-if="articleNeighbours.previous" :to="`/article/${articleNeighbours.previous.slug}`" class="reading__step-link">
        <small>上一篇</small>
        <strong>{{ articleNeighbours.previous.articleTitle }}</strong>
      </NuxtLink>
      <span v-else class="reading__step-link is-empty" aria-hidden="true"></span>
      <NuxtLink v-if="articleNeighbours.next" :to="`/article/${articleNeighbours.next.slug}`" class="reading__step-link is-next">
        <small>下一篇</small>
        <strong>{{ articleNeighbours.next.articleTitle }}</strong>
      </NuxtLink>
    </nav>

    <section ref="finaleEl" class="reading__finale" aria-label="读完啦">
      <p class="reading__finale-mark">✧･ﾟ</p>
      <strong>读到这里啦</strong>
      <p class="reading__finale-text">谢谢你把这篇小故事读完。愿它给你的今天，加一点柔软的光。</p>
      <div class="reading__finale-actions">
        <button type="button" @click="backToTop">回到顶部 ☝</button>
        <NuxtLink to="/desk" class="reading__finale-ghost">回书桌看看 ✦</NuxtLink>
        <NuxtLink to="/archive" class="reading__finale-ghost">再读一篇</NuxtLink>
      </div>
    </section>

    <!-- 阅读排版条：长文时把正文调成自己舒服的样子，偏好下次自动记住。 -->
    <section class="reading__comfort" aria-label="阅读排版">
      <div class="reading__comfort-copy">
        <span aria-hidden="true">✎</span>
        <div>
          <strong>把这一段读舒服一点</strong>
          <p>字号和行距会记住，下次打开还是你习惯的样子。</p>
        </div>
      </div>
      <div class="reading__comfort-controls">
        <div class="reading__comfort-group" role="radiogroup" aria-label="正文字号">
          <span class="reading__comfort-label">字号</span>
          <button type="button" role="radio" :aria-checked="readingSize === 'sm'" :class="{ 'is-active': readingSize === 'sm' }" @click="setFontSize('sm')">小</button>
          <button type="button" role="radio" :aria-checked="readingSize === 'md'" :class="{ 'is-active': readingSize === 'md' }" @click="setFontSize('md')">中</button>
          <button type="button" role="radio" :aria-checked="readingSize === 'lg'" :class="{ 'is-active': readingSize === 'lg' }" @click="setFontSize('lg')">大</button>
        </div>
        <div class="reading__comfort-group" role="radiogroup" aria-label="正文行距">
          <span class="reading__comfort-label">行距</span>
          <button type="button" role="radio" :aria-checked="readingLeading === 'snug'" :class="{ 'is-active': readingLeading === 'snug' }" @click="setLeading('snug')">紧</button>
          <button type="button" role="radio" :aria-checked="readingLeading === 'cozy'" :class="{ 'is-active': readingLeading === 'cozy' }" @click="setLeading('cozy')">适中</button>
          <button type="button" role="radio" :aria-checked="readingLeading === 'loose'" :class="{ 'is-active': readingLeading === 'loose' }" @click="setLeading('loose')">松</button>
        </div>
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
.reading h1 { margin: 1.5rem 0 1rem; color: var(--bs-ink); font-size: clamp(1.75rem, 4.6vw, 2.9rem); line-height: 1.22; }
.reading__meta { display: flex; flex-wrap: wrap; gap: .55rem; }
.reading__meta span { padding: .35rem .7rem; border-radius: 999px; background: rgba(185,167,255,.16); color: var(--bs-ink-body); font-size: .82rem; }
.reading__star { align-self: center; margin-left: .1rem; }

/* 划词工具栏：像一张从书页里抽出来的小票，阴影把动作和选区连在一起。 */
.reading__excerpt-bar {
  position: fixed;
  z-index: 112;
  display: flex;
  gap: .25rem;
  padding: .3rem;
  border: 1px solid var(--bs-hairline);
  border-radius: 999px;
  background: var(--bs-paper-strong);
  box-shadow: 0 12px 32px rgba(57, 45, 79, .22);
  backdrop-filter: blur(16px) saturate(1.1);
  transform: translate(-50%, -100%);
  animation: excerpt-bar-in var(--bs-dur-base) var(--bs-ease-pop);
}
.reading__excerpt-bar button {
  min-height: 2.35rem;
  padding: .38rem .72rem;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: var(--bs-ink-soft);
  font-family: inherit;
  font-size: .78rem;
  cursor: pointer;
  transition: var(--bs-dur-quick) ease;
}
.reading__excerpt-bar button:hover { background: var(--bs-surface-soft); color: var(--bs-ink); }
.reading__excerpt-bar button.is-primary {
  border-color: var(--bs-ink-line);
  background: linear-gradient(135deg, var(--bs-yellow), var(--bs-pink));
  color: var(--bs-ink-on-accent);
  font-weight: 700;
  box-shadow: 2px 2px 0 var(--bs-ink-line);
}
.reading__excerpt-bar button.is-primary:hover { transform: translate(-1px, -1px); box-shadow: 3px 3px 0 var(--bs-ink-line); }
.reading__excerpt-bar button:focus-visible { outline: 3px solid rgba(185, 167, 255, .7); outline-offset: 2px; }

/* 夹好后的确认条从视口底部浮出，不打断阅读正文。 */
.reading__excerpt-toast {
  position: fixed;
  left: 50%;
  bottom: calc(var(--bs-dock-edge) + 4.8rem);
  z-index: 111;
  margin: 0;
  padding: .65rem 1rem;
  border: 1.5px dashed rgba(158, 230, 208, .8);
  border-radius: 999px;
  background: var(--bs-paper-strong);
  color: var(--bs-ink);
  font-size: .82rem;
  box-shadow: var(--bs-shadow);
  backdrop-filter: blur(16px);
  transform: translateX(-50%);
  animation: excerpt-toast-in var(--bs-dur-mid) var(--bs-ease-pop);
}
@keyframes excerpt-bar-in { from { opacity: 0; transform: translate(-50%, -85%) scale(.92); } to { opacity: 1; transform: translate(-50%, -100%) scale(1); } }
@keyframes excerpt-toast-in { from { opacity: 0; transform: translate(-50%, .6rem); } to { opacity: 1; transform: translate(-50%, 0); } }

@media (max-width: 640px) {
  .reading__excerpt-bar { transform: translate(-50%, -112%); }
  .reading__excerpt-toast { width: max-content; max-width: calc(100vw - 2rem); border-radius: 1rem; text-align: center; }
}

/* 回访提示做成一枚贴纸：虚线边框 + 轻微倾斜，和站内其它便利贴语气一致。 */
.reading__resume { display: flex; flex-wrap: wrap; align-items: center; gap: .75rem 1rem; margin-top: 1.3rem; padding: .85rem 1rem; border: 1.5px dashed rgba(255, 143, 179, .55); border-radius: 1.15rem; background: linear-gradient(135deg, rgba(255, 228, 138, .24), rgba(185, 167, 255, .14)); transform: rotate(-.35deg); }
.reading__resume-star { display: grid; place-items: center; width: 2.1rem; height: 2.1rem; flex: 0 0 auto; border: 1.5px solid var(--bs-ink-line); border-radius: 50%; background: linear-gradient(135deg, var(--bs-yellow), var(--bs-pink)); color: var(--bs-ink-on-accent); box-shadow: var(--bs-sticker-shadow); font-size: .95rem; }
.reading__resume-copy { min-width: 0; flex: 1; }
.reading__resume-copy strong { color: var(--bs-ink); font-size: .92rem; }
.reading__resume-copy p { margin: .15rem 0 0; color: var(--bs-ink-soft); font-size: .8rem; line-height: 1.6; }
.reading__resume-actions { display: flex; gap: .45rem; }
.reading__resume-actions button { padding: .45rem .85rem; border: 1.5px solid var(--bs-ink-line); border-radius: 999px; font-family: inherit; font-size: .8rem; font-weight: 600; color: var(--bs-ink); cursor: pointer; transition: transform var(--bs-dur-quick) var(--bs-ease-pop), box-shadow var(--bs-dur-quick) ease; }
.reading__resume-actions .is-primary { background: linear-gradient(135deg, var(--bs-yellow), var(--bs-pink)); box-shadow: 2px 2px 0 var(--bs-ink-line); }
.reading__resume-actions .is-ghost { background: var(--bs-surface-strong); }
.reading__resume-actions button:hover { transform: translate(-1px, -2px) rotate(-1deg); box-shadow: 4px 5px 0 var(--bs-ink-line); }
.reading__resume-actions button:focus-visible { outline: 3px solid rgba(185, 167, 255, .72); outline-offset: 3px; }

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

/* 阅读排版条：轻量、不抢正文，只在文章末尾出现。 */
.reading__comfort { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .8rem 1.2rem; margin-top: 1.6rem; padding: .9rem 1.05rem; border: 1px solid var(--bs-hairline); border-radius: 1.1rem; background: var(--bs-surface-soft); }
.reading__comfort-copy { display: flex; align-items: center; gap: .65rem; min-width: 0; }
.reading__comfort-copy > span { display: grid; place-items: center; width: 1.9rem; height: 1.9rem; flex: 0 0 auto; border-radius: .6rem; background: var(--bs-tint-lilac); color: var(--bs-accent-ink); }
.reading__comfort-copy strong { display: block; color: var(--bs-ink); font-size: .86rem; }
.reading__comfort-copy p { margin: .1rem 0 0; color: var(--bs-ink-soft); font-size: .74rem; line-height: 1.55; }
.reading__comfort-controls { display: flex; flex-wrap: wrap; gap: .5rem 1rem; }
.reading__comfort-group { display: inline-flex; align-items: center; gap: .2rem; padding: .18rem; border-radius: 999px; background: var(--bs-surface); }
.reading__comfort-label { padding: 0 .35rem 0 .45rem; color: var(--bs-ink-muted); font-size: .7rem; }
.reading__comfort-group button { min-width: 2rem; padding: .3rem .55rem; border: 0; border-radius: 999px; background: transparent; color: var(--bs-ink-soft); font-family: inherit; font-size: .76rem; cursor: pointer; transition: background var(--bs-dur-quick) ease, color var(--bs-dur-quick) ease, transform var(--bs-dur-quick) var(--bs-ease-pop); }
.reading__comfort-group button:hover { color: var(--bs-ink); }
.reading__comfort-group button.is-active { background: linear-gradient(135deg, var(--bs-yellow), var(--bs-pink)); color: var(--bs-ink-on-accent); font-weight: 600; box-shadow: 0 6px 14px rgba(255, 143, 179, .22); transform: translateY(-1px); }
.reading__comfort-group button:focus-visible { outline: 3px solid rgba(185, 167, 255, .7); outline-offset: 2px; }

/* 字号 / 行距偏好挂在 html 上，这里只读不写，切换不会触发 Markdown 重渲染。 */
.reading__body { font-size: var(--bs-read-size, 1rem); transition: font-size var(--bs-dur-base) ease; }
.reading__body :deep(p), .reading__body :deep(li) { line-height: var(--bs-read-leading, 1.9); }

@media (prefers-reduced-motion: reduce) {
  .reading__comfort-group button { transition: none; }
}
html.bs-reduced-motion .reading__comfort-group button { transition: none; }
html.bs-reduced-motion .reading__excerpt-bar,
html.bs-reduced-motion .reading__excerpt-toast { animation: none; }

@media (prefers-reduced-motion: reduce) {
  .reading__excerpt-bar,
  .reading__excerpt-toast { animation: none; }
}

/* 从摘抄本跳回来时的一句话高亮：淡黄荧光笔，2.6 秒后退场。
   用 Custom Highlight 直接染文字，所以颜色要走 ::highlight() 伪元素。 */
::highlight(excerpt-jump) {
  background-color: rgba(255, 228, 138, .85);
  color: inherit;
  text-decoration: underline;
  text-decoration-color: rgba(255, 143, 179, .9);
  text-decoration-thickness: 2px;
  text-underline-offset: .18em;
}
/* 老浏览器的退化方案：整段轻轻亮一下，读者至少知道停在哪。 */
.reading__body :deep(.is-excerpt-glance) {
  border-radius: .5rem;
  box-shadow: 0 0 0 .35rem rgba(255, 228, 138, .45);
  background: rgba(255, 228, 138, .22);
  transition: background .4s ease, box-shadow .4s ease;
}

/* 上一篇 / 下一篇：两页并排，像翻开下一页的手账。 */
.reading__step { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .7rem; margin-top: 1.6rem; }
.reading__step-link { display: grid; gap: .18rem; padding: .8rem .95rem; border: 1px solid var(--bs-border); border-radius: 1rem; background: var(--bs-surface); color: var(--bs-ink-body); text-decoration: none; transition: transform var(--bs-dur-base) var(--bs-ease-pop), border-color var(--bs-dur-base) ease, box-shadow var(--bs-dur-base) ease; }
.reading__step-link small { color: var(--bs-accent-ink); font-size: .68rem; letter-spacing: .12em; }
.reading__step-link strong { overflow: hidden; color: var(--bs-ink); font-size: .88rem; line-height: 1.5; text-overflow: ellipsis; white-space: nowrap; }
.reading__step-link:hover { border-color: var(--bs-border-accent); transform: translateY(-3px) rotate(-.3deg); box-shadow: 0 14px 30px rgba(255, 143, 179, .18); }
.reading__step-link.is-next { text-align: right; }
.reading__step-link.is-empty { border-style: dashed; background: transparent; box-shadow: none; }
.reading__step-link:focus-visible { outline: 3px solid rgba(185, 167, 255, .7); outline-offset: 3px; }
@media (max-width: 560px) { .reading__step { grid-template-columns: 1fr; } .reading__step-link.is-empty { display: none; } }

@media (max-width: 640px) { .reading__next-grid { grid-template-columns: 1fr; } }
</style>
