<template>
  <aside class="excerpt-shelf" aria-label="摘抄本">
    <button
      ref="shelfButton"
      class="excerpt-shelf__book"
      :class="{ 'is-bump': bumping, 'has-items': items.length > 0 }"
      type="button"
      :aria-expanded="open"
      aria-controls="excerpt-shelf-panel"
      :aria-label="items.length ? `摘抄本里有 ${items.length} 句话，点击查看` : '摘抄本还是空的'"
      @click="toggleOpen"
    >
      <span class="excerpt-shelf__cover" aria-hidden="true">
        <i class="excerpt-shelf__ribbon"></i>
        <b>“</b>
      </span>
      <span v-if="items.length" class="excerpt-shelf__count">{{ items.length }}</span>
    </button>

    <Transition name="shelf-panel">
      <section v-if="open" id="excerpt-shelf-panel" class="excerpt-shelf__panel">
        <header class="excerpt-shelf__head">
          <div>
            <strong>摘抄本</strong>
            <small>{{ items.length ? `夹着 ${items.length} 句喜欢的话` : '在文章里划一句，就夹进来' }}</small>
          </div>
          <button class="excerpt-shelf__close" type="button" aria-label="收起摘抄本" @click="open = false">×</button>
        </header>

        <p v-if="!items.length" class="excerpt-shelf__empty">
          读到喜欢的句子时，用鼠标选中它，会浮出一枚「夹进摘抄本 ✦」。<br />
          以后想找回来，就掀开这页。✧
        </p>

        <ul v-else class="excerpt-shelf__list">
          <li v-for="item in items" :key="item.id" class="excerpt-shelf__item">
            <blockquote class="excerpt-shelf__quote">{{ item.text }}</blockquote>
            <div class="excerpt-shelf__meta">
              <NuxtLink
                class="excerpt-shelf__source"
                :to="sourceLink(item)"
                @click="rememberJumpTarget(item); open = false"
              >
                <span aria-hidden="true">❝</span>
                {{ item.title }}
                <template v-if="item.headingText"> · {{ item.headingText }}</template>
              </NuxtLink>
              <div class="excerpt-shelf__actions">
                <button type="button" :aria-label="`复制这句摘抄：${item.text.slice(0, 20)}`" @click="copy(item)">
                  {{ copiedId === item.id ? '复制好了 ✨' : '复制' }}
                </button>
                <button type="button" :aria-label="`删除这句摘抄：${item.text.slice(0, 20)}`" @click="remove(item.id)">删除</button>
              </div>
            </div>
          </li>
        </ul>

        <button v-if="items.length" class="excerpt-shelf__clear" type="button" @click="clear">
          合上这本（清空）
        </button>
      </section>
    </Transition>
  </aside>
</template>

<script setup lang="ts">
import { useExcerpts, type ExcerptItem } from '../composables/useExcerpts';
import { announceDockPanel, DOCK_PANEL_EVENT } from '../utils/dock-panels';

const { items, hydrate, remove, clear } = useExcerpts();
const open = ref(false);
const bumping = ref(false);
const copiedId = ref('');
const shelfButton = ref<HTMLButtonElement | null>(null);
let bumpTimer = 0;
let copyTimer = 0;

/** 回到原处：带 headingId 的锚点由文章页负责滚动，这里只负责导航。 */
const sourceLink = (item: ExcerptItem) => {
  if (!item.headingId) return `/article/${encodeURIComponent(item.slug)}`;
  return `/article/${encodeURIComponent(item.slug)}#${encodeURIComponent(item.headingId)}`;
};

/**
 * 点出处前把原句暂存到 sessionStorage：文章页据此在跳转后点亮那句话。
 * 不放进 URL，长句不会撑爆地址栏，也不会被分享出去。
 */
const rememberJumpTarget = (item: ExcerptItem) => {
  if (!item.headingId) return;
  try {
    window.sessionStorage.setItem('blackstar-excerpt-jump', item.text);
  } catch {
    // 隐私模式下跳过高亮即可。
  }
};

const copy = async (item: ExcerptItem) => {
  const value = `「${item.text}」\n—— ${item.title}${item.headingText ? ` · ${item.headingText}` : ''}`;
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
  copiedId.value = item.id;
  window.clearTimeout(copyTimer);
  copyTimer = window.setTimeout(() => { copiedId.value = ''; }, 1600);
};

/** 打开时告诉其它底部面板让位；别人打开时自己也收起。 */
const toggleOpen = () => {
  open.value = !open.value;
  if (open.value) announceDockPanel('excerpt-shelf');
};

const onOtherPanel = (event: Event) => {
  const detail = (event as CustomEvent<string>).detail;
  if (detail !== 'excerpt-shelf') open.value = false;
};

/** 夹进新句子时轻轻一跳：操作发生在正文区，反馈要落在本子上。 */
const onBump = () => {
  bumping.value = true;
  window.clearTimeout(bumpTimer);
  bumpTimer = window.setTimeout(() => { bumping.value = false; }, 520);
};

onMounted(() => {
  hydrate();
  window.addEventListener('excerpt-shelf:bump', onBump);
  window.addEventListener(DOCK_PANEL_EVENT, onOtherPanel);
});

onBeforeUnmount(() => {
  window.removeEventListener('excerpt-shelf:bump', onBump);
  window.removeEventListener(DOCK_PANEL_EVENT, onOtherPanel);
  window.clearTimeout(bumpTimer);
  window.clearTimeout(copyTimer);
});
</script>

<style scoped>
/* 左下角：星愿瓶在上面，本子叠在它上方；两者共用停靠 token。 */
.excerpt-shelf {
  position: fixed;
  left: var(--bs-dock-edge);
  bottom: calc(var(--bs-dock-edge) + 4.2rem + var(--bs-dock-gap));
  z-index: var(--bs-dock-z);
}

.excerpt-shelf__book {
  position: relative;
  display: grid;
  place-items: center;
  width: 2.7rem;
  height: 3rem;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  transform: rotate(4deg);
  transition: transform var(--bs-dur-base) var(--bs-ease-pop);
}
.excerpt-shelf__book:hover { transform: rotate(-3deg) translateY(-3px); }
.excerpt-shelf__book:focus-visible { outline: 3px solid rgba(185, 167, 255, 0.72); outline-offset: 4px; border-radius: .8rem; }
.excerpt-shelf__book.is-bump { animation: shelf-bump var(--bs-dur-mid) var(--bs-ease-pop); }

/* 一本立着的小书：书脊 + 封面 + 书签带，用纯 CSS 画出来。 */
.excerpt-shelf__cover {
  position: relative;
  display: grid;
  place-items: center;
  width: 2.2rem;
  height: 2.8rem;
  border: 2px solid var(--bs-ink-line, #392d4f);
  border-radius: .25rem .6rem .6rem .25rem;
  background: linear-gradient(135deg, var(--bs-mint), var(--bs-lilac));
  box-shadow: var(--bs-sticker-shadow, 3px 3px 0 var(--bs-ink-line, #392d4f));
}
.excerpt-shelf__cover::before {
  position: absolute;
  inset: 0 auto 0 .3rem;
  width: 2px;
  border-radius: 999px;
  background: rgba(57, 45, 79, .35);
  content: '';
}
.excerpt-shelf__cover b {
  margin-left: .3rem;
  color: var(--bs-ink-on-accent, #392d4f);
  font-family: Georgia, serif;
  font-size: 1.2rem;
  line-height: 1;
}
/* 书签带从头里垂下来一点，像夹着读到一半的那页。 */
.excerpt-shelf__ribbon {
  position: absolute;
  top: -.35rem;
  right: .35rem;
  width: .42rem;
  height: 1.15rem;
  background: var(--bs-pink);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 74%, 0 100%);
}

.excerpt-shelf__count {
  position: absolute;
  top: -.15rem;
  right: -.25rem;
  min-width: 1.1rem;
  height: 1.1rem;
  padding: 0 .25rem;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--bs-yellow), var(--bs-peach));
  color: #392d4f;
  font-size: .68rem;
  font-weight: 700;
  line-height: 1.1rem;
  text-align: center;
  box-shadow: 0 3px 8px rgba(255, 179, 143, .5);
}

.excerpt-shelf__panel {
  position: absolute;
  left: 0;
  bottom: calc(100% + .7rem);
  width: min(23rem, calc(100vw - 2rem));
  max-height: min(30rem, 70vh);
  overflow: auto;
  padding: 1rem 1.05rem 1.1rem;
  border: 1px solid var(--bs-border);
  border-radius: 1.3rem;
  background: var(--bs-paper-strong);
  box-shadow: var(--bs-shadow);
  backdrop-filter: blur(20px) saturate(1.1);
}

.excerpt-shelf__head { display: flex; align-items: flex-start; justify-content: space-between; gap: .6rem; margin-bottom: .8rem; }
.excerpt-shelf__head strong { display: block; color: var(--bs-ink); font-size: 1rem; }
.excerpt-shelf__head small { color: var(--bs-ink-muted); font-size: .76rem; }
.excerpt-shelf__close { flex: 0 0 auto; width: 1.8rem; height: 1.8rem; padding: 0; border: 0; border-radius: 50%; background: transparent; color: var(--bs-ink-soft); font-size: 1.1rem; line-height: 1; cursor: pointer; transition: var(--bs-dur-quick) ease; }
.excerpt-shelf__close:hover { background: var(--bs-tint-pink); color: var(--bs-ink); transform: rotate(90deg); }

.excerpt-shelf__empty { margin: 0; padding: .5rem .2rem .3rem; color: var(--bs-ink-soft); font-size: .84rem; line-height: 1.9; }

.excerpt-shelf__list { display: grid; gap: .65rem; margin: 0; padding: 0; list-style: none; }
.excerpt-shelf__item { padding: .7rem .8rem .6rem; border: 1px solid var(--bs-hairline); border-left: 3px solid var(--bs-mint); border-radius: .35rem .9rem .9rem .35rem; background: var(--bs-surface); }
.excerpt-shelf__quote { margin: 0; color: var(--bs-ink-body); font-size: .85rem; line-height: 1.8; }
.excerpt-shelf__quote::before { color: var(--bs-accent-ink); content: '「'; }
.excerpt-shelf__quote::after { color: var(--bs-accent-ink); content: '」'; }

.excerpt-shelf__meta { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .35rem .6rem; margin-top: .45rem; }
.excerpt-shelf__source { min-width: 0; flex: 1; overflow: hidden; color: var(--bs-link); font-size: .72rem; text-decoration: none; text-overflow: ellipsis; white-space: nowrap; }
.excerpt-shelf__source:hover { color: var(--bs-accent-strong); text-decoration: underline; }
.excerpt-shelf__actions { display: flex; flex: 0 0 auto; gap: .1rem; }
.excerpt-shelf__actions button { min-height: 2.4rem; padding: .25rem .55rem; border: 1px solid transparent; border-radius: 999px; background: transparent; color: var(--bs-ink-soft); font-family: inherit; font-size: .72rem; cursor: pointer; transition: var(--bs-dur-quick) ease; }
.excerpt-shelf__actions button:hover { border-color: var(--bs-hairline); background: var(--bs-surface-soft); color: var(--bs-ink); }
.excerpt-shelf__actions button:focus-visible { outline: 3px solid rgba(185, 167, 255, .6); outline-offset: 1px; }

.excerpt-shelf__clear { width: 100%; margin-top: .8rem; padding: .5rem; border: 1px dashed var(--bs-border); border-radius: .9rem; background: transparent; color: var(--bs-ink-muted); font-family: inherit; font-size: .78rem; cursor: pointer; transition: var(--bs-dur-quick) ease; }
.excerpt-shelf__clear:hover { border-color: var(--bs-accent-strong); color: var(--bs-accent-strong); }

.shelf-panel-enter-active { transition: opacity var(--bs-dur-base) ease, transform var(--bs-dur-base) var(--bs-ease-pop); }
.shelf-panel-leave-active { transition: opacity var(--bs-dur-quick) ease, transform var(--bs-dur-quick) ease; }
.shelf-panel-enter-from, .shelf-panel-leave-to { opacity: 0; transform: translateY(.6rem) scale(.96); }

@keyframes shelf-bump {
  0%, 100% { transform: rotate(4deg) translateY(0) scale(1); }
  45% { transform: rotate(-8deg) translateY(-.45rem) scale(1.1); }
}

@media (max-width: 640px) {
  .excerpt-shelf { bottom: calc(var(--bs-dock-edge) + 3.9rem + .5rem); }
  .excerpt-shelf__book { width: 2.4rem; height: 2.7rem; }
  .excerpt-shelf__cover { width: 2rem; height: 2.5rem; }
  /* 小屏上把面板提到按钮上方居中，别让长摘抄把半屏正文盖住。 */
  .excerpt-shelf__panel { left: -.9rem; max-height: min(24rem, 62vh); }
}
@media (prefers-reduced-motion: reduce) {
  .excerpt-shelf__book, .excerpt-shelf__book.is-bump { animation: none; }
  .shelf-panel-enter-active, .shelf-panel-leave-active { transition: none; }
}
html.bs-reduced-motion .excerpt-shelf__book { animation: none; }
html.bs-reduced-motion .shelf-panel-enter-active,
html.bs-reduced-motion .shelf-panel-leave-active { transition: none; }
</style>
