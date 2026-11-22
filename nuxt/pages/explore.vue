<script setup lang="ts">
import { siteConfig } from '../../src/config/site';
import type { PublicArticle, PublicCategory, PublicTag } from '../types/public';

const [{ data: articles }, { data: categories }, { data: tags }] = await Promise.all([
  useAsyncData<PublicArticle[]>('explore-articles', () => $fetch('/api/articles')),
  useAsyncData<PublicCategory[]>('explore-categories', () => $fetch('/api/categories')),
  useAsyncData<PublicTag[]>('explore-tags', () => $fetch('/api/tags')),
]);

// Must run after the async data above: the SEO getter reads `articles`, and
// registering it earlier would evaluate the computed while the binding is
// still in its temporal dead zone. That aborted `useHead` before it created a
// dispose handle, which later surfaced as "reading 'dispose'" on navigation.
useCollectionSeo({
  path: '/explore',
  title: `灵感星图 | ${siteConfig.name}`,
  description: '沿着心情、时间和主题漫游生活倒影：抽取一封今日小笺，或从星图里找到下一篇想读的故事。',
  items: () => articles.value || [],
});

/**
 * 星图不是按分类重复一遍卡片：每颗星记录真实文章，坐标只由稳定 slug
 * 推导。这样换设备、刷新和 SSR 首屏都是同一张图，不会随机跳动。
 */
interface ConstellationPoint {
  article: PublicArticle;
  x: number;
  y: number;
  size: number;
  tone: number;
  delay: number;
}

const hashOf = (value: string) => {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const points = computed<ConstellationPoint[]>(() => {
  const list = articles.value || [];
  if (!list.length) return [];
  if (list.length === 1) {
    return [{ article: list[0]!, x: 50, y: 48, size: 1.65, tone: 3, delay: 0 }];
  }

  // 少量文章时用近似均分的环形/花瓣排布；文章多了再自然转成黄金角花盘。
  // 纯哈希会允许两颗星落在同一块区域，在首屏直接叠成一颗，破坏可点性。
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  // Three posts are the common case for this blog right now. Give them the
  // composer's triangle instead of a narrow arc, and use the deliberate
  // asymmetry of the postcard column as breathing room on the right.
  if (list.length === 3) {
    const anchors = [{ x: 23, y: 31 }, { x: 69, y: 21 }, { x: 53, y: 72 }];
    return list.map((article, index) => {
      const seed = hashOf(article.slug);
      const anchor = anchors[index]!;
      return {
        article,
        x: anchor.x + ((seed % 7) - 3) * 0.7,
        y: anchor.y + (((seed >>> 8) % 7) - 3) * 0.7,
        size: 1 + ((seed >>> 16) % 100) / 130,
        tone: (seed >>> 3) % 5,
        delay: (index % 7) * -0.5,
      };
    });
  }

  return list.map((article, index) => {
    const seed = hashOf(article.slug);
    const jitter = (seed % 100) / 100 - 0.5;
    const ratio = Math.sqrt((index + 0.7) / list.length);
    const angle = index * goldenAngle + (seed % 360) * (Math.PI / 180) * 0.08;
    // 横向 34%、纵向 32% 的半径让标签完全落在画布内。
    return {
      article,
      x: 50 + Math.cos(angle) * ratio * 34 + jitter * 3,
      y: 49 + Math.sin(angle) * ratio * 32 + jitter * 2,
      size: 1 + ((seed >>> 16) % 100) / 130,
      tone: (seed >>> 3) % 5,
      delay: (index % 7) * -0.5,
    };
  });
});

/**
 * Constellation lines connect neighbouring points. Coordinates are ordered by
 * x, then each point links to the following one within a sensible vertical
 * distance. The result looks hand-plotted rather than a rigid grid.
 */
const lines = computed(() => {
  const list = points.value;
  const segments: Array<{ key: string; x1: number; y1: number; x2: number; y2: number }> = [];
  if (list.length < 2) return segments;

  // 连线跟着真实邻接关系走，不依赖 x 排序；纵向按画布长宽比放大，
  // 避免视觉上很近的两点在数据里被判成“远”。
  const neighbours = new Set<string>();
  for (let index = 0; index < list.length; index += 1) {
    const current = list[index]!;
    const distances = list
      .map((candidate, candidateIndex) => ({
        candidate,
        candidateIndex,
        distance: Math.hypot(candidate.x - current.x, (candidate.y - current.y) * 1.5),
      }))
      .filter((entry) => entry.candidateIndex !== index)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 2);
    for (const entry of distances) {
      const a = Math.min(index, entry.candidateIndex);
      const b = Math.max(index, entry.candidateIndex);
      const key = `${a}-${b}`;
      if (neighbours.has(key)) continue;
      neighbours.add(key);
      const first = list[a]!;
      const second = list[b]!;
      segments.push({ key, x1: first.x, y1: first.y, x2: second.x, y2: second.y });
    }
  }
  return segments;
});

const TONES = [
  { dot: 'var(--bs-pink)', glow: 'rgba(255, 143, 179, .55)' },
  { dot: 'var(--bs-lilac)', glow: 'rgba(185, 167, 255, .55)' },
  { dot: 'var(--bs-mint)', glow: 'rgba(158, 230, 208, .5)' },
  { dot: 'var(--bs-yellow)', glow: 'rgba(255, 228, 138, .55)' },
  { dot: 'var(--bs-peach)', glow: 'rgba(255, 189, 138, .55)' },
];

/* ------------------------------- 漫游控制 ------------------------------- */

type Mood = 'all' | 'quiet' | 'curious' | 'brave';

const MOODS: Array<{ value: Mood; label: string; emoji: string; hint: string }> = [
  { value: 'all', label: '随缘看看', emoji: '🌙', hint: '不设目的地，让星星带路' },
  { value: 'quiet', label: '想安静一点', emoji: '🍵', hint: '偏生活、随笔与慢一点的故事' },
  { value: 'curious', label: '想学点东西', emoji: '🧁', hint: '偏前端、工程与实践笔记' },
  { value: 'brave', label: '想被点亮', emoji: '✨', hint: '偏创意、动画和实验' },
];

const mood = ref<Mood>('all');
const activeCategory = ref('');
const selectedSlug = ref('');
const pickedSlug = ref('');
const drawnCard = ref<PublicArticle | null>(null);
const drawState = ref<'idle' | 'drawing'>('idle');
let drawTimer: ReturnType<typeof setTimeout> | null = null;

const allArticles = computed(() => articles.value || []);

/** 用真实文章字段做柔和的兴趣分流，不编造标签，也不把空分类说成有内容。 */
const moodMatches = (article: PublicArticle, value: Mood) => {
  if (value === 'all') return true;
  const haystack = [article.articleTitle, article.category, ...(article.tags || [])].filter(Boolean).join(' ').toLowerCase();
  if (value === 'quiet') return /生活|随笔|记录|心情|慢|日常|生活倒影/.test(haystack);
  if (value === 'curious') return /前端|vue|nuxt|typescript|javascript|工程|开发|技术|css|架构/.test(haystack);
  return /创意|动画|css|实验|设计|灵感|故事/.test(haystack);
};

const filtered = computed(() => allArticles.value.filter((article) => {
  const categoryOk = !activeCategory.value || article.category === activeCategory.value;
  return categoryOk && moodMatches(article, mood.value);
}));

const selected = computed(() => allArticles.value.find((article) => article.slug === selectedSlug.value) || null);
const picked = computed(() => allArticles.value.find((article) => article.slug === pickedSlug.value) || null);

const selectPoint = (slug: string) => {
  selectedSlug.value = selectedSlug.value === slug ? '' : slug;
};

const randomDraw = () => {
  if (!filtered.value.length || drawState.value === 'drawing') return;
  drawState.value = 'drawing';
  if (drawTimer) clearTimeout(drawTimer);
  // 抽签的停顿是节拍，不是加载：200ms 后从当前筛选里公平抽一篇。
  drawTimer = setTimeout(() => {
    const pool = filtered.value;
    const index = Math.floor(Math.random() * pool.length);
    drawnCard.value = pool[index] || null;
    pickedSlug.value = drawnCard.value?.slug || '';
    drawState.value = 'idle';
  }, 260);
};

const clearFilters = () => {
  mood.value = 'all';
  activeCategory.value = '';
  selectedYear.value = '';
};

const years = computed(() => {
  const set = new Set<string>();
  for (const article of allArticles.value) {
    const year = (article.createTime || '').slice(0, 4);
    if (year) set.add(year);
  }
  return [...set].sort((a, b) => Number(b) - Number(a));
});
const selectedYear = ref('');
const yearFiltered = computed(() => filtered.value.filter((article) => !selectedYear.value || article.createTime.startsWith(selectedYear.value)));

watch([mood, activeCategory, selectedYear], () => {
  selectedSlug.value = '';
  drawnCard.value = null;
  pickedSlug.value = '';
});

onBeforeUnmount(() => {
  if (drawTimer) clearTimeout(drawTimer);
});

/* --------------------------- 深链接 / 键盘可达 --------------------------- */

const route = useRoute();
onMounted(() => {
  const querySlug = String(route.query.star || '');
  if (querySlug && allArticles.value.some((article) => article.slug === querySlug)) {
    selectedSlug.value = querySlug;
  }
});

const selectedTags = computed(() => {
  if (!selected.value?.tags?.length) return [];
  return selected.value.tags.map((name) => ({
    name,
    slug: (tags.value || []).find((tag) => tag.tagName === name)?.slug || '',
  }));
});
</script>

<template>
  <section class="explore">
    <header class="explore__head">
      <span class="explore__orbit" aria-hidden="true">
        <i></i><i></i><i></i>
      </span>
      <p class="explore__eyebrow"><span aria-hidden="true">✦</span> STAR MAP</p>
      <h1>今晚，去一颗<br /><em>没读过的星星</em>那里。</h1>
      <div class="explore__quick">
        <button type="button" class="explore__draw" :disabled="!yearFiltered.length" @click="randomDraw">
          <span aria-hidden="true">{{ drawState === 'drawing' ? '✦' : '🎐' }}</span>
          {{ drawState === 'drawing' ? '正在摇一摇…' : '替我抽一篇' }}
        </button>
        <span class="explore__count" aria-live="polite">
          星图上有 {{ allArticles.length }} 颗故事 · 当前可见 {{ yearFiltered.length }} 颗
        </span>
      </div>
    </header>

    <div class="explore__layout">
      <section class="explore__map-panel" aria-labelledby="star-map-title">
        <div class="explore__map-head">
          <div>
            <p class="explore__kicker">CONSTELLATION 01</p>
            <h2 id="star-map-title">灵感星图</h2>
          </div>
          <span class="explore__legend"><i aria-hidden="true"></i> 每颗星都是一篇文章</span>
        </div>

        <div class="explore__canvas-wrap">
          <svg class="explore__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <line
              v-for="line in lines"
              :key="line.key"
              :x1="line.x1"
              :y1="line.y1"
              :x2="line.x2"
              :y2="line.y2"
            />
          </svg>
          <button
            v-for="point in points"
            :key="point.article.slug"
            type="button"
            class="explore__star"
            :class="{
              'is-selected': selectedSlug === point.article.slug,
              'is-dimmed': !yearFiltered.some((article) => article.slug === point.article.slug),
            }"
            :style="{
              left: `${point.x}%`,
              top: `${point.y}%`,
              '--star-size': `${point.size}rem`,
              '--star-dot': TONES[point.tone]!.dot,
              '--star-glow': TONES[point.tone]!.glow,
              '--star-delay': `${point.delay}s`,
            }"
            :aria-label="`查看《${point.article.articleTitle}》`"
            :aria-pressed="selectedSlug === point.article.slug"
            @click="selectPoint(point.article.slug)"
          >
            <span class="explore__star-core" aria-hidden="true">✦</span>
            <span class="explore__star-label">{{ point.article.articleTitle }}</span>
          </button>
          <p v-if="!points.length" class="explore__empty">星图还在等第一颗故事亮起来。</p>
        </div>
      </section>

      <aside class="explore__postcard" :class="{ 'has-story': selected }" aria-live="polite">
        <template v-if="selected">
          <span class="explore__postcard-stamp" :style="articleArt(selected).style" aria-hidden="true">
            {{ articleArt(selected).emoji }}
          </span>
          <p class="explore__kicker">PICKED STAR</p>
          <p class="explore__postcard-cat">{{ selected.category || '随笔' }} · {{ formatDate(selected.createTime) }}</p>
          <h2>{{ selected.articleTitle }}</h2>
          <p class="explore__postcard-blurb">{{ selected.summary || excerptOf(selected.articleContent, 110) }}</p>
          <div class="explore__postcard-tags">
            <NuxtLink v-for="tag in selectedTags" :key="tag.name" :to="tag.slug ? `/tags/${tag.slug}` : '/tags'">#{{ tag.name }}</NuxtLink>
          </div>
          <div class="explore__postcard-actions">
            <NuxtLink :to="`/article/${selected.slug}`" class="explore__read">去读这一篇 <span aria-hidden="true">→</span></NuxtLink>
            <button type="button" class="explore__shuffle" @click="selectPoint(selected.slug)">放回去</button>
          </div>
        </template>
        <template v-else>
          <span class="explore__postcard-moon" aria-hidden="true">☾</span>
          <p class="explore__kicker">A LITTLE NOTE</p>
          <h2>点一颗星，<br />看看它藏着什么。</h2>
          <p class="explore__postcard-blurb">每一颗都连着一篇真实写下的文章。也可以让上面的小风铃替你挑一封今日小笺。</p>
          <span class="explore__postcard-sign">—— 生活倒影 · 星间邮局</span>
        </template>
      </aside>
    </div>

    <Transition name="explore-letter">
      <section v-if="picked && drawnCard" class="explore__letter" aria-labelledby="letter-title">
        <div class="explore__letter-seal" aria-hidden="true">✦</div>
        <p class="explore__kicker">TODAY'S LETTER · 今日小笺</p>
        <h2 id="letter-title">{{ picked.articleTitle }}</h2>
        <p class="explore__letter-meta">{{ picked.category || '随笔' }} · {{ formatDate(picked.createTime) }} · 约 {{ readingMinutes(picked.articleContent) }} 分钟</p>
        <p class="explore__letter-text">{{ picked.summary || excerptOf(picked.articleContent, 180) }}</p>
        <div class="explore__letter-actions">
          <NuxtLink :to="`/article/${picked.slug}`" class="explore__read">拆开这封信 <span aria-hidden="true">→</span></NuxtLink>
          <button type="button" class="explore__shuffle" @click="randomDraw">再抽一封 🎐</button>
        </div>
      </section>
    </Transition>

    <section class="explore__filters" aria-labelledby="explore-filters-title">
      <div class="explore__filters-head">
        <div>
          <p class="explore__kicker">TUNE THE TELESCOPE</p>
          <h2 id="explore-filters-title">把望远镜转向你想看的方向</h2>
        </div>
        <button v-if="mood !== 'all' || activeCategory || selectedYear" type="button" class="explore__reset" @click="clearFilters">
          重置筛选 ↺
        </button>
      </div>

      <div class="explore__moods" role="group" aria-label="按心情挑选">
        <button
          v-for="option in MOODS"
          :key="option.value"
          type="button"
          class="explore__mood"
          :class="{ 'is-active': mood === option.value }"
          :aria-pressed="mood === option.value"
          @click="mood = option.value"
        >
          <span aria-hidden="true">{{ option.emoji }}</span>
          <strong>{{ option.label }}</strong>
          <small>{{ option.hint }}</small>
        </button>
      </div>

      <div class="explore__chips" role="group" aria-label="按分类和年份筛选">
        <button type="button" class="explore__chip" :class="{ 'is-active': !activeCategory }" @click="activeCategory = ''">全部分类</button>
        <button
          v-for="category in categories || []"
          :key="category.id"
          type="button"
          class="explore__chip"
          :class="{ 'is-active': activeCategory === category.categoryName }"
          @click="activeCategory = activeCategory === category.categoryName ? '' : category.categoryName"
        >
          {{ category.categoryName }} <small>{{ category.articleCount || 0 }}</small>
        </button>
      </div>
      <div v-if="years.length" class="explore__chips explore__chips--years" role="group" aria-label="按年份筛选">
        <button type="button" class="explore__chip explore__chip--year" :class="{ 'is-active': !selectedYear }" @click="selectedYear = ''">所有年份</button>
        <button
          v-for="year in years"
          :key="year"
          type="button"
          class="explore__chip explore__chip--year"
          :class="{ 'is-active': selectedYear === year }"
          @click="selectedYear = selectedYear === year ? '' : year"
        >
          {{ year }}
        </button>
      </div>

      <div class="explore__results" aria-live="polite">
        <p v-if="yearFiltered.length" class="explore__results-note">
          顺着这些线索，找到 {{ yearFiltered.length }} 篇故事。
        </p>
        <div v-if="yearFiltered.length" class="explore__result-list">
          <NuxtLink
            v-for="article in yearFiltered"
            :key="article.id"
            :to="`/article/${article.slug}`"
            class="explore__result"
            :style="articleArt(article).style"
          >
            <span class="explore__result-emoji" aria-hidden="true">{{ articleArt(article).emoji }}</span>
            <span class="explore__result-body">
              <strong>{{ article.articleTitle }}</strong>
              <small>{{ article.category || '随笔' }} · {{ formatDate(article.createTime) }}</small>
            </span>
            <span class="explore__result-arrow" aria-hidden="true">↗</span>
          </NuxtLink>
        </div>
        <p v-else class="explore__empty">这一片天区暂时没有星星，换个心情或年份再看看。</p>
      </div>
    </section>
  </section>
</template>

<style scoped>
.explore { position: relative; max-width: 1080px; margin: 0 auto; padding: 2rem 0 6rem; }
.explore__head { position: relative; overflow: hidden; padding: clamp(1.4rem, 4vw, 2.8rem); border: 1px solid var(--bs-border); border-radius: 2rem; background: var(--bs-paper-strong); box-shadow: var(--bs-shadow); }
.explore__orbit { position: absolute; top: -5rem; right: -3rem; width: 17rem; height: 17rem; border: 1px dashed rgba(185, 167, 255, .5); border-radius: 50%; animation: explore-orbit 34s linear infinite; }
.explore__orbit::before { position: absolute; inset: 1.6rem; border: 1px solid rgba(255, 143, 179, .25); border-radius: 50%; content: ""; }
.explore__orbit i { position: absolute; width: .42rem; height: .42rem; border-radius: 50%; background: var(--bs-yellow); box-shadow: 0 0 14px var(--bs-yellow); }
.explore__orbit i:nth-child(1) { top: 5%; left: 47%; }
.explore__orbit i:nth-child(2) { right: 2%; top: 48%; background: var(--bs-mint); }
.explore__orbit i:nth-child(3) { bottom: 10%; left: 13%; background: var(--bs-pink); }
.explore__eyebrow { margin: 0; color: var(--bs-accent-ink); font-size: .74rem; letter-spacing: .2em; }
.explore__eyebrow span { color: var(--bs-peach); }
.explore h1 { margin: .8rem 0 0; color: var(--bs-ink); font-size: clamp(2.2rem, 6.4vw, 4.6rem); line-height: 1.1; letter-spacing: -.01em; }
.explore h1 em { color: var(--bs-accent-strong); font-style: normal; text-decoration: underline; text-decoration-color: rgba(255, 143, 179, .45); text-decoration-thickness: .14em; text-underline-offset: .12em; }
.explore__intro { max-width: 39rem; margin: 1rem 0 0; color: var(--bs-ink-soft); font-size: 1.02rem; line-height: 1.85; }
.explore__quick { display: flex; flex-wrap: wrap; align-items: center; gap: .8rem 1.1rem; margin-top: 1.4rem; }
.explore__draw { display: inline-flex; align-items: center; gap: .45rem; min-height: 2.9rem; padding: .6rem 1.2rem; border: 2px solid var(--bs-ink-line); border-radius: 999px; background: linear-gradient(135deg, var(--bs-yellow), var(--bs-pink)); color: var(--bs-ink-on-accent); font-family: inherit; font-weight: 700; cursor: pointer; box-shadow: var(--bs-sticker-shadow); transition: transform var(--bs-dur-quick) var(--bs-ease-pop), box-shadow var(--bs-dur-quick) ease; }
.explore__draw:hover:not(:disabled) { transform: translate(-2px, -3px) rotate(-1deg); box-shadow: 5px 6px 0 var(--bs-ink-line); }
.explore__draw:disabled { cursor: not-allowed; opacity: .55; }
.explore__draw span { font-size: 1.1rem; }
.explore__count { color: var(--bs-ink-muted); font-size: .82rem; }

.explore__layout { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(17rem, .8fr); gap: 1rem; margin-top: 1rem; }
.explore__map-panel, .explore__postcard, .explore__filters { border: 1px solid var(--bs-border); border-radius: 1.6rem; background: var(--bs-surface); box-shadow: var(--bs-shadow-soft); }
.explore__map-panel { min-width: 0; padding: 1.1rem; }
.explore__map-head, .explore__filters-head { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: .7rem; }
.explore__kicker { margin: 0; color: var(--bs-ink-muted); font-size: .68rem; letter-spacing: .16em; }
.explore__map-head h2, .explore__filters h2 { margin: .25rem 0 0; color: var(--bs-ink); font-size: 1.22rem; }
.explore__legend { display: inline-flex; align-items: center; gap: .4rem; color: var(--bs-ink-muted); font-size: .76rem; }
.explore__legend i { width: .55rem; height: .55rem; border-radius: 50%; background: var(--bs-yellow); box-shadow: 0 0 10px var(--bs-yellow); }

/* The star canvas is decorative in positioning, but every star is a real
   button with a text label, so keyboard and screen-reader users get the same
   content without needing to interpret the drawing. */
.explore__canvas-wrap { position: relative; height: clamp(21rem, 44vw, 30rem); margin-top: .75rem; overflow: hidden; border-radius: 1.15rem; background: radial-gradient(circle at 30% 20%, rgba(185, 167, 255, .16), transparent 42%), radial-gradient(circle at 80% 75%, rgba(255, 143, 179, .13), transparent 40%), #1e1834; }
.explore__canvas-wrap::before, .explore__canvas-wrap::after { position: absolute; inset: 0; content: ""; pointer-events: none; }
.explore__canvas-wrap::before { background-image: radial-gradient(circle, rgba(255, 250, 245, .38) 1px, transparent 1.2px); background-size: 26px 26px; opacity: .35; }
.explore__canvas-wrap::after { background: radial-gradient(circle at 50% 45%, transparent 25%, rgba(13, 10, 26, .55)); }
.explore__lines { position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; }
.explore__lines line { stroke: rgba(255, 228, 138, .34); stroke-width: .14; stroke-dasharray: 1.2 .9; vector-effect: non-scaling-stroke; }
.explore__star { position: absolute; z-index: 2; display: grid; place-items: center; width: 2.4rem; height: 2.4rem; padding: 0; border: 0; border-radius: 50%; background: transparent; color: var(--star-dot); cursor: pointer; transform: translate(-50%, -50%); transition: opacity var(--bs-dur-base) ease, transform var(--bs-dur-base) var(--bs-ease-pop); }
.explore__star-core { display: block; font-size: var(--star-size); line-height: 1; filter: drop-shadow(0 0 8px var(--star-glow)); animation: explore-twinkle 3.4s var(--bs-ease-breathe) infinite; animation-delay: var(--star-delay); }
.explore__star-label { position: absolute; top: calc(100% + .15rem); left: 50%; width: max-content; max-width: 10.5rem; padding: .15rem .4rem; border-radius: .4rem; background: rgba(20, 15, 36, .78); color: #fffaf5; font-size: .68rem; line-height: 1.5; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: 0; transform: translate(-50%, -3px); transition: opacity var(--bs-dur-quick) ease, transform var(--bs-dur-quick) ease; pointer-events: none; }
.explore__star:hover .explore__star-label, .explore__star:focus-visible .explore__star-label, .explore__star.is-selected .explore__star-label { opacity: 1; transform: translate(-50%, 0); }
.explore__star:hover { z-index: 3; transform: translate(-50%, -50%) scale(1.28); }
.explore__star.is-selected { z-index: 3; transform: translate(-50%, -50%) scale(1.3); }
.explore__star.is-selected .explore__star-core { animation: explore-pulse 1.8s var(--bs-ease-breathe) infinite; }
.explore__star.is-dimmed { opacity: .22; }
.explore__star.is-dimmed:hover { opacity: .6; }
.explore__empty { margin: 1rem; color: var(--bs-ink-soft); text-align: center; }
/* The empty state sits inside the dark map, where default muted ink is too dim. */
.explore__canvas-wrap > .explore__empty { color: rgba(255, 250, 245, .78); }

.explore__postcard { position: relative; display: flex; flex-direction: column; min-height: 100%; overflow: hidden; padding: 1.35rem; background: linear-gradient(160deg, rgba(255, 250, 245, .76), rgba(246, 243, 255, .62)); }
.explore__postcard::before { position: absolute; inset: .55rem; border: 1px dashed rgba(177, 118, 140, .28); border-radius: 1.2rem; content: ""; pointer-events: none; }
.explore__postcard.has-story { background: linear-gradient(160deg, rgba(255, 240, 247, .84), rgba(246, 243, 255, .72)); }
/* The postcard is a sheet of light stationery in daytime; at night it has to
   become deep paper too, or the moonlight ink disappears on a cream card. */
:root.bs-dark .explore__postcard,
:root.bs-dark .explore__postcard.has-story { background: linear-gradient(160deg, rgba(48, 38, 74, .92), rgba(33, 26, 54, .88)); }
:root.bs-dark .explore__postcard::before { border-color: rgba(196, 178, 255, .28); }
.explore__postcard-stamp { position: absolute; top: 1.1rem; right: 1.1rem; display: grid; place-items: center; width: 3rem; height: 3rem; border-radius: .75rem; font-size: 1.35rem; box-shadow: 0 8px 18px rgba(57, 45, 79, .18); transform: rotate(6deg); }
.explore__postcard > * { position: relative; }
.explore__postcard h2 { margin: .45rem 0 .6rem; padding-right: 2.8rem; color: var(--bs-ink); font-size: clamp(1.3rem, 2.2vw, 1.65rem); line-height: 1.35; }
.explore__postcard-cat { margin: .35rem 0 0; color: var(--bs-accent-ink); font-size: .78rem; }
.explore__postcard-blurb { margin: .4rem 0 0; color: var(--bs-ink-soft); font-size: .9rem; line-height: 1.85; }
.explore__postcard-moon { display: block; margin: .6rem 0 .2rem; color: var(--bs-lilac); font-size: 2.6rem; line-height: 1; }
.explore__postcard-sign { margin-top: auto; padding-top: 1.3rem; color: var(--bs-ink-muted); font-size: .78rem; text-align: right; }
.explore__postcard-tags { display: flex; flex-wrap: wrap; gap: .35rem; margin-top: .8rem; }
.explore__postcard-tags a { padding: .22rem .55rem; border-radius: 999px; background: rgba(158, 230, 208, .25); color: #4f6d67; font-size: .74rem; text-decoration: none; }
:root.bs-dark .explore__postcard-tags a { color: var(--bs-mint); }
.explore__postcard-actions, .explore__letter-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; margin-top: auto; padding-top: 1.15rem; }
.explore__read { display: inline-flex; align-items: center; gap: .35rem; min-height: 2.75rem; padding: .55rem .9rem; border: 1.5px solid var(--bs-ink-line); border-radius: 999px; background: var(--bs-yellow); color: var(--bs-ink-on-accent); font-weight: 700; text-decoration: none; box-shadow: 2px 2px 0 var(--bs-ink-line); transition: transform var(--bs-dur-quick) var(--bs-ease-pop), box-shadow var(--bs-dur-quick) ease; }
.explore__read:hover { transform: translate(-1px, -2px); box-shadow: 4px 4px 0 var(--bs-ink-line); }
.explore__shuffle { min-height: 2.75rem; padding: .45rem .75rem; border: 1px dashed var(--bs-hairline); border-radius: 999px; background: transparent; color: var(--bs-ink-soft); font-family: inherit; font-size: .82rem; cursor: pointer; transition: var(--bs-dur-quick) ease; }
.explore__shuffle:hover { border-color: var(--bs-pink); color: var(--bs-ink); background: var(--bs-tint-pink); }

.explore__letter { position: relative; margin-top: 1rem; padding: 1.5rem 1.6rem; border: 1.5px solid rgba(255, 143, 179, .35); border-radius: 1.6rem; background: radial-gradient(circle at 92% 8%, rgba(255, 228, 138, .32), transparent 30%), var(--bs-paper-strong); box-shadow: var(--bs-shadow); }
.explore__letter-seal { position: absolute; top: -.85rem; left: 1.6rem; display: grid; place-items: center; width: 2.1rem; height: 2.1rem; border-radius: 50%; background: linear-gradient(135deg, var(--bs-pink), var(--bs-lilac)); color: #fffaf5; box-shadow: 0 6px 16px rgba(255, 143, 179, .4); }
.explore__letter h2 { margin: .3rem 0; color: var(--bs-ink); font-size: clamp(1.35rem, 3vw, 1.8rem); }
.explore__letter-meta { margin: 0; color: var(--bs-ink-muted); font-size: .8rem; }
.explore__letter-text { margin: .7rem 0 0; color: var(--bs-ink-body); line-height: 1.9; }
.explore-letter-enter-active { transition: opacity var(--bs-dur-slow) ease, transform var(--bs-dur-slow) var(--bs-ease-pop); }
.explore-letter-leave-active { transition: opacity var(--bs-dur-quick) ease, transform var(--bs-dur-quick) ease; }
.explore-letter-enter-from, .explore-letter-leave-to { opacity: 0; transform: translateY(14px) rotate(-.5deg); }

.explore__filters { margin-top: 1rem; padding: 1.25rem; }
.explore__reset { min-height: 2.4rem; padding: .3rem .7rem; border: 1px dashed var(--bs-hairline); border-radius: 999px; background: transparent; color: var(--bs-ink-soft); font-family: inherit; font-size: .8rem; cursor: pointer; }
.explore__reset:hover { border-color: var(--bs-pink); color: var(--bs-ink); }
.explore__moods { display: grid; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); gap: .55rem; margin-top: 1rem; }
.explore__mood { display: grid; grid-template-columns: auto 1fr; column-gap: .55rem; align-items: center; padding: .7rem .8rem; border: 1px solid var(--bs-border); border-radius: 1rem; background: var(--bs-surface-soft); color: var(--bs-ink-body); font-family: inherit; text-align: left; cursor: pointer; transition: var(--bs-dur-quick) var(--bs-ease-pop); }
.explore__mood > span { grid-row: span 2; font-size: 1.25rem; }
.explore__mood strong { color: var(--bs-ink); font-size: .88rem; }
.explore__mood small { color: var(--bs-ink-muted); font-size: .72rem; line-height: 1.5; }
.explore__mood:hover { border-color: rgba(255, 143, 179, .4); transform: translateY(-2px); }
.explore__mood.is-active { border-color: var(--bs-pink); background: var(--bs-tint-pink); box-shadow: 0 6px 20px rgba(255, 143, 179, .14); }
.explore__chips { display: flex; flex-wrap: wrap; gap: .4rem; margin-top: .75rem; }
.explore__chips--years { padding-top: .7rem; border-top: 1px dashed var(--bs-hairline); }
.explore__chip { display: inline-flex; align-items: center; gap: .3rem; min-height: 2.2rem; padding: .3rem .7rem; border: 1px solid var(--bs-border); border-radius: 999px; background: var(--bs-surface); color: var(--bs-ink-soft); font-family: inherit; font-size: .8rem; cursor: pointer; transition: var(--bs-dur-quick) ease; }
.explore__chip small { color: var(--bs-ink-muted); font-size: .68rem; }
.explore__chip:hover { border-color: rgba(185, 167, 255, .55); color: var(--bs-ink); }
.explore__chip.is-active { border-color: var(--bs-ink-line); background: var(--bs-tint-yellow); color: var(--bs-ink); box-shadow: 2px 2px 0 var(--bs-ink-line); }
.explore__chip--year { border-style: dashed; }

.explore__results { margin-top: 1.1rem; }
.explore__results-note { margin: 0 0 .7rem; color: var(--bs-ink-muted); font-size: .82rem; }
.explore__result-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .55rem; }
.explore__result { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: .65rem; padding: .6rem .7rem; border: 1px solid var(--bs-border); border-radius: .95rem; background: var(--bs-surface); color: var(--bs-ink-body); text-decoration: none; transition: var(--bs-dur-base) ease; }
.explore__result:hover { border-color: var(--bs-border-accent); transform: translateY(-3px); box-shadow: var(--bs-shadow-soft); }
.explore__result-emoji { display: grid; place-items: center; width: 2.3rem; height: 2.3rem; border-radius: .7rem; font-size: .98rem; }
.explore__result-body { display: grid; min-width: 0; gap: .1rem; }
.explore__result-body strong { overflow: hidden; color: var(--bs-ink); font-size: .86rem; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.explore__result-body small { color: var(--bs-ink-muted); font-size: .72rem; }
.explore__result-arrow { color: var(--bs-ink-muted); font-size: .9rem; opacity: 0; transform: translate(-3px, 3px); transition: var(--bs-dur-quick) ease; }
.explore__result:hover .explore__result-arrow { opacity: 1; transform: none; }

@keyframes explore-orbit { to { transform: rotate(360deg); } }
@keyframes explore-twinkle { 0%, 100% { opacity: .62; transform: scale(.85) rotate(-6deg); } 50% { opacity: 1; transform: scale(1.12) rotate(8deg); } }
@keyframes explore-pulse { 0%, 100% { filter: drop-shadow(0 0 8px var(--star-glow)) brightness(1); } 50% { filter: drop-shadow(0 0 18px var(--star-glow)) brightness(1.4); } }

@media (max-width: 900px) {
  .explore__layout { grid-template-columns: 1fr; }
  .explore__postcard { min-height: 16rem; }
  .explore__postcard-actions, .explore__letter-actions { margin-top: .8rem; }
}
@media (max-width: 640px) {
  .explore { padding-top: .8rem; }
  .explore__result-list { grid-template-columns: 1fr; }
  .explore__star-label { display: none; }
  .explore__canvas-wrap { height: 24rem; }
  .explore__quick { align-items: flex-start; flex-direction: column; }
  .explore__postcard { padding: 1.15rem; }
}
@media (prefers-reduced-motion: reduce) {
  .explore__orbit, .explore__star-core, .explore__star.is-selected .explore__star-core { animation: none; }
  .explore__star, .explore__star-label, .explore-letter-enter-active, .explore-letter-leave-active { transition: none; }
}
html.bs-reduced-motion .explore__orbit,
html.bs-reduced-motion .explore__star-core,
html.bs-reduced-motion .explore__star.is-selected .explore__star-core { animation: none; }
</style>
