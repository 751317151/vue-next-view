<script setup lang="ts">
import type { PublicArticle, PublicTag } from '../types/public';

interface ShelfSibling {
  key: string | number;
  label: string;
  to: string;
  count: number;
}

const props = withDefaults(defineProps<{
  kind: 'category' | 'tag';
  title: string;
  description: string;
  articles: PublicArticle[];
  tags?: PublicTag[];
  siblings?: ShelfSibling[];
}>(), {
  tags: () => [],
  siblings: () => [],
});

const kindLabel = computed(() => props.kind === 'category' ? '分类书架' : '标签书架');
const kindEmoji = computed(() => props.kind === 'category' ? '📚' : '🏷️');
const totalMinutes = computed(() => props.articles.reduce(
  (sum, article) => sum + readingMinutes(article.articleContent),
  0,
));
const latest = computed(() => props.articles.reduce(
  (date, article) => article.createTime > date ? article.createTime : date,
  '',
));

/** 只展示当前这格书架里真实出现过的标签，避免侧边栏变成无关词云。 */
const usedTags = computed(() => {
  const names = new Set(props.articles.flatMap((article) => article.tags || []));
  return props.tags.filter((tag) => names.has(tag.tagName)).slice(0, 12);
});
</script>

<template>
  <div class="topic-shelf">
    <header class="topic-shelf__head">
      <span class="topic-shelf__stack" aria-hidden="true">
        <i></i><i></i><b>{{ kindEmoji }}</b>
      </span>
      <div class="topic-shelf__intro">
        <p class="topic-shelf__kicker">{{ kindLabel }}</p>
        <h2>这一格的书</h2>
        <p>{{ description }}</p>
      </div>
      <dl class="topic-shelf__facts">
        <div><dt>故事</dt><dd>{{ articles.length }}</dd></div>
        <div><dt>翻阅</dt><dd>{{ totalMinutes }}<small>分钟</small></dd></div>
        <div><dt>最近</dt><dd>{{ latest ? formatDate(latest) : '待更新' }}</dd></div>
      </dl>
    </header>

    <div v-if="articles.length" class="topic-shelf__layout">
      <section class="topic-shelf__books" aria-label="这一格书架里的文章">
        <ol>
          <li
            v-for="(article, index) in articles"
            :key="article.id"
            :style="{ '--book-tilt': `${((index % 3) - 1) * .18}deg` }"
          >
            <NuxtLink :to="`/article/${article.slug}`" class="topic-book">
              <span class="topic-book__art" :style="articleArt(article).style" aria-hidden="true">
                <b>{{ articleArt(article).emoji }}</b>
              </span>
              <span class="topic-book__copy">
                <span class="topic-book__top">
                  <span>{{ article.category || '随笔' }} · {{ formatDate(article.createTime) }}</span>
                  <em>No. {{ String(index + 1).padStart(2, '0') }}</em>
                </span>
                <strong>{{ article.articleTitle }}</strong>
                <span class="topic-book__summary">
                  {{ article.summary || excerptOf(article.articleContent, 92) }}
                </span>
                <small>约 {{ readingMinutes(article.articleContent) }} 分钟 <span aria-hidden="true">→</span></small>
              </span>
            </NuxtLink>
          </li>
        </ol>
        <p class="topic-shelf__breath">
          <span aria-hidden="true">✦</span>
          这一格还留着一块空位，下一篇故事会慢慢长出来。
        </p>
      </section>

      <aside class="topic-shelf__aside" aria-label="这一格的相关线索">
        <section v-if="usedTags.length" class="topic-shelf__section">
          <p class="topic-shelf__section-title">这格里的标签</p>
          <div class="topic-shelf__tags">
            <NuxtLink v-for="tag in usedTags" :key="tag.id" :to="`/tags/${encodeURIComponent(tag.slug)}`">
              #{{ tag.tagName }}
            </NuxtLink>
          </div>
        </section>

        <section v-if="siblings.length" class="topic-shelf__section">
          <p class="topic-shelf__section-title">
            {{ kind === 'category' ? '隔壁房间' : '其他标签' }}
          </p>
          <ul class="topic-shelf__siblings">
            <li v-for="sibling in siblings.slice(0, 6)" :key="sibling.key">
              <NuxtLink :to="sibling.to">
                <span>{{ sibling.label }}</span>
                <small>{{ sibling.count }}</small>
              </NuxtLink>
            </li>
          </ul>
        </section>

        <NuxtLink to="/archive" class="topic-shelf__archive">
          <span aria-hidden="true">⌛</span>
          <span><strong>时光档案</strong><small>把所有故事摊开看</small></span>
          <b aria-hidden="true">↗</b>
        </NuxtLink>
      </aside>
    </div>

    <p v-else class="topic-shelf__empty">这一格还空着，第一篇故事正在路上。</p>
  </div>
</template>

<style scoped>
.topic-shelf { display: grid; gap: 1rem; }
.topic-shelf__head {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem 1.1rem;
  overflow: hidden;
  border: 1px solid var(--bs-border);
  border-radius: 1.35rem;
  background:
    radial-gradient(circle at 95% 0%, rgba(255, 228, 138, .26), transparent 32%),
    var(--bs-paper-strong);
}
.topic-shelf__head::after {
  position: absolute;
  right: -2rem;
  bottom: -4rem;
  width: 9rem;
  height: 9rem;
  border: 1px dashed rgba(185, 167, 255, .3);
  border-radius: 50%;
  content: "";
  pointer-events: none;
}
.topic-shelf__stack { position: relative; display: grid; place-items: center; width: 3.55rem; height: 4.1rem; flex: 0 0 auto; }
.topic-shelf__stack i { position: absolute; left: .1rem; right: .1rem; height: 2.45rem; border: 1.5px solid var(--bs-ink-line); border-radius: .3rem .45rem .45rem .3rem; background: linear-gradient(135deg, var(--bs-yellow), var(--bs-peach)); }
.topic-shelf__stack i:first-child { top: .15rem; transform: rotate(-5deg); }
.topic-shelf__stack i:nth-child(2) { bottom: .05rem; background: linear-gradient(135deg, var(--bs-lilac), var(--bs-mint)); transform: rotate(5deg); }
.topic-shelf__stack b { position: relative; z-index: 1; font-size: 1.45rem; }
.topic-shelf__intro { min-width: 0; }
.topic-shelf__kicker { margin: 0; color: var(--bs-accent-ink); font-size: .65rem; letter-spacing: .14em; }
.topic-shelf__intro h2 { margin: .12rem 0 0; color: var(--bs-ink); font-size: 1.18rem; }
.topic-shelf__intro p:last-child { margin: .2rem 0 0; color: var(--bs-ink-soft); font-size: .8rem; line-height: 1.65; }
.topic-shelf__facts { display: flex; gap: .35rem; margin: 0; }
.topic-shelf__facts > div { min-width: 4rem; padding: .42rem .55rem; border-radius: .75rem; background: var(--bs-surface-soft); text-align: center; }
.topic-shelf__facts dt { color: var(--bs-ink-muted); font-size: .62rem; }
.topic-shelf__facts dd { margin: .1rem 0 0; color: var(--bs-ink); font-size: .82rem; font-weight: 700; }
.topic-shelf__facts small { margin-left: .1rem; color: var(--bs-ink-muted); font-size: .58rem; font-weight: 400; }

.topic-shelf__layout { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(14rem, .65fr); gap: 1rem; align-items: start; }
.topic-shelf__books { display: grid; gap: .55rem; align-content: start; min-width: 0; }
.topic-shelf__books ol { display: grid; gap: .45rem; margin: 0; padding: 0; list-style: none; }
.topic-shelf__books li { transform: rotate(var(--book-tilt)); transition: transform var(--bs-dur-base) var(--bs-ease-pop); }
.topic-shelf__books li:hover { transform: rotate(0); }
.topic-shelf__breath { display: flex; gap: .42rem; align-items: center; margin: 0; padding: .35rem .5rem; border: 1px dashed var(--bs-hairline); border-radius: .75rem; color: var(--bs-ink-muted); font-size: .68rem; line-height: 1.6; }
.topic-shelf__breath span { color: var(--bs-peach); font-size: .7rem; }
.topic-book {
  position: relative;
  display: grid;
  grid-template-columns: 5.4rem minmax(0, 1fr);
  min-height: 6rem;
  overflow: hidden;
  border: 1px solid var(--bs-border);
  border-radius: .35rem 1rem 1rem .35rem;
  background: var(--bs-surface);
  color: var(--bs-ink-body);
  text-decoration: none;
  box-shadow: var(--bs-shadow-soft);
  transition: background var(--bs-dur-quick) ease, box-shadow var(--bs-dur-quick) ease;
}
.topic-book::before { position: absolute; inset: 0 auto 0 0; width: .35rem; background: linear-gradient(180deg, var(--bs-pink), var(--bs-yellow)); content: ""; }
.topic-book:hover { background: var(--bs-surface-strong); box-shadow: var(--bs-shadow); }
.topic-book__art { display: grid; place-items: center; margin: .35rem 0 .35rem .5rem; border-radius: .45rem .8rem .8rem .45rem; }
.topic-book__art b { font-size: 1.75rem; filter: drop-shadow(0 5px 12px rgba(57,45,79,.2)); transition: transform var(--bs-dur-base) var(--bs-ease-pop); }
.topic-book:hover .topic-book__art b { transform: rotate(-9deg) scale(1.12); }
.topic-book__copy { display: grid; gap: .18rem; min-width: 0; padding: .65rem .8rem .7rem .7rem; }
.topic-book__top { display: flex; flex-wrap: wrap; gap: .35rem; align-items: baseline; color: var(--bs-ink-muted); font-size: .67rem; }
.topic-book__top em { margin-left: auto; color: var(--bs-ink-faint); font-style: normal; letter-spacing: .07em; }
.topic-book__copy strong { overflow: hidden; color: var(--bs-ink); font-size: .94rem; font-weight: 650; line-height: 1.45; text-overflow: ellipsis; white-space: nowrap; }
.topic-book__summary { overflow: hidden; color: var(--bs-ink-soft); font-size: .78rem; line-height: 1.6; text-overflow: ellipsis; white-space: nowrap; }
.topic-book__copy small { margin-top: .1rem; color: var(--bs-accent-ink); font-size: .68rem; }
.topic-book__copy small span { margin-left: .2rem; transition: transform var(--bs-dur-quick) ease; }
.topic-book:hover .topic-book__copy small span { display: inline-block; transform: translateX(3px); }

.topic-shelf__aside { display: grid; gap: .65rem; }
.topic-shelf__section { padding: .8rem .85rem; border: 1px dashed var(--bs-border-accent); border-radius: 1rem; background: var(--bs-surface-soft); }
.topic-shelf__section-title { margin: 0 0 .5rem; color: var(--bs-ink); font-size: .78rem; }
.topic-shelf__tags { display: flex; flex-wrap: wrap; gap: .3rem; }
.topic-shelf__tags a { padding: .2rem .48rem; border-radius: 999px; background: var(--bs-tint-lilac); color: var(--bs-link); font-size: .7rem; text-decoration: none; transition: transform var(--bs-dur-quick) var(--bs-ease-pop), background var(--bs-dur-quick) ease; }
.topic-shelf__tags a:hover { background: var(--bs-tint-pink); transform: translateY(-2px) rotate(-1deg); }
.topic-shelf__siblings { display: grid; gap: .22rem; margin: 0; padding: 0; list-style: none; }
.topic-shelf__siblings a { display: flex; align-items: center; justify-content: space-between; gap: .5rem; padding: .35rem .4rem; border-radius: .55rem; color: var(--bs-ink-soft); font-size: .74rem; text-decoration: none; transition: background var(--bs-dur-quick) ease, color var(--bs-dur-quick) ease; }
.topic-shelf__siblings a:hover { background: var(--bs-surface-strong); color: var(--bs-ink); }
.topic-shelf__siblings small { padding: .02rem .32rem; border-radius: 999px; background: var(--bs-tint-yellow); color: var(--bs-accent-ink); font-size: .62rem; }
.topic-shelf__archive { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: .5rem; align-items: center; padding: .72rem .8rem; border: 1px solid var(--bs-border); border-radius: 1rem; background: var(--bs-surface); color: var(--bs-ink); text-decoration: none; transition: transform var(--bs-dur-quick) var(--bs-ease-pop), background var(--bs-dur-quick) ease; }
.topic-shelf__archive:hover { background: var(--bs-tint-yellow); transform: translateY(-2px); }
.topic-shelf__archive > span:first-child { font-size: 1.15rem; }
.topic-shelf__archive > span:nth-child(2) { display: grid; gap: .03rem; }
.topic-shelf__archive strong { font-size: .78rem; }
.topic-shelf__archive small { color: var(--bs-ink-muted); font-size: .65rem; }
.topic-shelf__archive b { color: var(--bs-accent-ink); font-size: .8rem; }
.topic-book:focus-visible, .topic-shelf__tags a:focus-visible, .topic-shelf__siblings a:focus-visible, .topic-shelf__archive:focus-visible { outline: 3px solid rgba(185, 167, 255, .72); outline-offset: 2px; }
.topic-shelf__empty { margin: 0; padding: 1.5rem; border: 1px dashed var(--bs-border-accent); border-radius: 1rem; color: var(--bs-ink-muted); text-align: center; }

@media (max-width: 760px) {
  .topic-shelf__head { grid-template-columns: auto minmax(0, 1fr); align-items: start; }
  .topic-shelf__facts { grid-column: 1 / -1; width: 100%; }
  .topic-shelf__facts > div { flex: 1; }
  .topic-shelf__layout { grid-template-columns: 1fr; }
}
@media (max-width: 520px) {
  .topic-shelf__head { padding: .9rem; }
  .topic-shelf__stack { width: 2.8rem; height: 3.4rem; }
  .topic-book { grid-template-columns: 4.4rem minmax(0, 1fr); }
  .topic-book__summary { white-space: normal; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  .topic-book__copy strong { white-space: normal; }
}
@media (prefers-reduced-motion: reduce) {
  .topic-shelf__books li, .topic-book, .topic-book__art b, .topic-book__copy small span, .topic-shelf__tags a, .topic-shelf__siblings a, .topic-shelf__archive { transition: none; }
  .topic-shelf__books li:hover, .topic-shelf__tags a:hover, .topic-shelf__archive:hover { transform: none; }
  .topic-book:hover .topic-book__art b { transform: none; }
}
html.bs-reduced-motion .topic-shelf__books li,
html.bs-reduced-motion .topic-book,
html.bs-reduced-motion .topic-book__art b,
html.bs-reduced-motion .topic-book__copy small span,
html.bs-reduced-motion .topic-shelf__tags a,
html.bs-reduced-motion .topic-shelf__siblings a,
html.bs-reduced-motion .topic-shelf__archive { transition: none; }
html.bs-reduced-motion .topic-shelf__books li:hover,
html.bs-reduced-motion .topic-shelf__tags a:hover,
html.bs-reduced-motion .topic-shelf__archive:hover,
html.bs-reduced-motion .topic-book:hover .topic-book__art b { transform: none; }
</style>
