<script setup lang="ts">
import type { PublicArticle, PublicGlint } from '../types/public';

const props = defineProps<{
  articles: PublicArticle[];
  glints: PublicGlint[];
}>();

const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
const YEAR_TONES = ['var(--bs-peach)', 'var(--bs-mint)', 'var(--bs-lilac)', 'var(--bs-pink)'];

interface MonthBucket {
  key: string;
  label: string;
  articles: PublicArticle[];
  glints: PublicGlint[];
  total: number;
}

const parseDate = (value?: string) => {
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(value || '');
  return match ? { year: Number(match[1]), month: Number(match[2]) } : null;
};

const wordsOf = (article: PublicArticle) => (article.articleContent || '').replace(/\s+/g, '').length;

const totals = computed(() => ({
  articles: props.articles.length,
  glints: props.glints.length,
  words: props.articles.reduce((sum, article) => sum + wordsOf(article), 0),
  categories: new Set(props.articles.map((article) => article.category).filter(Boolean)).size,
}));

/**
 * 年轮以年为圈、以月为刻度：同一个月里的文章和微光并排站好，
 * 读者看到的是节奏，而不是一堆并排的统计图。
 */
const rings = computed(() => {
  const buckets = new Map<string, MonthBucket>();
  const ensure = (year: number, month: number) => {
    const key = `${year}-${String(month).padStart(2, '0')}`;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { key, label: MONTHS[month - 1] || `${month} 月`, articles: [], glints: [], total: 0 };
      buckets.set(key, bucket);
    }
    return bucket;
  };

  for (const article of props.articles) {
    const date = parseDate(article.createTime);
    if (date) ensure(date.year, date.month).articles.push(article);
  }
  for (const glint of props.glints) {
    const date = parseDate(glint.date);
    if (date) ensure(date.year, date.month).glints.push(glint);
  }

  const grouped = new Map<number, MonthBucket[]>();
  for (const bucket of buckets.values()) {
    bucket.total = bucket.articles.length + bucket.glints.length;
    const year = Number(bucket.key.slice(0, 4));
    grouped.set(year, [...(grouped.get(year) || []), bucket]);
  }

  return [...grouped.entries()]
    .sort(([left], [right]) => right - left)
    .map(([year, months], index) => ({
      year,
      months: months.sort((left, right) => left.key.localeCompare(right.key)),
      tone: YEAR_TONES[index % YEAR_TONES.length]!,
      total: months.reduce((sum, month) => sum + month.total, 0),
    }));
});

const maxMonth = computed(() => Math.max(1, ...rings.value.flatMap((ring) => ring.months.map((month) => month.total))));

const milestones = computed(() => {
  const earliest = [...props.articles].sort((left, right) => left.createTime.localeCompare(right.createTime))[0];
  const latestGlint = [...props.glints].sort((left, right) => left.date.localeCompare(right.date)).at(-1);
  const busiest = [...rings.value]
    .flatMap((ring) => ring.months)
    .sort((left, right) => right.total - left.total)[0];

  return [
    earliest && {
      emoji: '🌱',
      label: '第一颗种子',
      value: earliest.articleTitle,
      note: earliest.createTime,
      to: `/article/${earliest.slug}`,
    },
    latestGlint && {
      emoji: '🕯️',
      label: '最近一束光',
      value: latestGlint.title,
      note: latestGlint.date,
      to: latestGlint.path || `/glints/${encodeURIComponent(latestGlint.slug)}`,
    },
    busiest && {
      emoji: '☕',
      label: '写得最多的一个月',
      value: `${busiest.key.slice(0, 4)} 年 ${Number(busiest.key.slice(5))} 月`,
      note: `${busiest.total} 次更新`,
      to: '',
    },
  ].filter(Boolean) as Array<{ emoji: string; label: string; value: string; note: string; to: string }>;
});
</script>

<template>
  <section v-if="rings.length" class="growth" aria-labelledby="growth-title">
    <span class="growth__tape" aria-hidden="true"></span>

    <header class="growth__head">
      <span class="growth__mark" aria-hidden="true">🌳</span>
      <div>
        <h2 id="growth-title">创作年轮</h2>
        <p>每圈是一年，每道刻度是一个月。长短不齐，才是真实生长的样子。</p>
      </div>
      <span class="growth__since">{{ rings.at(-1)?.year }} — {{ rings[0]?.year }}</span>
    </header>

    <dl class="growth__figures">
      <div><dt>文章</dt><dd>{{ totals.articles }}</dd></div>
      <div><dt>微光</dt><dd>{{ totals.glints }}</dd></div>
      <div><dt>留下</dt><dd>{{ (totals.words / 1000).toFixed(1) }}k 字</dd></div>
      <div><dt>小房间</dt><dd>{{ totals.categories }}</dd></div>
    </dl>

    <div class="growth__rings">
      <section v-for="ring in rings" :key="ring.year" class="growth__year" :style="{ '--ring-tone': ring.tone }">
        <header class="growth__year-head">
          <h3>{{ ring.year }}</h3>
          <span>{{ ring.total }} 次更新</span>
        </header>
        <ol class="growth__months">
          <li v-for="month in ring.months" :key="month.key" class="growth__month">
            <span class="growth__month-label">{{ month.label }}</span>
            <span class="growth__month-track" aria-hidden="true">
              <i :style="{ width: `${Math.max(8, (month.total / maxMonth) * 100)}%` }"></i>
            </span>
            <span class="growth__month-count">{{ month.total }}</span>
            <ul class="growth__entries">
              <li v-for="article in month.articles" :key="`a-${article.id}`">
                <NuxtLink :to="`/article/${article.slug}`">
                  <span aria-hidden="true">📖</span>{{ article.articleTitle }}
                </NuxtLink>
              </li>
              <li v-for="glint in month.glints" :key="`g-${glint.id}`">
                <NuxtLink :to="glint.path || `/glints/${encodeURIComponent(glint.slug)}`">
                  <span aria-hidden="true">{{ glint.emoji }}</span>{{ glint.title }}
                </NuxtLink>
              </li>
            </ul>
          </li>
        </ol>
      </section>
    </div>

    <ul class="growth__milestones" aria-label="创作里程碑">
      <li v-for="mile in milestones" :key="mile.label" class="growth__milestone">
        <NuxtLink v-if="mile.to" :to="mile.to">
          <span class="growth__milestone-emoji" aria-hidden="true">{{ mile.emoji }}</span>
          <span class="growth__milestone-body">
            <small>{{ mile.label }}</small>
            <strong>{{ mile.value }}</strong>
            <em>{{ mile.note }}</em>
          </span>
          <span class="growth__milestone-arrow" aria-hidden="true">↗</span>
        </NuxtLink>
        <span v-else class="growth__milestone-static">
          <span class="growth__milestone-emoji" aria-hidden="true">{{ mile.emoji }}</span>
          <span class="growth__milestone-body">
            <small>{{ mile.label }}</small>
            <strong>{{ mile.value }}</strong>
            <em>{{ mile.note }}</em>
          </span>
        </span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.growth { position: relative; display: grid; gap: .9rem; padding: 1.2rem 1.25rem 1.25rem; border: 1px solid var(--bs-border); border-radius: 1.35rem 1.5rem 1.3rem 1.4rem; background: radial-gradient(circle at 92% 4%, rgba(255, 228, 138, .26), transparent 30%), var(--bs-paper-strong); box-shadow: var(--bs-shadow-soft); }
/* 午夜模式里黄色光晕直接叠在深紫纸上会发闷；换成低饱和的月光黄 + 淡紫，
   纸面仍然是暖的，但不会出现一块脏橄榄色。 */
:root.bs-dark .growth {
  background:
    radial-gradient(circle at 92% 4%, rgba(255, 233, 160, .08), transparent 32%),
    radial-gradient(circle at 6% 96%, rgba(195, 178, 255, .10), transparent 30%),
    var(--bs-paper-strong);
}
.growth__tape { position: absolute; top: -.5rem; left: 2rem; width: 4.6rem; height: 1rem; background: rgba(255, 228, 138, .62); box-shadow: 0 2px 5px rgba(95, 66, 118, .1); transform: rotate(-1.6deg); clip-path: polygon(3% 12%, 97% 0, 100% 87%, 2% 100%); }

.growth__head { display: flex; align-items: center; gap: .8rem; }
.growth__mark { display: grid; place-items: center; flex: 0 0 auto; width: 2.7rem; height: 2.7rem; border: 1.5px solid var(--bs-ink-line); border-radius: 46% 54% 52% 48%; background: linear-gradient(145deg, var(--bs-mint), var(--bs-yellow) 68%); font-size: 1.2rem; box-shadow: var(--bs-sticker-shadow); transform: rotate(-5deg); transition: transform var(--bs-dur-base) var(--bs-ease-pop); }
.growth__head:hover .growth__mark { transform: rotate(4deg) scale(1.06); }
.growth__head h2 { margin: 0; color: var(--bs-ink); font-size: 1.18rem; }
.growth__head p { margin: .15rem 0 0; color: var(--bs-ink-soft); font-size: .8rem; line-height: 1.65; }
.growth__since { margin-left: auto; padding: .15rem .55rem; border: 1px dashed var(--bs-border-accent); border-radius: 999px; color: var(--bs-accent-ink); font-size: .68rem; white-space: nowrap; }

.growth__figures { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .45rem; margin: 0; }
.growth__figures > div { padding: .55rem .4rem; border-radius: .8rem; background: var(--bs-surface-soft); text-align: center; }
.growth__figures dt { color: var(--bs-ink-muted); font-size: .68rem; }
.growth__figures dd { margin: .1rem 0 0; color: var(--bs-ink); font-size: 1.02rem; font-weight: 700; }

.growth__rings { display: grid; gap: .55rem; }
.growth__year { padding: .7rem .8rem .6rem; border-left: 3px solid var(--ring-tone); border-radius: .35rem .9rem .9rem .35rem; background: var(--bs-surface-soft); }
.growth__year-head { display: flex; align-items: baseline; gap: .5rem; }
.growth__year-head h3 { margin: 0; color: var(--bs-ink); font-size: 1rem; letter-spacing: .04em; }
.growth__year-head span { color: var(--bs-ink-muted); font-size: .68rem; }

.growth__months { display: grid; gap: .1rem; margin: .35rem 0 0; padding: 0; list-style: none; }
.growth__month { display: grid; grid-template-columns: 2.6rem minmax(2rem, 1fr) 1.4rem; gap: .45rem; align-items: center; padding: .3rem .25rem; border-radius: .45rem; transition: background var(--bs-dur-quick) ease; }
.growth__month:hover { background: var(--bs-surface-strong); }
.growth__month-label { color: var(--bs-ink-soft); font-size: .72rem; }
.growth__month-track { display: block; height: .42rem; overflow: hidden; border-radius: 999px; background: var(--bs-surface); }
.growth__month-track i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--ring-tone), var(--bs-pink)); transition: width var(--bs-dur-slow) var(--bs-ease-pop); }
.growth__month-count { color: var(--bs-ink-muted); font-size: .66rem; text-align: right; }

.growth__entries { grid-column: 2 / -1; display: grid; gap: .1rem; margin: .1rem 0 0; padding: 0; list-style: none; }
.growth__entries a { display: inline-flex; gap: .35rem; align-items: baseline; max-width: 100%; padding: .08rem .25rem; border-radius: .35rem; color: var(--bs-ink-body); font-size: .72rem; line-height: 1.55; text-decoration: none; transition: color var(--bs-dur-quick) ease, background var(--bs-dur-quick) ease; }
.growth__entries a:hover { background: var(--bs-tint-yellow); color: var(--bs-ink); }
.growth__entries a:focus-visible { outline: 2px solid rgba(185, 167, 255, .72); outline-offset: 1px; }
.growth__entries span { flex: 0 0 auto; font-size: .7rem; }

.growth__milestones { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .45rem; margin: 0; padding: 0; list-style: none; }
.growth__milestone a, .growth__milestone-static { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: .45rem; align-items: center; height: 100%; padding: .5rem .55rem; border: 1px dashed var(--bs-border-accent); border-radius: .75rem; color: var(--bs-ink-body); text-decoration: none; transition: transform var(--bs-dur-quick) var(--bs-ease-pop), background var(--bs-dur-quick) ease; }
.growth__milestone a:hover { background: var(--bs-tint-yellow); transform: translateY(-2px) rotate(-.4deg); }
.growth__milestone a:focus-visible { outline: 3px solid rgba(185, 167, 255, .72); outline-offset: 2px; }
.growth__milestone-emoji { font-size: 1rem; }
.growth__milestone-body { display: grid; min-width: 0; gap: .02rem; }
.growth__milestone-body small { color: var(--bs-accent-ink); font-size: .62rem; letter-spacing: .06em; }
.growth__milestone-body strong { overflow: hidden; color: var(--bs-ink); font-size: .76rem; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.growth__milestone-body em { color: var(--bs-ink-muted); font-size: .64rem; font-style: normal; }
.growth__milestone-arrow { color: var(--bs-ink-faint); font-size: .7rem; }

@media (max-width: 720px) {
  .growth { padding: 1rem; }
  .growth__head { align-items: flex-start; }
  .growth__since { display: none; }
  .growth__figures { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .growth__milestones { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  .growth__mark, .growth__month, .growth__month-track i, .growth__entries a, .growth__milestone a { transition: none; }
  .growth__head:hover .growth__mark, .growth__milestone a:hover { transform: none; }
}
html.bs-reduced-motion .growth__mark,
html.bs-reduced-motion .growth__month,
html.bs-reduced-motion .growth__month-track i,
html.bs-reduced-motion .growth__entries a,
html.bs-reduced-motion .growth__milestone a { transition: none; }
html.bs-reduced-motion .growth__head:hover .growth__mark,
html.bs-reduced-motion .growth__milestone a:hover { transform: none; }
</style>
