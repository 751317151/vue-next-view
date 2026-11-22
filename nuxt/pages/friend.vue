<script setup lang="ts">
import { siteConfig } from '../../src/config/site';
usePageSeo({
  path: '/friend',
  title: `友人帐 | ${siteConfig.name}`,
  description: '记录那些值得一起探索的站点和朋友。',
});

const friends = [
  { name: 'Vue.js 官方', url: 'https://vuejs.org', desc: '本站的骨架，一起把界面写得更优雅。' },
  { name: 'TypeScript', url: 'https://www.typescriptlang.org', desc: '让重构变得有底气的语言。' },
  { name: 'MDN Web Docs', url: 'https://developer.mozilla.org', desc: '每晚都会去翻的文档手册。' },
  { name: 'Nuxt', url: 'https://nuxt.com', desc: 'SSR、SEO 和幸福感的来源。' },
];
const rules = ['站点可正常访问，内容原创为主', '互相添加友链后留言或邮件告知', '不接受纯采集与广告站'];
</script>

<template>
  <MigrationPage title="友链" description="">
    <div class="friends">
      <div class="friends__grid">
        <a v-for="friend in friends" :key="friend.name" :href="friend.url" target="_blank" rel="noopener" class="friends__card">
          <span class="friends__avatar" aria-hidden="true">{{ friend.name.slice(0, 1) }}</span>
          <strong>{{ friend.name }}</strong>
          <p>{{ friend.desc }}</p>
          <small>{{ friend.url.replace('https://', '') }}</small>
        </a>
      </div>
      <section class="friends__apply" aria-labelledby="friends-apply-title">
        <h2 id="friends-apply-title">想交换友链？</h2>
        <ul>
          <li v-for="rule in rules" :key="rule">{{ rule }}</li>
        </ul>
        <p>带上你的站点名称、链接和一句介绍，通过 <a href="mailto:751317151@qq.com">邮件</a> 找我吧。</p>
      </section>
    </div>
  </MigrationPage>
</template>

<style scoped>
.friends { display: grid; gap: 1.8rem; }
.friends__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: .9rem; }
.friends__card { display: grid; gap: .4rem; padding: 1.1rem; border-radius: 1.2rem; background: var(--bs-surface); color: var(--bs-ink-body); text-decoration: none; transition: var(--bs-dur-base) ease; }
.friends__card:hover { transform: translateY(-4px) rotate(-.3deg); box-shadow: 0 18px 42px rgba(95,66,118,.15); background: rgba(255,228,138,.3); }
.friends__avatar { display: grid; place-items: center; width: 2.6rem; height: 2.6rem; border-radius: 50%; background: linear-gradient(135deg, var(--bs-pink), var(--bs-lilac)); color: var(--bs-ink); font-weight: 700; }
.friends__card strong { color: var(--bs-ink); }
.friends__card p { margin: 0; color: var(--bs-ink-soft); font-size: .88rem; line-height: 1.6; }
.friends__card small { color: var(--bs-ink-muted); }
.friends__apply { padding: 1.2rem 1.3rem; border-radius: 1.2rem; background: var(--bs-surface); }
.friends__apply h2 { color: var(--bs-ink); }
.friends__apply ul { margin: .7rem 0; padding-left: 1.2rem; color: var(--bs-ink-soft); line-height: 1.8; }
.friends__apply p { margin: 0; color: var(--bs-ink-soft); }
.friends__apply a { color: var(--bs-link); }
</style>
