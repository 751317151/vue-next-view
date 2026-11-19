<script setup lang="ts">
interface CardArticle {
  id: number;
  slug: string;
  articleTitle: string;
  articleContent: string;
  category?: string;
  createTime: string;
}

const props = defineProps<{ article: CardArticle }>();
</script>

<template>
  <NuxtLink :to="`/article/${article.slug}`" class="article-card">
    <span class="article-card__art" :style="articleArt(article).style">
      <b>{{ articleArt(article).emoji }}</b>
    </span>
    <span class="article-card__body">
      <span class="article-card__chip">{{ article.category || '随笔' }}</span>
      <h3>{{ article.articleTitle }}</h3>
      <p>{{ excerptOf(article.articleContent) }}</p>
      <small>
        <time :datetime="article.createTime">{{ formatDate(article.createTime) }}</time>
        · 约 {{ readingMinutes(article.articleContent) }} 分钟
      </small>
    </span>
  </NuxtLink>
</template>

<style scoped>
.article-card { display: flex; flex-direction: column; overflow: hidden; border: 1px solid rgba(255,255,255,.72); border-radius: 1.4rem; background: rgba(255,255,255,.6); color: #4b3d60; text-decoration: none; box-shadow: 0 12px 30px rgba(95,66,118,.08); transition: 220ms ease; }
.article-card:hover { border-color: rgba(255,143,179,.45); transform: translateY(-5px) rotate(-.3deg); box-shadow: 0 22px 48px rgba(95,66,118,.16); }
.article-card__art { position: relative; display: grid; place-items: center; height: 7.5rem; }
.article-card__art b { font-size: 2.4rem; filter: drop-shadow(0 6px 14px rgba(57,45,79,.18)); transition: transform 260ms ease; }
.article-card:hover .article-card__art b { transform: scale(1.18) rotate(-6deg); }
.article-card__body { display: flex; flex-direction: column; flex: 1; padding: 1rem 1.1rem 1.1rem; }
.article-card__chip { align-self: flex-start; padding: .18rem .55rem; border: 1.5px solid var(--bs-ink-line, #392d4f); border-radius: 999px; background: rgba(255,143,179,.2); color: #b1768c; font-size: .72rem; letter-spacing: .06em; box-shadow: 2px 2px 0 var(--bs-ink-line, #392d4f); transition: transform 220ms cubic-bezier(.2,.9,.3,1.3); }
:root.bs-dark .article-card__chip { color: var(--bs-pink); background: rgba(255,143,179,.16); }
.article-card:hover .article-card__chip { transform: rotate(-3deg) translate(-1px, -1px); }
.article-card h3 { margin: .55rem 0 .35rem; color: #392d4f; font-size: 1.08rem; line-height: 1.4; }
.article-card p { display: -webkit-box; overflow: hidden; margin: 0; color: #746b86; font-size: .9rem; line-height: 1.65; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.article-card small { display: block; margin-top: auto; padding-top: .7rem; color: #9485a3; font-size: .8rem; }
</style>
