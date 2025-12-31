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
        </el-image>
      </div>
      <!-- 内容 -->
      <div
        class="recent-post-item-post"
        :class="{
          leftImage: index % 2 === 0,
          rightImage: index % 2 !== 0,
        }"
      >
        <!-- 时间 -->
        <div class="post-meta">
          <SvgIcon style="vertical-align: -2px" icon-name="time"></SvgIcon>
          发布于 {{ article.createTime }}
        </div>
        <!-- 标题 -->
        <h3>{{ article.articleTitle }}</h3>

        <!-- 信息 -->
        <div class="post-meta" style="margin-bottom: 15px">
          <span>
            <SvgIcon style="vertical-align: -2px" icon-name="hot"></SvgIcon>
            {{ article.viewCount }} 热度
          </span>
          <span>
            <SvgIcon style="vertical-align: -2px" icon-name="comment"></SvgIcon>
            {{ article.commentCount }} 条评论
          </span>
          <span>
            <SvgIcon style="vertical-align: -2px" icon-name="like"></SvgIcon>
            {{ article.likeCount }} 点赞
          </span>
        </div>
        <!-- 内容 -->
        <div class="recent-post-desc">
          {{ article.articleContent }}
        </div>
        <!-- 分类 标签 -->
        <div class="sort-label">
          <span style="margin-right: 12px">
            <SvgIcon
              style="vertical-align: -2px"
              icon-name="folder"
              size="15"
            ></SvgIcon>
            分类
          </span>
          <span>
            <SvgIcon
              style="vertical-align: -2px"
              icon-name="tag"
              size="15"
            ></SvgIcon>
            标签2
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { ref, reactive, onMounted, onUnmounted, watch, nextTick } from "vue";
import common from "@/utils/common";
import constant from "@/utils/constant";

const router = useRouter();
const route = useRoute();

const props = defineProps({
  ArticleList: Array<Article>,
  ArticleList2: Array<Article>,
});

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
}

.recent-post-item-image :deep(.el-image__inner) {
  transition: all 1s;
}

.recent-post-item:hover :deep(.el-image__inner) {
  transform: scale(1.2);
}

.leftImage {
  position: absolute;
  left: 0;
}

.rightImage {
  position: absolute;
  right: 0;
  text-align: right;
}

.recent-post-item-post {
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px 35px;
}

.recent-post-item-post h3 {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.post-meta {
  font-size: 12px;
  color: var(--greyFont);
}

.post-meta i {
  font-size: 15px;
}

.post-meta span:not(:last-child) {
  margin-right: 10px;
}

.recent-post-desc {
  font-size: 15px;
  line-height: 1.7;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
}

.leftImage .sort-label {
  position: absolute;
  bottom: 20px;
}

.rightImage .sort-label {
  position: absolute;
  bottom: 20px;
  right: 35px;
}

.sort-label span {
  padding: 3px 10px;
  background-color: var(--maxLightGray);
  border-radius: 3px;
  font-size: 14px;
  color: var(--greyFont);
  transition: all 0.3s;
  cursor: pointer;
  user-select: none;
}

.sort-label span:hover {
  background-color: var(--themeBackground);
  color: var(--white);
}

.error-text {
  font-size: 20px;
  line-height: 1.8;
  letter-spacing: 8px;
  color: var(--white);
}

@media screen and (max-width: 700px) {
  .recent-post-item {
    height: 450px;
    position: unset;
    display: block;
    flex-direction: unset;
  }

  .recent-post-item-image {
    width: 100%;
    height: 200px;
  }

  .leftImage {
    position: unset;
    left: unset;
  }

  .rightImage {
    position: unset;
    right: unset;
    text-align: unset;
  }

  .recent-post-item-post {
    width: 100%;
    height: 250px;
    position: relative;
  }

  .recent-post-desc {
    -webkit-line-clamp: 3;
    line-clamp: 3;
  }

  .leftImage .sort-label {
    position: absolute;
    bottom: 20px;
  }

  .rightImage .sort-label {
    position: absolute;
    bottom: 20px;
    right: unset;
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
