<script setup lang="ts">
interface CardArticle {
  id: number;
  slug: string;
  articleTitle: string;
  articleContent: string;
  category?: string;
  createTime: string;
  /** 由仓库层统一生成的摘要；有值时优先于正文截取。 */
  summary?: string;
}

const props = defineProps<{ article: CardArticle }>();

// 作者写了摘要就用它，保证列表、详情页和 llms.txt 看到的是同一句话。
const blurb = computed(() => props.article.summary?.trim() || excerptOf(props.article.articleContent));
</script>

<template>
  <div class="article-card-wrap">
    <NuxtLink :to="`/article/${article.slug}`" class="article-card">
      <span class="article-card__art" :style="articleArt(article).style">
        <b>{{ articleArt(article).emoji }}</b>
      </span>
      <span class="article-card__body">
        <span class="article-card__chip">{{ article.category || '随笔' }}</span>
        <h3>{{ article.articleTitle }}</h3>
        <p>{{ blurb }}</p>
        <small>
          <time :datetime="article.createTime">{{ formatDate(article.createTime) }}</time>
          · 约 {{ readingMinutes(article.articleContent) }} 分钟
        </small>
      </span>
    </NuxtLink>
    <!-- 收藏按钮放在链接外层，避免 button 嵌在 a 里既不合规又会触发跳转。 -->
    <StarToggle
      class="article-card__star"
      :item="{
        slug: article.slug,
        title: article.articleTitle,
        emoji: articleArt(article).emoji,
        category: article.category,
      }"
    />
  </div>
</template>

<style scoped>
.article-card-wrap { position: relative; display: flex; }
.article-card-wrap > .article-card { flex: 1; }
/* 收藏星浮在卡片右上角，露出在封面图上。 */
.article-card__star { position: absolute; top: .6rem; right: .6rem; z-index: 2; opacity: 0; transform: translateY(-4px); transition: opacity var(--bs-dur-quick) ease, transform var(--bs-dur-quick) var(--bs-ease-pop); }
.article-card-wrap:hover .article-card__star, .article-card__star:focus-visible, .article-card__star.is-collected { opacity: 1; transform: none; }
/* 触屏没有 hover，收藏星常驻显示。 */
@media (hover: none) { .article-card__star { opacity: 1; transform: none; } }
.article-card { display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--bs-border); border-radius: 1.4rem; background: var(--bs-surface); color: var(--bs-ink-body); text-decoration: none; box-shadow: var(--bs-shadow-soft); transition: var(--bs-dur-base) ease; }
.article-card:hover { border-color: var(--bs-border-accent); transform: translateY(-5px) rotate(-.3deg); box-shadow: var(--bs-shadow-hover); }
.article-card__art { position: relative; display: grid; place-items: center; height: 7.5rem; }
.article-card__art b { font-size: 2.4rem; filter: drop-shadow(0 6px 14px rgba(57,45,79,.18)); transition: transform var(--bs-dur-base) ease; }
.article-card:hover .article-card__art b { transform: scale(1.18) rotate(-6deg); }
.article-card__body { display: flex; flex-direction: column; flex: 1; padding: 1rem 1.1rem 1.1rem; }
.article-card__chip { align-self: flex-start; padding: .18rem .55rem; border: 1.5px solid var(--bs-ink-line, #392d4f); border-radius: 999px; background: var(--bs-tint-pink); color: var(--bs-accent-ink); font-size: .72rem; letter-spacing: .06em; box-shadow: 2px 2px 0 var(--bs-ink-line, #392d4f); transition: transform var(--bs-dur-base) var(--bs-ease-pop); }
:root.bs-dark .article-card__chip { color: var(--bs-pink); background: rgba(255,143,179,.16); }
.article-card:hover .article-card__chip { transform: rotate(-3deg) translate(-1px, -1px); }
.article-card h3 { margin: .55rem 0 .35rem; color: var(--bs-ink); font-size: 1.08rem; line-height: 1.4; }
.article-card p { display: -webkit-box; overflow: hidden; margin: 0; color: var(--bs-ink-soft); font-size: .9rem; line-height: 1.65; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.article-card small { display: block; margin-top: auto; padding-top: .7rem; color: var(--bs-ink-muted); font-size: .8rem; }
</style>
