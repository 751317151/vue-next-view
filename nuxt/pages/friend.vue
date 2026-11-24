<script setup lang="ts">
import { siteConfig } from '../../src/config/site';

usePageSeo({
  path: '/friend',
  title: `友人帐 | ${siteConfig.name}`,
  description: '记录那些值得一起探索的站点和朋友，以及一面可以带走的友链名片。',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `友人帐 | ${siteConfig.name}`,
    description: '独立写作者与一起发光的小站。',
    inLanguage: siteConfig.locale,
  },
});

const FRIENDS = [
  {
    name: 'Vue.js 官方',
    url: 'https://vuejs.org',
    desc: '本站的骨架，一起把界面写得更优雅。',
    mark: 'V',
    tone: 'pink',
    since: '一路同行',
  },
  {
    name: 'TypeScript',
    url: 'https://www.typescriptlang.org',
    desc: '让重构变得有底气的语言。',
    mark: 'T',
    tone: 'mint',
    since: '一路同行',
  },
  {
    name: 'MDN Web Docs',
    url: 'https://developer.mozilla.org',
    desc: '每晚都会去翻的文档手册。',
    mark: 'M',
    tone: 'lilac',
    since: '常翻常新',
  },
  {
    name: 'Nuxt',
    url: 'https://nuxt.com',
    desc: 'SSR、SEO 和幸福感的来源。',
    mark: 'N',
    tone: 'yellow',
    since: '一起长大',
  },
];

const RULES = [
  { emoji: '🌱', text: '站点能正常打开，内容以原创为主' },
  { emoji: '💌', text: '互相加好友链后，留言或邮件告诉我' },
  { emoji: '🚫', text: '不收纯采集站、广告站和长期停更的站' },
];

const runtimeConfig = useRuntimeConfig();
const requestUrl = useRequestURL();
const siteOrigin = computed(() => String(runtimeConfig.public.siteUrl || requestUrl.origin).replace(/\/$/, ''));

const friendCard = computed(() => [
  `名称：${siteConfig.name}`,
  `链接：${siteOrigin.value}/`,
  '一句介绍：把技术、生活和灵感，写成会发光的小故事。',
  '头像：/luffy.jpg',
].join('\n'));

const copied = ref(false);
let copiedTimer = 0;

const copyFriendCard = async () => {
  try {
    await navigator.clipboard.writeText(friendCard.value);
  } catch {
    const area = document.createElement('textarea');
    area.value = friendCard.value;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
  copied.value = true;
  window.clearTimeout(copiedTimer);
  copiedTimer = window.setTimeout(() => { copied.value = false; }, 2200);
};

onBeforeUnmount(() => window.clearTimeout(copiedTimer));

/** 轻轻翻页：点哪一页，哪一页就当当前页；纯视觉的小动作，不影响链接。 */
const activeIndex = ref(0);
const pageNo = (index: number) => String(index + 1).padStart(2, '0');
</script>

<template>
  <MigrationPage title="友人帐" description="把一起发光的人和站点，一页一页记下来。">
    <div class="friends">
      <div class="friends__book">
        <span class="friends__spine" aria-hidden="true"></span>

        <header class="friends__book-head">
          <p class="friends__book-title">名字簿 · 第 {{ pageNo(activeIndex) }} 页</p>
          <p class="friends__book-count">{{ FRIENDS.length }} 位一起发光的人</p>
        </header>

        <TransitionGroup name="friend-page" tag="ul" class="friends__entries">
          <li
            v-for="(friend, index) in FRIENDS"
            :key="friend.name"
            class="friend-slip"
            :class="[`friend-slip--${friend.tone}`, { 'is-active': activeIndex === index }]"
            :style="{ '--slip-rotate': `${((index % 3) - 1) * 0.35}deg`, '--slip-index': index }"
            @pointerenter="activeIndex = index"
            @focusin="activeIndex = index"
          >
            <a :href="friend.url" target="_blank" rel="noopener" class="friend-slip__link">
              <span class="friend-slip__seal" aria-hidden="true">{{ friend.mark }}</span>
              <span class="friend-slip__body">
                <span class="friend-slip__top">
                  <strong>{{ friend.name }}</strong>
                  <em>{{ pageNo(index) }}</em>
                </span>
                <span class="friend-slip__desc">{{ friend.desc }}</span>
                <span class="friend-slip__meta">
                  <span class="friend-slip__host">{{ friend.url.replace('https://', '') }}</span>
                  <span class="friend-slip__since">{{ friend.since }}</span>
                </span>
              </span>
              <span class="friend-slip__arrow" aria-hidden="true">↗</span>
            </a>
          </li>
        </TransitionGroup>

        <p class="friends__book-foot">—— 下一页，留给还没遇见的你 ✦</p>
      </div>

      <section class="friends__apply" aria-labelledby="friends-apply-title">
        <header class="friends__apply-head">
          <span class="friends__apply-mark" aria-hidden="true">💌</span>
          <div>
            <h2 id="friends-apply-title">想在这里添一页？</h2>
            <p>把下面这张小名片带走，换你的那一页。</p>
          </div>
        </header>

        <ul class="friends__rules">
          <li v-for="rule in RULES" :key="rule.text">
            <span aria-hidden="true">{{ rule.emoji }}</span>{{ rule.text }}
          </li>
        </ul>

        <div class="friends__card">
          <span class="friends__card-tape" aria-hidden="true"></span>
          <p class="friends__card-name">🌙 {{ siteConfig.name }}</p>
          <p class="friends__card-desc">把技术、生活和灵感，写成会发光的小故事。</p>
          <code>{{ siteOrigin }}/</code>
        </div>

        <div class="friends__actions">
          <button type="button" class="friends__copy" @click="copyFriendCard">
            {{ copied ? '名片收好啦 ✦' : '复制我的友链名片 ↗' }}
          </button>
          <a class="friends__mail" href="mailto:751317151@qq.com">写信给我 ✉</a>
        </div>
      </section>
    </div>
  </MigrationPage>
</template>

<style scoped>
.friends { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(17rem, .9fr); gap: 1.2rem; align-items: start; }

/* ---------------- 友人帐：一本摊开的簿子 ---------------- */
.friends__book {
  position: relative;
  padding: 1.15rem 1.15rem 1rem 2rem;
  border: 1px solid var(--bs-border);
  border-radius: .45rem 1.35rem 1.35rem .45rem;
  background:
    linear-gradient(90deg, rgba(255, 189, 138, .16) 0 1.55rem, transparent 1.55rem),
    repeating-linear-gradient(180deg, transparent 0 2.35rem, rgba(185, 167, 255, .16) 2.35rem 2.4rem),
    var(--bs-paper-strong);
  box-shadow: var(--bs-shadow);
}
.friends__spine { position: absolute; top: .55rem; bottom: .55rem; left: .55rem; width: .5rem; border-radius: 999px; background: linear-gradient(180deg, var(--bs-pink), var(--bs-lilac), var(--bs-mint)); box-shadow: inset 0 0 0 1px rgba(255, 250, 245, .35); }

.friends__book-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: .3rem .8rem; padding-bottom: .6rem; border-bottom: 1px dashed var(--bs-border-accent); }
.friends__book-title { margin: 0; color: var(--bs-ink); font-size: .8rem; letter-spacing: .1em; }
.friends__book-count { margin: 0; color: var(--bs-ink-muted); font-size: .72rem; }

.friends__entries { display: grid; gap: .5rem; margin: .8rem 0 0; padding: 0; list-style: none; }

.friend-slip { position: relative; transform: rotate(var(--slip-rotate)); transition: transform var(--bs-dur-base) var(--bs-ease-pop), box-shadow var(--bs-dur-base) ease; }
.friend-slip.is-active { z-index: 1; transform: rotate(0) translateX(2px); }
.friend-slip__link { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: .7rem; align-items: center; padding: .62rem .7rem; border: 1px solid transparent; border-left: 3px solid var(--slip-accent); border-radius: .25rem .8rem .8rem .25rem; background: var(--bs-surface); color: var(--bs-ink-body); text-decoration: none; transition: background var(--bs-dur-quick) ease, box-shadow var(--bs-dur-quick) ease, border-color var(--bs-dur-quick) ease; }
.friend-slip.is-active .friend-slip__link { border-color: var(--bs-border-accent); background: var(--bs-surface-strong); box-shadow: var(--bs-shadow-soft); }
.friend-slip__link:focus-visible { outline: 3px solid rgba(185, 167, 255, .72); outline-offset: 2px; }

.friend-slip--pink { --slip-accent: var(--bs-pink); --seal-ink: #8f4f67; }
.friend-slip--mint { --slip-accent: var(--bs-mint); --seal-ink: #3f6b60; }
.friend-slip--lilac { --slip-accent: var(--bs-lilac); --seal-ink: #5f508f; }
.friend-slip--yellow { --slip-accent: var(--bs-yellow); --seal-ink: #7f6320; }

.friend-slip__seal { display: grid; place-items: center; width: 2.05rem; height: 2.05rem; border: 1.5px solid var(--slip-accent); border-radius: 46% 54% 50% 46%; background: var(--bs-paper-strong); color: var(--seal-ink); font-size: .9rem; font-weight: 700; box-shadow: 1.5px 1.5px 0 var(--bs-ink-line); transform: rotate(-4deg); transition: transform var(--bs-dur-quick) var(--bs-ease-pop); }
.friend-slip.is-active .friend-slip__seal { transform: rotate(4deg) scale(1.06); }

.friend-slip__body { display: grid; gap: .1rem; min-width: 0; }
.friend-slip__top { display: flex; align-items: baseline; gap: .45rem; }
.friend-slip__top strong { overflow: hidden; color: var(--bs-ink); font-size: .9rem; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.friend-slip__top em { margin-left: auto; color: var(--bs-ink-faint); font-size: .62rem; font-style: normal; letter-spacing: .08em; }
.friend-slip__desc { overflow: hidden; color: var(--bs-ink-soft); font-size: .77rem; line-height: 1.55; text-overflow: ellipsis; white-space: nowrap; }
.friend-slip__meta { display: flex; flex-wrap: wrap; gap: .3rem .55rem; margin-top: .08rem; color: var(--bs-ink-muted); font-size: .66rem; }
.friend-slip__host { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.friend-slip__since { padding: .02rem .4rem; border-radius: 999px; background: var(--bs-tint-yellow); color: var(--bs-accent-ink); }
.friend-slip__arrow { color: var(--bs-ink-faint); font-size: .8rem; transition: transform var(--bs-dur-quick) ease, color var(--bs-dur-quick) ease; }
.friend-slip.is-active .friend-slip__arrow { color: var(--bs-accent-ink); transform: translate(2px, -2px); }

.friends__book-foot { margin: .8rem 0 0; color: var(--bs-ink-subtle); font-size: .7rem; text-align: right; }

/* ---------------- 交换名片：一张夹在信里的小卡 ---------------- */
.friends__apply { display: grid; gap: .85rem; padding: 1.15rem 1.2rem 1.2rem; border: 1px solid var(--bs-border); border-radius: 1.3rem; background: radial-gradient(circle at 92% 4%, rgba(255, 228, 138, .22), transparent 34%), var(--bs-surface); }
:root.bs-dark .friends__apply { background: radial-gradient(circle at 92% 4%, rgba(255, 233, 160, .07), transparent 34%), var(--bs-surface); }
.friends__apply-head { display: flex; gap: .65rem; align-items: flex-start; }
.friends__apply-mark { display: grid; place-items: center; flex: 0 0 auto; width: 2rem; height: 2rem; border: 1px dashed var(--bs-border-accent); border-radius: 50%; background: var(--bs-paper-strong); font-size: .95rem; }
.friends__apply h2 { margin: 0; color: var(--bs-ink); font-size: 1rem; }
.friends__apply-head p { margin: .15rem 0 0; color: var(--bs-ink-soft); font-size: .78rem; line-height: 1.6; }

.friends__rules { display: grid; gap: .35rem; margin: 0; padding: 0; list-style: none; }
.friends__rules li { display: flex; gap: .4rem; color: var(--bs-ink-soft); font-size: .78rem; line-height: 1.7; }
.friends__rules span { flex: 0 0 auto; font-size: .8rem; }

.friends__card { position: relative; display: grid; gap: .18rem; margin-top: .15rem; padding: .85rem .9rem .8rem; border: 1px dashed var(--bs-border-accent); border-radius: .35rem .85rem .85rem .35rem; background: var(--bs-paper-strong); box-shadow: var(--bs-shadow-soft); transform: rotate(-.6deg); transition: transform var(--bs-dur-base) var(--bs-ease-pop); }
.friends__card:hover { transform: rotate(0) translateY(-2px); }
.friends__card-tape { position: absolute; top: -.45rem; left: 1.1rem; width: 3.4rem; height: .85rem; background: rgba(255, 228, 138, .68); transform: rotate(-2deg); clip-path: polygon(3% 10%, 97% 0, 100% 88%, 2% 100%); }
.friends__card-name { margin: 0; color: var(--bs-ink); font-size: .86rem; font-weight: 700; }
.friends__card-desc { margin: 0; color: var(--bs-ink-soft); font-size: .74rem; line-height: 1.6; }
.friends__card code { margin-top: .2rem; overflow: hidden; color: var(--bs-accent-ink); font-family: var(--bs-font-hand); font-size: .72rem; text-overflow: ellipsis; white-space: nowrap; }

.friends__actions { display: flex; flex-wrap: wrap; gap: .45rem; }
.friends__copy, .friends__mail { display: inline-flex; align-items: center; justify-content: center; min-height: 2.45rem; padding: .35rem .8rem; border-radius: 999px; font-family: inherit; font-size: .76rem; text-decoration: none; cursor: pointer; transition: transform var(--bs-dur-quick) var(--bs-ease-pop), background var(--bs-dur-quick) ease; }
.friends__copy { border: 1.5px solid var(--bs-ink-line); background: var(--bs-yellow); color: var(--bs-ink-on-accent); font-weight: 700; box-shadow: 2px 2px 0 var(--bs-ink-line); }
.friends__copy:hover { transform: translate(-1px, -2px); box-shadow: 4px 4px 0 var(--bs-ink-line); }
.friends__mail { border: 1px dashed var(--bs-border-accent); color: var(--bs-ink-soft); }
.friends__mail:hover { background: var(--bs-tint-pink); color: var(--bs-ink); transform: translateY(-2px); }
.friends__copy:focus-visible, .friends__mail:focus-visible { outline: 3px solid rgba(185, 167, 255, .72); outline-offset: 2px; }

.friend-page-enter-active, .friend-page-leave-active { transition: opacity var(--bs-dur-mid) ease, transform var(--bs-dur-mid) var(--bs-ease-pop); }
.friend-page-enter-from { opacity: 0; transform: translateX(-8px) rotate(-1deg); }
.friend-page-leave-to { opacity: 0; transform: translateX(8px) rotate(1deg); }

@media (max-width: 820px) {
  .friends { grid-template-columns: 1fr; }
}
@media (max-width: 560px) {
  .friends__book { padding: .95rem .8rem .85rem 1.6rem; }
  .friend-slip__desc { white-space: normal; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  .friends__actions { display: grid; }
}

@media (prefers-reduced-motion: reduce) {
  .friend-slip, .friend-slip__seal, .friend-slip__arrow, .friends__card, .friends__copy, .friends__mail, .friend-page-enter-active, .friend-page-leave-active { transition: none; }
  .friend-slip.is-active { transform: none; }
  .friends__card:hover { transform: none; }
}
html.bs-reduced-motion .friend-slip,
html.bs-reduced-motion .friend-slip__seal,
html.bs-reduced-motion .friend-slip__arrow,
html.bs-reduced-motion .friends__card,
html.bs-reduced-motion .friends__copy,
html.bs-reduced-motion .friends__mail { transition: none; }
html.bs-reduced-motion .friend-slip.is-active,
html.bs-reduced-motion .friends__card:hover { transform: none; }
</style>
