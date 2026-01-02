<template>
  <div v-if="!common.isEmpty(ArticleList)" class="recent-post-container">
    <div
      v-for="(article, index) in ArticleList"
      :key="article.id"
      :ref="el => setArticleRef(el, index)"
      class="recent-post-item shadow-box background-opacity"
      :class="{ 'article-visible': visibleItems[index] }"
      :style="{ transitionDelay: `${(index % 3) * 0.15}s` }"
      @click="router.push({ path: '/article/' + article.id })"
    >
      <!-- 封面 -->
      <div
        class="recent-post-item-image"
        :class="{
          leftImage: index % 2 !== 0,
          rightImage: index % 2 === 0,
        }"
      >
        <el-image
          class="my-el-image"
          v-once
          lazy
          :src="
            !common.isEmpty(article.articleCover)
              ? article.articleCover
              : constant.random_image +
                new Date() +
                Math.floor(Math.random() * 10)
          "
          fit="cover"
        >
          <template #placeholder>
            <div class="image-placeholder">
              <el-icon class="loading-icon"><Loading /></el-icon>
            </div>
          </template>
          <template #error>
            <div class="image-placeholder">
              <el-icon class="error-icon"><Picture /></el-icon>
            </div>
          </template>
        </el-image>
        <!-- 置顶/热门 徽章 -->
        <div v-if="article.isTop || article.viewCount > 1000" class="article-badges">
          <div v-if="article.isTop" class="badge-item top-badge">
            <span class="badge-text">TOP</span>
          </div>
          <div v-else-if="article.viewCount > 1000" class="badge-item hot-badge">
            <span class="badge-text">HOT</span>
          </div>
        </div>
        <!-- 分类标签 -->
        <div class="category-badge">
          {{ article.category || '未分类' }}
        </div>
      </div>
      <!-- 内容 -->
      <div
        class="recent-post-item-post"
        :class="{
          leftImage: index % 2 === 0,
          rightImage: index % 2 !== 0,
        }"
      >
        <!-- 时间和阅读时间 -->
        <div class="post-meta">
          <span class="meta-item">
            <SvgIcon style="vertical-align: -2px" icon-name="time"></SvgIcon>
            {{ article.createTime }}
          </span>
          <span class="meta-item reading-time">
            <el-icon style="vertical-align: -2px"><Clock /></el-icon>
            {{ estimateReadingTime(article.articleContent) }} 分钟阅读
          </span>
        </div>
        <!-- 标题 -->
        <h3 class="article-title">{{ article.articleTitle }}</h3>

        <!-- 统计信息 -->
        <div class="post-stats">
          <span class="stat-item">
            <el-icon><View /></el-icon>
            {{ formatNumber(article.viewCount) }}
          </span>
          <span class="stat-item">
            <el-icon><ChatDotRound /></el-icon>
            {{ article.commentCount }}
          </span>
          <span class="stat-item">
            <el-icon><Star /></el-icon>
            {{ article.likeCount }}
          </span>
        </div>
        <!-- 内容摘要 -->
        <div class="recent-post-desc">
          {{ article.articleContent }}
        </div>
        <!-- 标签 -->
        <div class="tag-list">
          <span 
            v-for="tag in (article.tags || ['Vue', 'TypeScript']).slice(0, 3)" 
            :key="tag" 
            class="tag-item"
          >
            #{{ tag }}
          </span>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 骨架屏 -->
  <div v-else-if="ArticleList === undefined" class="skeleton-container">
    <div v-for="i in 3" :key="i" class="skeleton-item">
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-line title"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>
  </div>

  <!-- 空状态 -->
  <EmptyState
    v-else
    title="暂无文章"
    description="还没有发布任何文章，敬请期待~"
  />
</template>

<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { ref, reactive, onMounted, onUnmounted, watch, nextTick } from "vue";
import { Loading, Clock, View, ChatDotRound, Star, Picture } from "@element-plus/icons-vue";
import EmptyState from "@/components/common/EmptyState.vue";
import common from "@/utils/common";
import constant from "@/utils/constant";
import type { Article } from "@/types";

const router = useRouter();
const route = useRoute();

const props = defineProps({
  ArticleList: Array<Article>,
});

// 估算阅读时间（假设每分钟阅读300字）
const estimateReadingTime = (content: string) => {
  if (!content) return 1;
  const wordCount = content.length;
  const minutes = Math.ceil(wordCount / 300);
  return Math.max(1, minutes);
};

// 格式化数字
const formatNumber = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num;
};

// 记录每个文章是否可见
const visibleItems = reactive<Record<number, boolean>>({});
const articleRefs = ref<(HTMLElement | null)[]>([]);
let observer: IntersectionObserver | null = null;

const setArticleRef = (el: any, index: number) => {
  if (el) {
    articleRefs.value[index] = el;
  }
};

// 初始化 Intersection Observer
const initObserver = () => {
  // 先清理旧的 observer
  if (observer) {
    observer.disconnect();
  }
  
  // 重置所有可见状态
  Object.keys(visibleItems).forEach(key => {
    visibleItems[Number(key)] = false;
  });

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const index = articleRefs.value.indexOf(entry.target as HTMLElement);
        if (index !== -1) {
          if (entry.isIntersecting) {
            visibleItems[index] = true;
          } else {
            // 滚动出视口时隐藏，实现双向动画
            visibleItems[index] = false;
          }
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }
  );

  // 观察所有文章元素
  nextTick(() => {
    articleRefs.value.forEach((el) => {
      if (el && observer) {
        observer.observe(el);
      }
    });
  });
};

// 监听路由变化
watch(() => route.path, (newPath, oldPath) => {
  if (newPath === '/' && oldPath && oldPath !== '/') {
    // 从其他页面回到首页，重新初始化动画
    nextTick(() => {
      initObserver();
    });
  }
});

// 监听文章列表变化
watch(() => props.ArticleList, () => {
  nextTick(() => {
    initObserver();
  });
}, { deep: true });

onMounted(() => {
  nextTick(() => {
    initObserver();
  });
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style lang="scss" scoped>
.recent-post-container {
  max-width: 1200px;
  margin: auto;
  margin-top: 50px;
  position: relative;
  z-index: 1;
}

.recent-post-container .recent-post-item:not(:last-child) {
  margin-bottom: 40px;
}

.recent-post-item-image {
  width: 50%;
  height: 100%;
  position: relative;
  overflow: hidden;
  
  .image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--maxLightGray);
    
    .loading-icon {
      font-size: 32px;
      color: var(--greyFont);
      animation: spin 1s linear infinite;
    }
  }
  
  .category-badge {
    position: absolute;
    bottom: 15px;
    left: 15px;
    background: var(--themeBackground);
    color: #fff;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    z-index: 3;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }


  .article-badges {
    position: absolute;
    top: 15px;
    right: 15px;
    z-index: 3;
    
    .badge-item {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      color: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      
      &.top-badge {
        background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
      }
      
      &.hot-badge {
        background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
      }
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.recent-post-item-image :deep(.el-image__inner) {
  transition: all 0.5s ease;
}

.recent-post-item:hover :deep(.el-image__inner) {
  transform: scale(1.08);
}

.leftImage {
  position: absolute;
  left: 0;
}

.rightImage {
  position: absolute;
  right: 0;
  text-align: right;
  
  .category-badge {
    left: auto;
    right: 15px;
  }
}

.recent-post-item-post {
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px 30px;
}

.article-title {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin: 8px 0 12px;
  font-size: 20px;
  color: var(--fontColor);
  transition: color 0.3s ease;
}

.recent-post-item:hover .article-title {
  color: var(--themeBackground);
}

.recent-post-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.post-meta {
  font-size: 12px;
  color: var(--greyFont);
  display: flex;
  align-items: center;
  gap: 15px;
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .reading-time {
    background: var(--maxMaxLightGray);
    padding: 2px 8px;
    border-radius: 10px;
  }
}

.post-stats {
  display: flex;
  gap: 15px;
  margin-bottom: 12px;
  
  .stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: var(--greyFont);
    
    .el-icon {
      font-size: 14px;
    }
  }
}

.recent-post-desc {
  font-size: 14px;
  line-height: 1.8;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  color: var(--articleGreyFontColor);
  flex: 1;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
  
  .tag-item {
    font-size: 12px;
    color: var(--themeBackground);
    background: rgba(255, 165, 0, 0.1);
    padding: 3px 10px;
    border-radius: 15px;
    transition: all 0.3s ease;
    cursor: pointer;
    
    &:hover {
      background: var(--themeBackground);
      color: #fff;
    }
  }
}

/* 骨架屏样式 */
.skeleton-container {
  max-width: 1200px;
  margin: 50px auto 0;
}

.skeleton-item {
  display: flex;
  height: 280px;
  margin-bottom: 40px;
  border-radius: 10px;
  overflow: hidden;
  background: var(--card-background);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.skeleton-image {
  width: 50%;
  background: linear-gradient(90deg, var(--maxLightGray) 25%, var(--maxMaxLightGray) 50%, var(--maxLightGray) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-content {
  width: 50%;
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.skeleton-line {
  height: 16px;
  background: linear-gradient(90deg, var(--maxLightGray) 25%, var(--maxMaxLightGray) 50%, var(--maxLightGray) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  
  &.title {
    height: 24px;
    width: 70%;
  }
  
  &.short {
    width: 40%;
  }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media screen and (max-width: 700px) {
  .recent-post-item {
    height: 420px;
    position: unset;
    display: block;
    flex-direction: unset;
  }

  .recent-post-item-image {
    width: 100%;
    height: 180px;
  }

  .leftImage {
    position: unset;
    left: unset;
  }

  .rightImage {
    position: unset;
    right: unset;
    text-align: unset;
    
    .category-badge {
      left: 15px;
      right: auto;
    }
  }

  .recent-post-item-post {
    width: 100%;
    height: 240px;
    position: relative;
    padding: 15px 20px;
  }

  .recent-post-desc {
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }
  
  .skeleton-item {
    flex-direction: column;
    height: 400px;
  }
  
  .skeleton-image,
  .skeleton-content {
    width: 100%;
  }
  
  .skeleton-image {
    height: 180px;
  }
}
</style>

<!-- 非scoped样式，确保动画优先级 -->
<style lang="scss">
.recent-post-item {
  height: 300px;
  position: relative;
  display: flex;
  flex-direction: row;
  user-select: none;
  cursor: pointer;
  overflow: hidden;
  border-radius: 10px;
  z-index: 2;
  
  /* 初始状态：隐藏在左侧 */
  opacity: 0;
  transform: translateX(-100px);
  transition: opacity 0.7s ease-out, transform 0.7s ease-out;
}

.recent-post-item:hover {
  z-index: 3;
}

/* 可见状态：显示在正常位置 */
.recent-post-item.article-visible {
  opacity: 1;
  transform: translateX(0);
}
</style>
