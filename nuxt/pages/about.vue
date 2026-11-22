<script setup lang="ts">
import { siteConfig } from '../../src/config/site';
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
  <MigrationPage eyebrow="ABOUT" title="关于" description="">
    <div class="about">
      <div class="about__profile">
        <img src="/luffy.jpg" alt="BlackStar 的头像" class="about__avatar" width="96" height="96" />
        <div>
          <strong>{{ siteConfig.author }}</strong>
          <p>前端工程师 · 二次元爱好者 · 夜猫子写作者</p>
          <div class="about__links">
            <a href="https://github.com/751317151" target="_blank" rel="noopener">GitHub ↗</a>
            <a href="mailto:751317151@qq.com">Email ✉</a>
            <a href="/rss.xml" target="_blank" rel="noopener">RSS 订阅</a>
          </div>
        </div>
      </div>

      <section class="about__values" aria-label="写作理念">
        <article v-for="value in values" :key="value.title" class="about__value">
          <span>{{ value.emoji }}</span>
          <div>
            <strong>{{ value.title }}</strong>
            <p>{{ value.text }}</p>
          </div>
        </article>
      </section>

      <section class="about__stack" aria-label="常用技术">
        <h2>常在手边的工具</h2>
        <ul>
          <li v-for="item in stacks" :key="item">{{ item }}</li>
        </ul>
      </section>
    </div>
  </MigrationPage>
</template>

<style scoped>
.about { display: grid; gap: 1.6rem; }
.about__profile { display: flex; gap: 1.1rem; align-items: center; padding: 1.2rem; border-radius: 1.4rem; background: var(--bs-surface); }
.about__avatar { width: 96px; height: 96px; border-radius: 50%; object-fit: cover; box-shadow: 0 10px 26px rgba(95,66,118,.2); }
.about__profile strong { color: var(--bs-ink); font-size: 1.1rem; }
.about__profile p { margin: .25rem 0 .5rem; color: var(--bs-ink-soft); }
.about__links { display: flex; flex-wrap: wrap; gap: .7rem; }
.about__links a { color: var(--bs-link); font-size: .88rem; text-decoration: none; transition: var(--bs-dur-quick) ease; }
.about__links a:hover { color: var(--bs-accent-strong); transform: translateY(-2px); }
.about__values { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: .8rem; }
.about__value { display: flex; gap: .7rem; padding: 1rem; border-radius: 1.2rem; background: var(--bs-surface); }
.about__value span { font-size: 1.5rem; }
.about__value strong { color: var(--bs-ink); }
.about__value p { margin: .3rem 0 0; color: var(--bs-ink-soft); font-size: .9rem; line-height: 1.6; }
.about__stack h2 { color: var(--bs-ink); }
.about__stack ul { display: flex; flex-wrap: wrap; gap: .55rem; margin: .7rem 0 0; padding: 0; list-style: none; }
.about__stack li { padding: .45rem .8rem; border-radius: 999px; background: var(--bs-tint-lilac); color: var(--bs-ink-body); font-size: .85rem; }
</style>
