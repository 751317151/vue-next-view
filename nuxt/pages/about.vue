<script setup lang="ts">
import { siteConfig } from '../../src/config/site';
import type { PublicArticle, PublicGlint } from '../types/public';

const [{ data: articles }, { data: glints }] = await Promise.all([
  useAsyncData<PublicArticle[]>('about-articles', () => $fetch<PublicArticle[]>('/api/articles')),
  useAsyncData<PublicGlint[]>('about-glints', () => $fetch<PublicGlint[]>('/api/glints')),
]);

const grown = computed(() => (articles.value || []).length + (glints.value || []).length);
const writtenWords = computed(() => (articles.value || [])
  .reduce((sum, article) => sum + (article.articleContent || '').replace(/\s+/g, '').length, 0));

usePageSeo({
  path: '/about',
  title: `关于 | ${siteConfig.name}`,
  description: '认识 BlackStar，以及这个博客为什么存在。',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: `关于 ${siteConfig.author} | ${siteConfig.name}`,
    description: '认识 BlackStar，以及这个博客为什么存在。',
    inLanguage: siteConfig.locale,
    mainEntity: {
      '@type': 'Person',
      name: siteConfig.author,
      description: '前端工程师、二次元爱好者、夜猫子写作者。喜欢把复杂的技术写成温暖、清晰的小故事。',
      url: 'https://github.com/751317151',
      sameAs: ['https://github.com/751317151'],
      knowsAbout: ['Vue 3', 'TypeScript', 'Nuxt 4', 'Vite', 'Node.js', 'Spring Boot'],
    },
    // 给生成式引擎一组可直接引用的真实创作统计，而不是让人从图表里猜。
    ...(grown.value
      ? {
        subjectOf: {
          '@type': 'Dataset',
          name: `${siteConfig.name}的创作年轮`,
          description: `截至 ${new Date().toISOString().slice(0, 10)}，站内共有 ${articles.value?.length || 0} 篇文章、${glints.value?.length || 0} 则微光，累计约 ${Math.round(writtenWords.value / 100) / 10} 千字。`,
          variableMeasured: ['文章数', '微光数', '正文字数'],
          creator: { '@type': 'Person', name: siteConfig.author },
        },
      }
      : {}),
  },
});

const stacks = ['Vue 3', 'TypeScript', 'Nuxt 4', 'Vite', 'Node.js', 'Spring Boot'];
const values = [
  { emoji: '🌱', title: '慢慢写，写清楚', text: '不追热点，只写真的想明白的东西。每篇文章都先说服自己。' },
  { emoji: '🎨', title: '界面要有温度', text: '像素、动效和文案一起构成氛围，好的界面应该是被精心照顾过的。' },
  { emoji: '🧭', title: '记录即是思考', text: '博客是外置的大脑，也是给未来自己留的一盏小灯。' },
];
</script>

<template>
  <MigrationPage title="关于" description="">
    <div class="about">
      <div class="about__profile">
        <span class="about__avatar-wrap">
          <img src="/luffy.jpg" alt="BlackStar 的头像" class="about__avatar" width="96" height="96" />
          <i class="about__avatar-pin" aria-hidden="true"></i>
        </span>
        <div class="about__intro">
          <strong>{{ siteConfig.author }}</strong>
          <p>前端工程师 · 二次元爱好者 · 夜猫子写作者</p>
          <div class="about__links">
            <a href="https://github.com/751317151" target="_blank" rel="noopener">GitHub ↗</a>
            <a href="mailto:751317151@qq.com">Email ✉</a>
            <a href="/rss.xml" target="_blank" rel="noopener">RSS 订阅</a>
          </div>
        </div>
        <span v-if="grown" class="about__grown" aria-label="站内已写下内容的数量">
          <b>{{ grown }}</b>
          <small>颗会发光的小东西</small>
        </span>
      </div>

      <GrowthRings v-if="articles?.length" :articles="articles" :glints="glints || []" />

      <section class="about__values" aria-label="写作理念">
        <h2 class="about__section-title">写在每一页之前</h2>
        <article v-for="value in values" :key="value.title" class="about__value">
          <span>{{ value.emoji }}</span>
          <div>
            <strong>{{ value.title }}</strong>
            <p>{{ value.text }}</p>
          </div>
        </article>
      </section>

      <section class="about__stack" aria-label="常用技术">
        <h2 class="about__section-title">常在手边的工具</h2>
        <ul>
          <li v-for="item in stacks" :key="item">{{ item }}</li>
        </ul>
      </section>
    </div>
  </MigrationPage>
</template>

<style scoped>
.about { display: grid; gap: 1.4rem; }

.about__profile { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 1.1rem; align-items: center; padding: 1.2rem; border: 1px solid var(--bs-border); border-radius: 1.4rem; background: radial-gradient(circle at 6% 10%, rgba(255, 228, 138, .22), transparent 32%), var(--bs-surface); }
.about__avatar-wrap { position: relative; display: inline-grid; flex: 0 0 auto; }
.about__avatar { width: 96px; height: 96px; border-radius: 38% 62% 52% 48%; object-fit: cover; box-shadow: 0 10px 26px rgba(95,66,118,.2); transform: rotate(-3deg); transition: transform var(--bs-dur-base) var(--bs-ease-pop); }
.about__profile:hover .about__avatar { transform: rotate(2deg) scale(1.03); }
.about__avatar-pin { position: absolute; top: -.2rem; right: -.25rem; width: .85rem; height: .85rem; border: 1.5px solid var(--bs-ink-line); border-radius: 50%; background: var(--bs-pink); box-shadow: inset 0 0 0 2px var(--bs-paper); }
.about__intro { min-width: 0; }
.about__intro strong { color: var(--bs-ink); font-size: 1.1rem; }
.about__intro p { margin: .25rem 0 .5rem; color: var(--bs-ink-soft); }
.about__links { display: flex; flex-wrap: wrap; gap: .7rem; }
.about__links a { color: var(--bs-link); font-size: .88rem; text-decoration: none; transition: var(--bs-dur-quick) ease; }
.about__links a:hover { color: var(--bs-accent-strong); transform: translateY(-2px); }

/* 数量像一张别在衣角的小票，给介绍一个轻量的“仍在生长”提示。 */
.about__grown { display: grid; place-items: center; align-self: start; gap: .05rem; min-width: 5rem; padding: .5rem .65rem; border: 1px dashed var(--bs-border-accent); border-radius: .9rem; background: var(--bs-tint-yellow); text-align: center; transform: rotate(1.2deg); }
.about__grown b { color: var(--bs-ink); font-size: 1.25rem; line-height: 1; }
.about__grown small { color: var(--bs-accent-ink); font-size: .6rem; line-height: 1.4; }

.about__section-title { margin: 0 0 .6rem; color: var(--bs-ink); font-size: 1rem; }

.about__values { display: grid; gap: .7rem; }
.about__values .about__section-title { margin-bottom: 0; }
.about__value { display: flex; gap: .7rem; padding: 1rem; border: 1px solid var(--bs-border); border-radius: 1.2rem; background: var(--bs-surface); transition: transform var(--bs-dur-base) var(--bs-ease-pop), background var(--bs-dur-base) ease; }
.about__value:hover { background: var(--bs-surface-strong); transform: translateX(3px); }
.about__value span { font-size: 1.5rem; }
.about__value strong { color: var(--bs-ink); }
.about__value p { margin: .3rem 0 0; color: var(--bs-ink-soft); font-size: .9rem; line-height: 1.6; }

.about__stack { padding-top: .2rem; }
.about__stack ul { display: flex; flex-wrap: wrap; gap: .55rem; margin: 0; padding: 0; list-style: none; }
.about__stack li { padding: .45rem .8rem; border-radius: 999px; background: var(--bs-tint-lilac); color: var(--bs-ink-body); font-size: .85rem; }

@media (max-width: 640px) {
  .about__profile { grid-template-columns: auto minmax(0, 1fr); align-items: start; }
  .about__avatar { width: 76px; height: 76px; }
  .about__grown { grid-column: 1 / -1; justify-self: start; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .about__avatar, .about__value { transition: none; }
  .about__profile:hover .about__avatar, .about__value:hover { transform: none; }
}
html.bs-reduced-motion .about__avatar,
html.bs-reduced-motion .about__value { transition: none; }
html.bs-reduced-motion .about__profile:hover .about__avatar,
html.bs-reduced-motion .about__value:hover { transform: none; }
</style>
