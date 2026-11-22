<script setup lang="ts">
import { siteConfig } from '../../src/config/site';
import { useReadingTrail } from '../composables/useReadingTrail';
import { useStarJar } from '../composables/useStarJar';
import { useExcerpts } from '../composables/useExcerpts';

// 书桌是纯个人工作台，不需要被搜索引擎或生成式引擎当作公共内容收录。
useHead({
  title: `我的书桌 | ${siteConfig.name}`,
  meta: [
    { name: 'robots', content: 'noindex, follow' },
    { name: 'description', content: '你的阅读足迹、星愿瓶和摘抄本都收在这张书桌上。' },
  ],
});

const { items: trail, ready: trailReady, hydrate: hydrateTrail, remove: removeTrail, clear: clearTrail } = useReadingTrail();
const { stars, ready: starsReady, hydrate: hydrateStars, remove: removeStar, clear: clearStars } = useStarJar();
const { items: excerpts, ready: excerptsReady, hydrate: hydrateExcerpts, remove: removeExcerpt, clear: clearExcerpts } = useExcerpts();

const shelf = ref<'trail' | 'stars' | 'excerpts'>('trail');
const copiedId = ref('');
const exported = ref(false);
let copyTimer = 0;
let exportTimer = 0;

const hydrated = computed(() => trailReady.value && starsReady.value && excerptsReady.value);

const reading = computed(() => trail.value
  .filter((item) => item.progress >= 0.03 && item.progress < 0.995)
  .sort((a, b) => b.at - a.at));
const finished = computed(() => trail.value
  .filter((item) => item.progress >= 0.995)
  .sort((a, b) => b.at - a.at));

const percentOf = (progress: number) => Math.min(100, Math.max(1, Math.round(progress * 100)));
const totalRead = computed(() => trail.value.length);
const totalStars = computed(() => stars.value.length);
const totalExcerpts = computed(() => excerpts.value.length);

const excerptBySlug = computed(() => {
  const map = new Map<string, number>();
  for (const item of excerpts.value) map.set(item.slug, (map.get(item.slug) || 0) + 1);
  return map;
});

const trayItems = computed(() => {
  if (shelf.value === 'stars') return stars.value.map((star) => ({
    id: star.slug,
    title: star.title,
    meta: star.category || '随笔',
    emoji: star.emoji,
    to: `/article/${encodeURIComponent(star.slug)}`,
    note: '收进星愿瓶',
  }));
  if (shelf.value === 'excerpts') return excerpts.value.map((item) => ({
    id: item.id,
    title: item.text,
    meta: `${item.title}${item.headingText ? ` · ${item.headingText}` : ''}`,
    emoji: '❝',
    to: `/article/${encodeURIComponent(item.slug)}${item.headingId ? `#${encodeURIComponent(item.headingId)}` : ''}`,
    note: '',
  }));
  return [];
});

const isEmpty = computed(() => {
  if (shelf.value === 'trail') return !reading.value.length && !finished.value.length;
  if (shelf.value === 'stars') return !stars.value.length;
  return !excerpts.value.length;
});

const timeLabel = (at: number) => {
  const diff = Math.max(0, Date.now() - at);
  if (diff < 60_000) return '刚刚';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)} 天前`;
  const date = new Date(at);
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日`;
};

const copy = async (value: string, id: string) => {
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
  copiedId.value = id;
  window.clearTimeout(copyTimer);
  copyTimer = window.setTimeout(() => { copiedId.value = ''; }, 1600);
};

const copyExcerpt = (id: string) => {
  const item = excerpts.value.find((entry) => entry.id === id);
  if (!item) return;
  void copy(`「${item.text}」\n—— ${item.title}${item.headingText ? ` · ${item.headingText}` : ''}`, id);
};

/**
 * 导出成 Markdown 文件：摘抄本放在浏览器里，但读者应该能把它们带走。
 * 用 Blob + 下载链接，不经过服务器，内容不会离开这台设备。
 */
const exportExcerpts = () => {
  if (!excerpts.value.length) return;
  const lines = [
    `# 我的摘抄本 · ${siteConfig.name}`,
    '',
    `> 导出于 ${new Date().toLocaleDateString('zh-CN')}，共 ${excerpts.value.length} 句。`,
    '',
  ];
  for (const item of excerpts.value) {
    lines.push(`## ${item.title}`);
    if (item.headingText) lines.push(`*${item.headingText}*`);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    lines.push('', `> ${item.text}`, '', `— <${origin}/article/${encodeURIComponent(item.slug)}>`, '');
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = '我的摘抄本.md';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  exported.value = true;
  window.clearTimeout(exportTimer);
  exportTimer = window.setTimeout(() => { exported.value = false; }, 2400);
};

const clearCurrent = () => {
  if (shelf.value === 'trail') clearTrail();
  else if (shelf.value === 'stars') clearStars();
  else clearExcerpts();
};

const removeCurrent = (id: string) => {
  if (shelf.value === 'trail') removeTrail(id);
  else if (shelf.value === 'stars') removeStar(id);
  else removeExcerpt(id);
};

const hintFor = computed(() => {
  if (shelf.value === 'trail') return '读过就会自动记下，不用手动收藏。';
  if (shelf.value === 'stars') return '在文章标题旁点 ☆，故事就会落进星愿瓶。';
  return '在文章里选中一句话，点「夹进摘抄本 ✦」。';
});

/**
 * WAI-ARIA 的 tablist 约定：左右方向键在抽屉间移动，Home / End 跳到两头。
 * 只标 role="tab" 而不实现键盘，读屏用户会以为坏了。
 */
const TABS = ['trail', 'stars', 'excerpts'] as const;
const onTabKeydown = (event: KeyboardEvent) => {
  const index = TABS.indexOf(shelf.value);
  let next = index;
  if (event.key === 'ArrowRight') next = (index + 1) % TABS.length;
  else if (event.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = TABS.length - 1;
  else return;
  event.preventDefault();
  shelf.value = TABS[next]!;
  nextTick(() => document.getElementById(`desk-tab-${shelf.value}`)?.focus());
};

onMounted(() => {
  hydrateTrail();
  hydrateStars();
  hydrateExcerpts();
});

onBeforeUnmount(() => {
  window.clearTimeout(copyTimer);
  window.clearTimeout(exportTimer);
});
</script>

<template>
  <section class="desk">
    <header class="desk__head">
      <span class="desk__lamp" aria-hidden="true">
        <i class="desk__lamp-glow"></i>
        <b>✎</b>
      </span>
      <h1>我的书桌</h1>

      <dl class="desk__stats">
        <div>
          <dt>翻过</dt>
          <dd>{{ totalRead }}<small>篇</small></dd>
        </div>
        <div>
          <dt>收着</dt>
          <dd>{{ totalStars }}<small>颗星</small></dd>
        </div>
        <div>
          <dt>夹下</dt>
          <dd>{{ totalExcerpts }}<small>句话</small></dd>
        </div>
      </dl>
    </header>

    <div class="desk__tabs" role="tablist" aria-label="书桌抽屉" @keydown="onTabKeydown">
      <button
        id="desk-tab-trail"
        type="button"
        role="tab"
        :aria-selected="shelf === 'trail'"
        aria-controls="desk-panel"
        :tabindex="shelf === 'trail' ? 0 : -1"
        :class="{ 'is-active': shelf === 'trail' }"
        @click="shelf = 'trail'"
      >
        <span aria-hidden="true">🕯️</span> 阅读足迹
        <small>{{ totalRead }}</small>
      </button>
      <button
        id="desk-tab-stars"
        type="button"
        role="tab"
        :aria-selected="shelf === 'stars'"
        aria-controls="desk-panel"
        :tabindex="shelf === 'stars' ? 0 : -1"
        :class="{ 'is-active': shelf === 'stars' }"
        @click="shelf = 'stars'"
      >
        <span aria-hidden="true">🫙</span> 星愿瓶
        <small>{{ totalStars }}</small>
      </button>
      <button
        id="desk-tab-excerpts"
        type="button"
        role="tab"
        :aria-selected="shelf === 'excerpts'"
        aria-controls="desk-panel"
        :tabindex="shelf === 'excerpts' ? 0 : -1"
        :class="{ 'is-active': shelf === 'excerpts' }"
        @click="shelf = 'excerpts'"
      >
        <span aria-hidden="true">📎</span> 摘抄本
        <small>{{ totalExcerpts }}</small>
      </button>
    </div>

    <div id="desk-panel" class="desk__panel" role="tabpanel" :aria-labelledby="`desk-tab-${shelf}`">
      <div class="desk__panel-head">
        <p class="desk__hint">{{ hintFor }}</p>
        <div class="desk__panel-tools">
          <button v-if="shelf === 'excerpts' && excerpts.length" type="button" class="desk__tool" @click="exportExcerpts">
            {{ exported ? '已经装好啦 ✨' : '导出为 Markdown ↓' }}
          </button>
          <button v-if="!isEmpty" type="button" class="desk__tool desk__tool--danger" @click="clearCurrent">
            清空
          </button>
        </div>
      </div>

      <p v-if="!hydrated" class="desk__loading">正在点亮书桌…</p>

      <template v-else-if="shelf === 'trail'">
        <p v-if="isEmpty" class="desk__empty">
          <span aria-hidden="true">☾</span>
          书桌还空着。随便翻开一篇文章，读过几段，它就会替你记住。
          <NuxtLink to="/archive">去挑一篇 →</NuxtLink>
        </p>
        <template v-else>
          <ReadingConstellation :items="trail" class="desk__constellation" />

          <section v-if="reading.length" class="desk__group" aria-labelledby="desk-reading-title">
            <h2 id="desk-reading-title" class="desk__group-title">接着读</h2>
            <ul class="desk__list">
              <li v-for="item in reading" :key="item.slug" class="desk__row">
                <NuxtLink :to="`/article/${encodeURIComponent(item.slug)}`" class="desk__row-link">
                  <span class="desk__row-emoji" aria-hidden="true">{{ item.emoji || '📖' }}</span>
                  <span class="desk__row-body">
                    <strong>{{ item.title }}</strong>
                    <small>
                      {{ item.headingText ? `停在「${item.headingText}」` : item.category || '随笔' }}
                      · {{ timeLabel(item.at) }}
                    </small>
                    <span class="desk__track" aria-hidden="true">
                      <span :style="{ width: `${percentOf(item.progress)}%` }"></span>
                    </span>
                    <em>{{ percentOf(item.progress) }}%</em>
                  </span>
                </NuxtLink>
                <button type="button" class="desk__remove" :aria-label="`从阅读足迹移除《${item.title}》`" @click="removeCurrent(item.slug)">×</button>
              </li>
            </ul>
          </section>

          <section v-if="finished.length" class="desk__group" aria-labelledby="desk-finished-title">
            <h2 id="desk-finished-title" class="desk__group-title">读完的</h2>
            <ul class="desk__list">
              <li v-for="item in finished" :key="item.slug" class="desk__row">
                <NuxtLink :to="`/article/${encodeURIComponent(item.slug)}`" class="desk__row-link">
                  <span class="desk__row-emoji" aria-hidden="true">{{ item.emoji || '🌟' }}</span>
                  <span class="desk__row-body">
                    <strong>{{ item.title }}</strong>
                    <small>{{ item.category || '随笔' }} · {{ timeLabel(item.at) }}</small>
                  </span>
                  <span class="desk__done" aria-hidden="true">✓</span>
                </NuxtLink>
                <button type="button" class="desk__remove" :aria-label="`从阅读足迹移除《${item.title}》`" @click="removeCurrent(item.slug)">×</button>
              </li>
            </ul>
          </section>
        </template>
      </template>

      <template v-else-if="shelf === 'stars'">
        <p v-if="isEmpty" class="desk__empty">
          <span aria-hidden="true">🫙</span>
          星愿瓶还是空的。在文章标题旁点一下星星，它就住进来了。
          <NuxtLink to="/explore">去星图看看 →</NuxtLink>
        </p>
        <ul v-else class="desk__list">
          <li v-for="star in stars" :key="star.slug" class="desk__row">
            <NuxtLink :to="`/article/${encodeURIComponent(star.slug)}`" class="desk__row-link">
              <span class="desk__row-emoji" aria-hidden="true">{{ star.emoji }}</span>
              <span class="desk__row-body">
                <strong>{{ star.title }}</strong>
                <small>{{ star.category || '随笔' }} · {{ timeLabel(star.savedAt) }}收进</small>
              </span>
              <span v-if="excerptBySlug.get(star.slug)" class="desk__badge">夹了 {{ excerptBySlug.get(star.slug) }} 句</span>
            </NuxtLink>
            <button type="button" class="desk__remove" :aria-label="`从星愿瓶移除《${star.title}》`" @click="removeCurrent(star.slug)">×</button>
          </li>
        </ul>
      </template>

      <template v-else>
        <p v-if="isEmpty" class="desk__empty">
          <span aria-hidden="true">❝</span>
          还没有夹下任何句子。读到喜欢的那一句时，选中它就好。
          <NuxtLink to="/archive">翻一篇文章 →</NuxtLink>
        </p>
        <ul v-else class="desk__list">
          <li v-for="item in excerpts" :key="item.id" class="desk__row desk__row--quote">
            <div class="desk__quote-body">
              <blockquote>{{ item.text }}</blockquote>
              <small>
                <NuxtLink :to="trayItems.find((entry) => entry.id === item.id)?.to || `/article/${item.slug}`">
                  {{ item.title }}<template v-if="item.headingText"> · {{ item.headingText }}</template>
                </NuxtLink>
                <span> · {{ timeLabel(item.at) }}</span>
              </small>
            </div>
            <div class="desk__quote-actions">
              <button type="button" @click="copyExcerpt(item.id)">
                {{ copiedId === item.id ? '复制好了 ✨' : '复制' }}
              </button>
              <button type="button" class="desk__remove" :aria-label="`删除这句摘抄：${item.text.slice(0, 16)}`" @click="removeExcerpt(item.id)">×</button>
            </div>
          </li>
        </ul>
      </template>
    </div>

    <footer class="desk__foot">
      <p>记录只保存在这台设备上；清缓存前记得导出喜欢的句子。</p>
    </footer>
  </section>
</template>

<style scoped>
.desk { max-width: 880px; margin: 0 auto; padding: 2rem 0 6rem; }

/* 台灯：一束向下散开的光，把"书桌"这个比喻先立起来。
   灯罩完整留在卡片内（顶部留出空间），光晕再往下铺。 */
.desk__head { position: relative; overflow: hidden; padding: clamp(1.5rem, 4vw, 2.6rem); border: 1px solid var(--bs-border); border-radius: 2rem; background: var(--bs-paper-strong); box-shadow: var(--bs-shadow); }
.desk__lamp { position: absolute; top: 1.1rem; right: clamp(.9rem, 5vw, 3rem); display: grid; place-items: center; width: 3.6rem; height: 3.6rem; border: 2px solid var(--bs-ink-line); border-radius: 50% 50% 46% 54%; background: linear-gradient(150deg, var(--bs-yellow), var(--bs-peach)); box-shadow: var(--bs-sticker-shadow); transform: rotate(-8deg); }
.desk__lamp b { color: var(--bs-ink-on-accent); font-size: 1.5rem; line-height: 1; }
.desk__lamp-glow { position: absolute; top: 2.9rem; left: 50%; width: 15rem; height: 12rem; background: radial-gradient(ellipse at top, rgba(255, 228, 138, .42), transparent 68%); transform: translateX(-50%); pointer-events: none; animation: desk-lamp-breathe 6s var(--bs-ease-breathe) infinite; }
@keyframes desk-lamp-breathe { 0%, 100% { opacity: .75; } 50% { opacity: 1; } }

.desk h1 { margin: .75rem 0 0; color: var(--bs-ink); font-size: clamp(1.6rem, 3.2vw, 2.25rem); line-height: 1.2; }

.desk__stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .6rem; margin: 1.4rem 0 0; }
.desk__stats > div { padding: .7rem .8rem; border: 1px solid var(--bs-hairline); border-radius: 1.1rem; background: var(--bs-surface); }
.desk__stats dt { color: var(--bs-ink-muted); font-size: .74rem; }
.desk__stats dd { margin: .1rem 0 0; color: var(--bs-ink); font-size: 1.5rem; font-weight: 700; }
.desk__stats small { margin-left: .2rem; color: var(--bs-ink-soft); font-size: .72rem; font-weight: 500; }

/* 三个抽屉：像真正的书桌抽屉一样，选中的那只被拉开一点。 */
.desk__tabs { display: flex; flex-wrap: wrap; gap: .4rem; margin: 1.2rem 0 0; }
.desk__tabs button { display: inline-flex; align-items: center; gap: .35rem; min-height: 2.9rem; padding: .5rem .9rem; border: 1px solid var(--bs-border); border-bottom-width: 0; border-radius: .9rem .9rem 0 0; background: var(--bs-surface-soft); color: var(--bs-ink-soft); font-family: inherit; font-size: .86rem; white-space: nowrap; cursor: pointer; transition: transform var(--bs-dur-quick) var(--bs-ease-pop), background var(--bs-dur-quick) ease, color var(--bs-dur-quick) ease; }
.desk__tabs button small { padding: .02rem .34rem; border-radius: 999px; background: rgba(185, 167, 255, .2); color: var(--bs-ink-soft); font-size: .68rem; }
.desk__tabs button:hover { color: var(--bs-ink); transform: translateY(-2px); }
.desk__tabs button.is-active { background: var(--bs-paper-strong); color: var(--bs-ink); border-color: var(--bs-border-accent); transform: translateY(-3px); box-shadow: 0 -6px 16px rgba(95, 66, 118, .1); }
.desk__tabs button.is-active small { background: var(--bs-tint-pink); color: var(--bs-accent-ink); }
.desk__tabs button:focus-visible { outline: 3px solid rgba(185, 167, 255, .7); outline-offset: 2px; }

.desk__panel { padding: 1.1rem 1.15rem 1.2rem; border: 1px solid var(--bs-border-accent); border-radius: 0 1.2rem 1.2rem 1.2rem; background: var(--bs-paper-strong); box-shadow: var(--bs-shadow-soft); }
.desk__panel-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .5rem .9rem; margin-bottom: .8rem; }
.desk__hint { margin: 0; color: var(--bs-ink-muted); font-size: .78rem; }
.desk__panel-tools { display: flex; gap: .35rem; }
.desk__tool { min-height: 2.5rem; padding: .3rem .7rem; border: 1px solid var(--bs-border); border-radius: 999px; background: var(--bs-surface); color: var(--bs-ink-soft); font-family: inherit; font-size: .75rem; cursor: pointer; transition: var(--bs-dur-quick) ease; }
.desk__tool:hover { border-color: var(--bs-border-accent); color: var(--bs-ink); transform: translateY(-1px); }
.desk__tool--danger:hover { border-color: rgba(255, 143, 179, .7); color: var(--bs-accent-strong); }
.desk__tool:focus-visible { outline: 3px solid rgba(185, 167, 255, .6); outline-offset: 2px; }

.desk__loading, .desk__empty { margin: 0; padding: 1.6rem .4rem; color: var(--bs-ink-soft); font-size: .88rem; line-height: 1.9; text-align: center; }
.desk__empty span { display: block; margin-bottom: .3rem; font-size: 1.8rem; opacity: .8; }
.desk__empty a { display: inline-block; margin-top: .5rem; color: var(--bs-link); text-decoration: none; }
.desk__empty a:hover { color: var(--bs-accent-strong); text-decoration: underline; }

.desk__group + .desk__group { margin-top: 1.4rem; }
.desk__constellation { margin-bottom: 1.4rem; }
.desk__group-title { margin: 0 0 .55rem; color: var(--bs-ink); font-size: .95rem; letter-spacing: .04em; }
.desk__list { display: grid; gap: .45rem; margin: 0; padding: 0; list-style: none; }

/* 每一行都像贴在桌上的便条，左边一条彩色书脊。 */
.desk__row { display: flex; align-items: stretch; gap: .2rem; border: 1px solid var(--bs-hairline); border-left: 3px solid var(--bs-mint); border-radius: .3rem .9rem .9rem .3rem; background: var(--bs-surface); transition: transform var(--bs-dur-quick) var(--bs-ease-pop), background var(--bs-dur-quick) ease; }
.desk__row:hover { background: var(--bs-surface-strong); transform: translateX(2px); }
.desk__row-link { display: flex; flex: 1; align-items: center; gap: .6rem; min-width: 0; padding: .6rem .7rem; color: inherit; text-decoration: none; }
.desk__row-emoji { flex: 0 0 auto; font-size: 1.15rem; }
.desk__row-body { display: grid; min-width: 0; flex: 1; gap: .1rem; }
.desk__row-body strong { overflow: hidden; color: var(--bs-ink); font-size: .9rem; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.desk__row-body small { overflow: hidden; color: var(--bs-ink-muted); font-size: .74rem; text-overflow: ellipsis; white-space: nowrap; }
.desk__row-body em { color: var(--bs-accent-ink); font-size: .7rem; font-style: normal; }
.desk__track { display: block; width: 100%; height: .22rem; margin-top: .2rem; overflow: hidden; border-radius: 999px; background: rgba(57, 45, 79, .12); }
.desk__track span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--bs-lilac), var(--bs-pink), var(--bs-yellow)); }
.desk__done { flex: 0 0 auto; color: var(--bs-mint); font-size: 1rem; }
.desk__badge { flex: 0 0 auto; padding: .1rem .4rem; border-radius: 999px; background: var(--bs-tint-yellow); color: var(--bs-accent-ink); font-size: .66rem; }

.desk__row--quote { border-left-color: var(--bs-lilac); }
.desk__quote-body { display: grid; flex: 1; gap: .25rem; min-width: 0; padding: .7rem .8rem; }
.desk__quote-body blockquote { margin: 0; color: var(--bs-ink-body); font-size: .86rem; line-height: 1.8; }
.desk__quote-body blockquote::before { color: var(--bs-accent-ink); content: '「'; }
.desk__quote-body blockquote::after { color: var(--bs-accent-ink); content: '」'; }
.desk__quote-body small { overflow: hidden; color: var(--bs-ink-muted); font-size: .72rem; text-overflow: ellipsis; white-space: nowrap; }
.desk__quote-body a { color: var(--bs-link); text-decoration: none; }
.desk__quote-body a:hover { color: var(--bs-accent-strong); text-decoration: underline; }
.desk__quote-actions { display: flex; flex: 0 0 auto; align-items: center; gap: .1rem; padding-right: .35rem; }
.desk__quote-actions button { min-height: 2.5rem; padding: .25rem .55rem; border: 0; border-radius: 999px; background: transparent; color: var(--bs-ink-soft); font-family: inherit; font-size: .72rem; cursor: pointer; transition: var(--bs-dur-quick) ease; }
.desk__quote-actions button:hover { background: var(--bs-surface-soft); color: var(--bs-ink); }

.desk__remove { flex: 0 0 auto; width: 2.2rem; align-self: center; margin-right: .25rem; padding: 0; border: 0; border-radius: 50%; background: transparent; color: var(--bs-ink-faint); font-size: 1rem; line-height: 1; cursor: pointer; opacity: 0; transition: var(--bs-dur-quick) ease; }
.desk__row:hover .desk__remove, .desk__remove:focus-visible { opacity: 1; }
.desk__remove:hover { background: var(--bs-tint-pink); color: var(--bs-accent-strong); transform: rotate(90deg); }
.desk__quote-actions .desk__remove { opacity: 1; }

.desk__foot { margin-top: 1.1rem; }
.desk__foot p { margin: 0; padding: .7rem .9rem; border: 1px dashed var(--bs-hairline); border-radius: .9rem; color: var(--bs-ink-muted); font-size: .75rem; line-height: 1.7; }

@media (max-width: 640px) {
  /* 小屏上标题会顶到右侧台灯，把灯收小并让开文字区。 */
  .desk__lamp { width: 2.8rem; height: 2.8rem; top: .7rem; right: .8rem; }
  .desk__lamp b { font-size: 1.15rem; }
  .desk__stats { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .4rem; }
  .desk__stats dd { font-size: 1.25rem; }
  .desk__tabs { gap: .25rem; }
  .desk__tabs button { flex: 1; justify-content: center; gap: .25rem; padding-inline: .3rem; font-size: .76rem; }
  .desk__tabs button small { padding: .01rem .26rem; font-size: .62rem; }
  .desk__panel { border-radius: 0 1rem 1rem 1rem; padding: .9rem .8rem 1rem; }
  .desk__row-body strong { white-space: normal; }
  .desk__remove { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .desk__lamp-glow { animation: none; }
  .desk__row, .desk__tabs button { transition: none; }
}
html.bs-reduced-motion .desk__lamp-glow { animation: none; }
</style>
