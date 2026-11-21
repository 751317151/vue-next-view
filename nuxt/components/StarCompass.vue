<template>
  <ClientOnly>
    <div v-if="open" class="compass-scrim" @click.self="close">
      <section
        ref="panelEl"
        class="compass"
        role="dialog"
        aria-modal="true"
        aria-labelledby="compass-title"
        aria-describedby="compass-status"
        tabindex="-1"
      >
        <span class="compass__orbit compass__orbit--one" aria-hidden="true"></span>
        <span class="compass__orbit compass__orbit--two" aria-hidden="true"></span>
        <span class="compass__spark compass__spark--one" aria-hidden="true">✦</span>
        <span class="compass__spark compass__spark--two" aria-hidden="true">✧</span>

        <header class="compass__head">
          <div class="compass__brand">
            <span class="compass__rose" aria-hidden="true"><b>✦</b></span>
            <div>
              <p class="compass__kicker">STAR COMPASS</p>
              <h2 id="compass-title">星海罗盘</h2>
            </div>
          </div>
          <button ref="closeButton" type="button" class="compass__close" aria-label="关闭星海罗盘" @click="close">×</button>
        </header>

        <div class="compass__field">
          <span class="compass__field-icon" aria-hidden="true">✦</span>
          <input
            ref="inputEl"
            v-model="query"
            class="compass__input"
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-controls="star-compass-results"
            aria-expanded="true"
            :aria-activedescendant="items.length ? `star-compass-item-${activeIndex}` : undefined"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            placeholder="搜索故事，或输入页面名字…"
            aria-label="搜索故事或页面"
            @keydown="onInputKeydown"
          />
          <button v-if="query" type="button" class="compass__clear" aria-label="清空搜索" @click="clearQuery">×</button>
          <kbd v-else class="compass__shortcut">esc</kbd>
        </div>

        <p id="compass-status" class="compass__status" role="status" aria-live="polite" aria-atomic="true">
          <span v-if="searching" class="compass__status-star" aria-hidden="true">✦</span>{{ statusText }}
        </p>

        <div
          id="star-compass-results"
          ref="resultsEl"
          class="compass__results"
          :class="{ 'is-routes': !normalizedQuery }"
          role="listbox"
          :aria-label="normalizedQuery ? '搜索结果' : '快捷航线'"
          :aria-busy="searching"
        >
          <section
            v-for="(group, groupIndex) in groups"
            :key="group.label"
            class="compass__group"
            role="group"
            :aria-labelledby="`compass-group-${groupIndex}`"
          >
            <p :id="`compass-group-${groupIndex}`" class="compass__group-label">{{ group.label }}</p>
            <div class="compass__options" :class="`compass__options--${group.layout}`">
              <button
                v-for="item in group.items"
                :id="`star-compass-item-${indexOf(item)}`"
                :key="item.id"
                type="button"
                role="option"
                tabindex="-1"
                class="compass__option"
                :class="{ 'is-active': indexOf(item) === activeIndex }"
                :aria-selected="indexOf(item) === activeIndex"
                @mouseenter="activeIndex = indexOf(item)"
                @click="execute(item)"
              >
                <span class="compass__option-emoji" aria-hidden="true">{{ item.emoji }}</span>
                <span class="compass__option-body">
                  <strong>{{ item.kind === 'random' && randomLoading ? '星星正在挑…' : item.label }}</strong>
                  <small>{{ item.hint }}</small>
                  <span
                    v-if="typeof item.progress === 'number'"
                    class="compass__progress"
                    aria-hidden="true"
                  >
                    <span
                      class="compass__progress-fill"
                      :class="{ 'is-complete': item.progress >= 0.995 }"
                      :style="{ width: `${Math.round(item.progress * 100)}%` }"
                    ></span>
                  </span>
                </span>
                <span class="compass__option-arrow" aria-hidden="true">
                  {{ item.kind === 'random' ? '✦' : item.kind === 'search' ? '↵' : item.kind === 'settings' ? '⚙' : '↗' }}
                </span>
              </button>
            </div>
          </section>
        </div>

        <section v-if="footprint.length" class="compass__trail" aria-label="最近探索足迹">
          <p class="compass__trail-label">RECENT TRAIL · 最近的足迹</p>
          <ol class="compass__trail-list">
            <li v-for="(step, stepIndex) in footprint" :key="`${step.at}-${stepIndex}`">
              <span aria-hidden="true">{{ stepIndex === 0 ? '✦' : '·' }}</span>
              {{ signalLabel(step.name) }}
            </li>
          </ol>
        </section>

        <footer class="compass__foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> 选择</span>
          <span><kbd>↵</kbd> 前往</span>
          <span><kbd>esc</kbd> 收起</span>
          <span class="compass__foot-brand">把想去的地方，说给星星听。</span>
        </footer>
      </section>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { nextTick } from 'vue';
import type { PublicArticle, PublicSearchResult } from '../types/public';
import { useFocusTrap } from '../composables/useFocusTrap';
import { useReadingTrail, type ReadingTrailItem } from '../composables/useReadingTrail';
import { recentSiteSignals, signalLabel, trackSiteSignal, type SiteSignal } from '../composables/useSiteSignals';

interface CompassCommand {
  id: string;
  kind: 'page' | 'article' | 'search' | 'random' | 'settings';
  label: string;
  hint: string;
  emoji: string;
  to?: string;
  /** 只有「接着读」会带进度，0–1。 */
  progress?: number;
}

interface CompassGroup {
  label: string;
  layout: 'grid' | 'list';
  items: CompassCommand[];
}

const props = defineProps<{ open: boolean; source?: 'menu' | 'drawer' }>();
const emit = defineEmits<{ close: []; settings: [] }>();

const PAGES = [
  { id: 'home', label: '首页', hint: '回到故事开始的地方', emoji: '🌙', to: '/', keywords: 'home index start 首页' },
  { id: 'explore', label: '灵感星图', hint: '让心情和运气带路', emoji: '🌠', to: '/explore', keywords: 'explore star map 漫游 星图 随机' },
  { id: 'archive', label: '归档', hint: '按时间翻阅所有故事', emoji: '📚', to: '/archive', keywords: 'archive timeline 归档 时间' },
  { id: 'categories', label: '分类', hint: '每间小房间的主题', emoji: '🏠', to: '/categories', keywords: 'categories 分类 目录' },
  { id: 'tags', label: '标签', hint: '灵感串起的小线索', emoji: '🏷️', to: '/tags', keywords: 'tags 标签' },
  { id: 'message', label: '留言板', hint: '贴上一张温柔的便利贴', emoji: '✉️', to: '/message', keywords: 'message guestbook 留言 留言板' },
  { id: 'friend', label: '友人帐', hint: '一起发光的人', emoji: '🫧', to: '/friend', keywords: 'friends 友链 友人' },
  { id: 'about', label: '关于', hint: '认识写这些字的人', emoji: '🌿', to: '/about', keywords: 'about profile 关于 作者' },
  { id: 'search', label: '搜索页', hint: '打开完整搜索结果', emoji: '🔎', to: '/search', keywords: 'search 搜索 查找' },
];

const router = useRouter();
const query = ref('');
const searchResults = ref<PublicSearchResult[]>([]);
const searching = ref(false);
const searchError = ref(false);
const activeIndex = ref(0);
const randomLoading = ref(false);
const footprint = ref<SiteSignal[]>([]);
const { items: readingTrail, hydrate: hydrateReadingTrail } = useReadingTrail();
const panelEl = ref<HTMLElement | null>(null);
const inputEl = ref<HTMLInputElement | null>(null);
const closeButton = ref<HTMLButtonElement | null>(null);
const resultsEl = ref<HTMLElement | null>(null);

let searchTimer = 0;
let searchAbort: AbortController | null = null;
let articleCache: PublicArticle[] | null = null;
let skipReturnFocus = false;

const normalizedQuery = computed(() => query.value.trim());

const pageCommands = computed<CompassCommand[]>(() => {
  const term = normalizedQuery.value.toLowerCase();
  const matched = term
    ? PAGES.filter((page) => `${page.label} ${page.hint} ${page.keywords}`.toLowerCase().includes(term))
    : PAGES;
  return matched.map((page) => ({
    id: `page-${page.id}`,
    kind: 'page',
    label: page.label,
    hint: page.hint,
    emoji: page.emoji,
    to: page.to,
  }));
});

const articleCommands = computed<CompassCommand[]>(() => searchResults.value.map((article) => ({
  id: `article-${article.id}`,
  kind: 'article',
  label: article.articleTitle,
  hint: [article.category || '随笔', formatDate(article.createTime), excerptOf(article.articleContent, 38)]
    .filter(Boolean)
    .join(' · '),
  emoji: '📖',
  to: `/article/${article.slug}`,
})));

const searchCommand = computed<CompassCommand>(() => ({
  id: 'search-page',
  kind: 'search',
  label: `在搜索页继续找「${normalizedQuery.value}」`,
  hint: '打开完整搜索结果，按内容再筛一遍',
  emoji: '🔎',
  to: `/search?q=${encodeURIComponent(normalizedQuery.value)}`,
}));

const randomCommand = computed<CompassCommand>(() => ({
  id: 'random-story',
  kind: 'random',
  label: randomLoading.value ? '星星正在挑…' : '替我抽一篇今日小笺',
  hint: '让星星从全部故事里挑一封',
  emoji: '🎐',
}));

const settingsCommand: CompassCommand = {
  id: 'open-settings',
  kind: 'settings',
  label: '主题与设置',
  hint: '切换白天 / 星夜 / 跟随系统，调节动效',
  emoji: '⚙',
};

const readingTimeLabel = (at: number) => {
  const diff = Math.max(0, Date.now() - at);
  if (diff < 60 * 1000) return '刚刚';
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))} 分钟前`;
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))} 小时前`;
  if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (24 * 60 * 60 * 1000))} 天前`;
  const date = new Date(at);
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日`;
};

const continueCommands = computed<CompassCommand[]>(() => readingTrail.value
  .slice()
  .sort((a, b) => b.at - a.at)
  .slice(0, 3)
  .map((item: ReadingTrailItem) => {
    const finished = item.progress >= 0.995;
    const percent = Math.min(100, Math.max(1, Math.round(item.progress * 100)));
    return {
      id: `continue-${item.slug}`,
      kind: 'article',
      label: item.title,
      hint: [
        item.category,
        finished ? '读完了 · 随时再翻一遍' : `读到 ${percent}% · ${readingTimeLabel(item.at)}`,
      ].filter(Boolean).join(' · '),
      emoji: finished ? '🌟' : item.emoji || '📖',
      to: `/article/${item.slug}`,
      progress: item.progress,
    };
  }));

const groups = computed<CompassGroup[]>(() => {
  if (!normalizedQuery.value) {
    const next: CompassGroup[] = [];
    if (continueCommands.value.length) {
      next.push({ label: '接着读 · 上次停在这里', layout: 'list', items: continueCommands.value });
    }
    next.push(
      { label: '去哪儿？', layout: 'grid', items: pageCommands.value },
      { label: '让星星决定', layout: 'list', items: [randomCommand.value] },
      { label: '调一调', layout: 'list', items: [settingsCommand] },
    );
    return next;
  }

  const next: CompassGroup[] = [];
  if (articleCommands.value.length) next.push({ label: '故事', layout: 'list', items: articleCommands.value });
  if (pageCommands.value.length) next.push({ label: '页面', layout: 'list', items: pageCommands.value });
  next.push({ label: '继续找', layout: 'list', items: [searchCommand.value] });
  return next;
});

const items = computed(() => groups.value.flatMap((group) => group.items));
const indexOf = (target: CompassCommand) => items.value.indexOf(target);

const statusText = computed(() => {
  if (!normalizedQuery.value) {
    return continueCommands.value.length
      ? '从上次停下的地方接着读，或输入关键词寻找新的星星。'
      : '输入标题、关键词，或直接挑一条航线。';
  }
  if (searching.value) return '正在星海里翻找…';
  if (searchError.value) return '星海有点吵，没听清。换个关键词，或去搜索页再试一次。';
  if (searchResults.value.length) {
    return `找到 ${searchResults.value.length} 篇故事${pageCommands.value.length ? ` · ${pageCommands.value.length} 个页面` : ''}`;
  }
  if (pageCommands.value.length) return `没有匹配的故事，但有 ${pageCommands.value.length} 个页面可以直达。`;
  return '没有找到这颗星星，换一个关键词试试看。';
});

const close = () => emit('close');

const clearQuery = async () => {
  query.value = '';
  await nextTick();
  inputEl.value?.focus({ preventScroll: true });
};

const execute = async (item: CompassCommand) => {
  if (item.kind === 'random') {
    await drawRandom();
    return;
  }
  if (item.kind === 'settings') {
    skipReturnFocus = false;
    close();
    emit('settings');
    return;
  }
  if (!item.to) return;
  trackSiteSignal('compass:navigate', item.kind);
  skipReturnFocus = true;
  close();
  await router.push(item.to);
};

const drawRandom = async () => {
  if (randomLoading.value) return;
  trackSiteSignal('compass:random');
  randomLoading.value = true;
  try {
    if (!articleCache) articleCache = await $fetch<PublicArticle[]>('/api/articles');
    if (!articleCache.length) {
      skipReturnFocus = true;
      close();
      await router.push('/explore');
      return;
    }
    const currentPath = router.currentRoute.value.path;
    const candidates = articleCache.length > 1
      ? articleCache.filter((article) => currentPath !== `/article/${article.slug}`)
      : articleCache;
    const picked = candidates[Math.floor(Math.random() * candidates.length)]!;
    skipReturnFocus = true;
    close();
    await router.push(`/article/${picked.slug}`);
  } catch {
    // 网络不稳时不让罗盘卡住：退到星图，仍然有一条路可走。
    skipReturnFocus = true;
    close();
    await router.push('/explore');
  } finally {
    randomLoading.value = false;
  }
};

const move = (delta: number) => {
  const total = items.value.length;
  if (!total) return;
  activeIndex.value = (activeIndex.value + delta + total) % total;
};

const onInputKeydown = (event: KeyboardEvent) => {
  if (event.isComposing) return;
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    move(1);
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    move(-1);
  } else if (event.key === 'Enter') {
    event.preventDefault();
    const item = items.value[activeIndex.value];
    if (item) void execute(item);
  }
};

watch(normalizedQuery, (value) => {
  searchAbort?.abort();
  window.clearTimeout(searchTimer);
  searchResults.value = [];
  searchError.value = false;
  activeIndex.value = 0;
  if (!value) {
    searching.value = false;
    return;
  }

  searching.value = true;
  trackSiteSignal('compass:search');
  searchTimer = window.setTimeout(async () => {
    const controller = new AbortController();
    searchAbort = controller;
    try {
      const results = await $fetch<PublicSearchResult[]>('/api/search', {
        query: { q: value },
        signal: controller.signal,
      });
      if (!controller.signal.aborted) searchResults.value = results.slice(0, 6);
    } catch {
      if (!controller.signal.aborted) searchError.value = true;
    } finally {
      if (!controller.signal.aborted) searching.value = false;
    }
  }, 170);
});

watch(items, (list) => {
  if (!list.length) {
    activeIndex.value = 0;
    return;
  }
  if (activeIndex.value > list.length - 1) activeIndex.value = list.length - 1;
});

watch(activeIndex, async () => {
  await nextTick();
  const active = resultsEl.value?.querySelector<HTMLElement>(`#star-compass-item-${activeIndex.value}`);
  active?.scrollIntoView({ block: 'nearest' });
});

watch(() => props.open, (open) => {
  if (!open) {
    searchAbort?.abort();
    window.clearTimeout(searchTimer);
    return;
  }
  trackSiteSignal('compass:open', props.source || 'menu');
  hydrateReadingTrail();
  footprint.value = recentSiteSignals(4).filter((step) => step.name !== 'compass:open').slice(0, 3);
  query.value = '';
  searchResults.value = [];
  searchError.value = false;
  searching.value = false;
  randomLoading.value = false;
  activeIndex.value = 0;
  skipReturnFocus = false;
});

onBeforeUnmount(() => {
  searchAbort?.abort();
  window.clearTimeout(searchTimer);
});

const isOpen = computed(() => props.open);
useFocusTrap(isOpen, panelEl, {
  onEscape: close,
  initialFocus: () => inputEl.value,
  // 从抽屉进来时，罗盘关闭后应回到汉堡按钮；从顶栏进来则回到罗盘按钮。
  returnFocus: () => document.querySelector<HTMLElement>(
    props.source === 'drawer' ? '.site-shell__menu-btn' : '.site-shell__compass-btn',
  ),
  // 只有导航离开时才跳过归还；Escape 关闭需要把焦点交回罗盘入口。
  shouldReturnFocus: () => !skipReturnFocus || props.open,
});
</script>

<style scoped>
.compass-scrim { position: fixed; inset: 0; z-index: 100; display: flex; align-items: flex-start; justify-content: center; overflow: auto; padding: clamp(3.5rem, 12vh, 7rem) 1rem 1rem; background: radial-gradient(circle at 50% 18%, rgba(83, 63, 118, .5), rgba(22, 17, 38, .75)); backdrop-filter: blur(10px) saturate(.9); animation: compass-scrim-in var(--bs-dur-base) ease; }

.compass {
  position: relative;
  width: min(44rem, 100%);
  padding: 1.15rem 1.2rem 1rem;
  overflow: hidden;
  border: 1px solid var(--bs-border);
  border-radius: 1.8rem;
  background: var(--bs-paper-strong);
  box-shadow: 0 32px 90px rgba(22, 17, 38, .48), inset 0 1px 0 rgba(255, 255, 255, .4);
  backdrop-filter: blur(26px) saturate(1.15);
  color: var(--bs-ink);
  animation: compass-panel-in var(--bs-dur-mid) var(--bs-ease-pop);
}

/* 罗盘背后的星轨：两圈虚线缓慢反向转动，给面板一个“正在定位”的生命感。 */
.compass::before {
  position: absolute;
  top: -10rem;
  right: -8rem;
  width: 22rem;
  height: 22rem;
  border: 1px dashed rgba(185, 167, 255, .32);
  border-radius: 50%;
  content: "";
  pointer-events: none;
}

.compass__orbit { position: absolute; border: 1px dashed rgba(255, 143, 179, .22); border-radius: 50%; pointer-events: none; }
.compass__orbit--one { top: -5.5rem; right: -4rem; width: 15rem; height: 15rem; animation: compass-orbit 28s linear infinite; }
.compass__orbit--two { top: -2.4rem; right: -1rem; width: 9rem; height: 9rem; border-style: solid; border-color: rgba(255, 228, 138, .16); animation: compass-orbit-reverse 20s linear infinite; }

.compass__spark { position: absolute; color: var(--bs-peach); pointer-events: none; animation: compass-twinkle 3.6s var(--bs-ease-breathe) infinite; }
.compass__spark--one { top: 2.5rem; right: 4.8rem; font-size: .8rem; }
.compass__spark--two { top: 4.9rem; right: 2.1rem; color: var(--bs-lilac); font-size: .62rem; animation-delay: -1.2s; }

.compass__head { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.compass__brand { display: flex; align-items: center; gap: .65rem; }
.compass__rose { position: relative; display: grid; place-items: center; width: 2.5rem; height: 2.5rem; border: 1.5px solid var(--bs-ink-line); border-radius: 50%; background: linear-gradient(135deg, var(--bs-yellow), var(--bs-pink) 58%, var(--bs-lilac)); color: var(--bs-ink-on-accent); box-shadow: var(--bs-sticker-shadow); transform: rotate(-7deg); }
.compass__rose::before { position: absolute; inset: .3rem; border: 1px dashed rgba(57, 45, 79, .5); border-radius: 50%; content: ""; }
.compass__rose b { position: relative; font-size: 1rem; line-height: 1; animation: compass-rose-spin 9s linear infinite; }
.compass__kicker { margin: 0; color: var(--bs-accent-ink); font-size: .64rem; letter-spacing: .2em; }
.compass__brand h2 { margin: .1rem 0 0; color: var(--bs-ink); font-size: 1.1rem; letter-spacing: .02em; }
.compass__close { display: grid; place-items: center; width: 2rem; height: 2rem; padding: 0; border: 0; border-radius: 50%; background: transparent; color: var(--bs-ink-soft); font-size: 1.2rem; line-height: 1; cursor: pointer; transition: var(--bs-dur-quick) ease; }
.compass__close:hover { background: var(--bs-tint-pink); color: var(--bs-ink); transform: rotate(90deg); }

.compass__field { position: relative; z-index: 1; display: flex; align-items: center; gap: .55rem; margin-top: 1rem; padding: .25rem .55rem .25rem .85rem; border: 1.5px solid var(--bs-border-accent); border-radius: 999px; background: var(--bs-surface-strong); box-shadow: 0 8px 24px rgba(95, 66, 118, .1); transition: box-shadow var(--bs-dur-quick) ease, border-color var(--bs-dur-quick) ease; }
.compass__field:focus-within { border-color: var(--bs-pink); box-shadow: 0 0 0 4px rgba(255, 143, 179, .14), 0 12px 30px rgba(255, 143, 179, .18); }
.compass__field-icon { flex: 0 0 auto; color: var(--bs-peach); font-size: .9rem; animation: compass-twinkle 3.2s var(--bs-ease-breathe) infinite; }
.compass__input { min-width: 0; flex: 1; padding: .6rem 0; border: 0; outline: 0; background: transparent; color: var(--bs-ink); font-family: inherit; font-size: .98rem; }
.compass__input::placeholder { color: var(--bs-ink-faint); }
.compass__clear { display: grid; place-items: center; width: 1.6rem; height: 1.6rem; padding: 0; border: 0; border-radius: 50%; background: var(--bs-surface-soft); color: var(--bs-ink-soft); font-size: .9rem; line-height: 1; cursor: pointer; }
.compass__clear:hover { background: var(--bs-tint-pink); color: var(--bs-accent-strong); }
.compass__shortcut { flex: 0 0 auto; padding: .12rem .4rem; border: 1px solid var(--bs-border); border-radius: .35rem; color: var(--bs-ink-faint); font-family: inherit; font-size: .62rem; letter-spacing: .06em; }

.compass__status { position: relative; z-index: 1; display: flex; align-items: center; gap: .35rem; min-height: 1.3rem; margin: .55rem .25rem 0; color: var(--bs-ink-muted); font-size: .76rem; }
.compass__status-star { display: inline-block; color: var(--bs-peach); animation: compass-twinkle 1.4s var(--bs-ease-breathe) infinite; }

.compass__results { position: relative; z-index: 1; max-height: min(48vh, 23rem); margin-top: .35rem; overflow: auto; overscroll-behavior: contain; padding: 0 .1rem .1rem; }
.compass__group { margin-top: .7rem; }
.compass__group:first-child { margin-top: .15rem; }
.compass__group-label { margin: 0 0 .35rem .35rem; color: var(--bs-accent-ink); font-size: .66rem; letter-spacing: .15em; }

.compass__options--grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .4rem; }
.compass__options--list { display: grid; gap: .28rem; }

.compass__option { position: relative; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: .6rem; align-items: center; width: 100%; padding: .55rem .65rem; border: 1px solid transparent; border-radius: .9rem; background: transparent; color: var(--bs-ink-body); font-family: inherit; text-align: left; cursor: pointer; transition: background var(--bs-dur-quick) ease, border-color var(--bs-dur-quick) ease, transform var(--bs-dur-quick) var(--bs-ease-pop); }
.compass__option:hover, .compass__option.is-active { border-color: var(--bs-border-accent); background: linear-gradient(135deg, var(--bs-tint-yellow), rgba(255, 143, 179, .12)); transform: translateX(3px); }
.compass__options--grid .compass__option { border-color: var(--bs-hairline); background: var(--bs-surface); }
.compass__options--grid .compass__option:hover, .compass__options--grid .compass__option.is-active { background: linear-gradient(135deg, var(--bs-tint-yellow), var(--bs-tint-pink)); transform: translateY(-2px) rotate(-.5deg); }
.compass__option-emoji { display: grid; place-items: center; width: 2rem; height: 2rem; border-radius: .65rem; background: var(--bs-tint-lilac); font-size: .92rem; }
.compass__option-body { display: grid; gap: .08rem; min-width: 0; }
.compass__option-body strong { overflow: hidden; color: var(--bs-ink); font-size: .86rem; font-weight: 600; line-height: 1.45; text-overflow: ellipsis; white-space: nowrap; }
.compass__option-body small { overflow: hidden; color: var(--bs-ink-muted); font-size: .7rem; line-height: 1.45; text-overflow: ellipsis; white-space: nowrap; }
.compass__progress { display: block; height: .22rem; margin-top: .15rem; overflow: hidden; border-radius: 999px; background: var(--bs-hairline); }
.compass__progress-fill { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--bs-lilac), var(--bs-pink), var(--bs-yellow)); transition: width var(--bs-dur-mid) var(--bs-ease-pop); }
.compass__progress-fill.is-complete { background: linear-gradient(90deg, var(--bs-mint), var(--bs-yellow)); }
.compass__option-arrow { color: var(--bs-ink-faint); font-size: .82rem; opacity: 0; transform: translate(-3px, 2px); transition: var(--bs-dur-quick) ease; }
.compass__option:hover .compass__option-arrow, .compass__option.is-active .compass__option-arrow { opacity: 1; transform: none; }

.compass__foot { position: relative; z-index: 1; display: flex; flex-wrap: wrap; align-items: center; gap: .7rem; margin-top: .8rem; padding-top: .7rem; border-top: 1px dashed var(--bs-hairline); color: var(--bs-ink-faint); font-size: .66rem; }
.compass__trail { position: relative; z-index: 1; margin-top: .7rem; padding: .5rem .65rem .55rem; border: 1px dashed var(--bs-hairline); border-radius: .85rem; background: var(--bs-surface-soft); }
.compass__trail-label { margin: 0 0 .3rem; color: var(--bs-accent-ink); font-size: .6rem; letter-spacing: .14em; }
.compass__trail-list { display: flex; flex-wrap: wrap; gap: .3rem .75rem; margin: 0; padding: 0; list-style: none; color: var(--bs-ink-soft); font-size: .7rem; }
.compass__trail-list li { display: inline-flex; align-items: center; gap: .2rem; }
.compass__trail-list li span { color: var(--bs-peach); }
.compass__foot kbd { display: inline-block; margin-right: .15rem; padding: .08rem .28rem; border: 1px solid var(--bs-border); border-radius: .3rem; background: var(--bs-surface); color: var(--bs-ink-soft); font-family: inherit; font-size: .62rem; }
.compass__foot-brand { margin-left: auto; color: var(--bs-ink-faint); letter-spacing: .04em; }

@keyframes compass-scrim-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes compass-panel-in { from { opacity: 0; transform: translateY(-.8rem) scale(.97); } to { opacity: 1; transform: none; } }
@keyframes compass-orbit { to { transform: rotate(360deg); } }
@keyframes compass-orbit-reverse { to { transform: rotate(-360deg); } }
@keyframes compass-twinkle { 0%, 100% { opacity: .45; transform: scale(.9) rotate(-6deg); } 50% { opacity: 1; transform: scale(1.15) rotate(10deg); } }
@keyframes compass-rose-spin { to { transform: rotate(360deg); } }

@media (max-width: 640px) {
  .compass-scrim { padding: .6rem; align-items: flex-start; }
  .compass { padding: 1rem .85rem .85rem; border-radius: 1.4rem; }
  .compass__options--grid { grid-template-columns: 1fr; }
  .compass__option-body small { white-space: normal; }
  .compass__foot-brand { display: none; }
  .compass__results { max-height: 55vh; }
  .compass__orbit--one { top: -8rem; right: -8rem; }
}

@media (prefers-reduced-motion: reduce) {
  .compass-scrim, .compass { animation: none; }
  .compass__orbit, .compass__spark, .compass__field-icon, .compass__status-star, .compass__rose b { animation: none; }
  .compass__option, .compass__option-arrow, .compass__close { transition: none; }
  .compass__option:hover, .compass__option.is-active { transform: none; }
}

html.bs-reduced-motion .compass-scrim,
html.bs-reduced-motion .compass,
html.bs-reduced-motion .compass__orbit,
html.bs-reduced-motion .compass__spark,
html.bs-reduced-motion .compass__field-icon,
html.bs-reduced-motion .compass__status-star,
html.bs-reduced-motion .compass__rose b { animation: none; }
html.bs-reduced-motion .compass__option,
html.bs-reduced-motion .compass__option-arrow,
html.bs-reduced-motion .compass__close { transition: none; }
</style>
