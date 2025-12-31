<template>
  <div>
    <!-- 两句诗 -->
    <div class="my-animation-slide-top">
      <TwoPoem :isHitokoto="true"></TwoPoem>
    </div>
    <div style="padding-top: 40px" class="my-animation-slide-bottom">
      <div class="page-container">
        <!-- 标签 -->
        <div class="shadow-box tags-nav" v-if="!common.isEmpty(Tags)">
          <ProTag
            v-for="(tag, index) in Tags"
            :key="index"
            @click="refresh(tag.id)"
            :info="tag.tagName"
            :color="constant.before_color_list[Math.floor(Math.random() * 6)]"
            style="margin: 12px"
            :class="{ active: currentTagId === tag.id }"
          >
          </ProTag>
        </div>

        <!-- 当前标签信息 -->
        <div class="current-tag-info" v-if="currentTag">
          <h2>{{ currentTag.tagName }}</h2>
          <p>共找到 {{ state.pagination.total }} 篇相关文章</p>
        </div>

        <!-- 文章 -->
        <div class="article-wrap">
          <ArticleList :ArticleList="state.articleList"></ArticleList>
          <div class="pagination-wrap">
            <div
              @click="pageArticles()"
              class="pagination"
              v-if="state.pagination.total > state.articleList.length"
            >
              加载更多
            </div>
            <div v-else-if="state.articleList.length > 0" class="no-more">
              ~~到底啦~~
            </div>
            <div v-else class="no-articles">
              暂无相关文章
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useConfig } from "@/stores/config";
import common from "@/utils/common";
import constant from "@/utils/constant";
import ArticleList from "@/components/ArticleList.vue";

const storesConfig = useConfig();
const { Tags } = storeToRefs(storesConfig);

const router = useRouter();
const route = useRoute();

const state = reactive({
  articleList: Array<Article>(),
  pagination: {
    current: 1,
    size: 10,
    total: 0,
    searchKey: "",
  },
  loading: false,
});

const currentTagId = computed(() => Number(route.params.id));
const currentTag = computed(() => 
  Tags.value.find(tag => tag.id === currentTagId.value)
);

const pageArticles = () => {
  if (state.loading) return;
  state.pagination.current = state.pagination.current + 1;
  getArticles(currentTagId.value);
};

const getArticles = (id: number) => {
  state.loading = true;
  
  // 模拟根据标签ID获取文章
  const allArticles = [
    {
      id: 1,
      articleTitle: "Vue 3 Composition API 深度解析",
      articleContent:
        "Vue 3 的 Composition API 为我们提供了更灵活的组件逻辑组织方式。本文将深入探讨 Composition API 的设计理念、使用方法以及与 Options API 的区别，帮助开发者更好地理解和使用这一新特性。",
      articleCover: "https://picsum.photos/800/400?random=10",
      createTime: "2024.12.20",
      viewCount: 856,
      commentCount: 12,
      likeCount: 45,
      category: "前端开发",
      tags: ["Vue3", "Composition API"],
    },
    {
      id: 2,
      articleTitle: "TypeScript 高级类型系统实战",
      articleContent:
        "TypeScript 的类型系统是其最强大的特性之一。本文将介绍泛型、联合类型、交叉类型、条件类型等高级特性，并通过实际案例展示如何在项目中有效使用这些类型工具。",
      articleCover: "https://picsum.photos/800/400?random=11",
      createTime: "2024.12.18",
      viewCount: 1234,
      commentCount: 18,
      likeCount: 67,
      category: "前端开发",
      tags: ["TypeScript", "类型系统"],
    },
    {
      id: 3,
      articleTitle: "前端性能优化最佳实践",
      articleContent:
        "前端性能优化是提升用户体验的关键。本文将从资源加载、代码分割、缓存策略、图片优化等多个维度，系统性地介绍前端性能优化的方法和技巧。",
      articleCover: "https://picsum.photos/800/400?random=12",
      createTime: "2024.12.15",
      viewCount: 2156,
      commentCount: 25,
      likeCount: 89,
      category: "前端开发",
      tags: ["性能优化", "用户体验"],
    },
    {
      id: 4,
      articleTitle: "JavaScript 设计模式详解",
      articleContent:
        "设计模式是解决特定问题的可复用解决方案。本文将详细介绍JavaScript中常用的设计模式，包括单例模式、观察者模式、工厂模式等，并提供实际应用场景。",
      articleCover: "https://picsum.photos/800/400?random=13",
      createTime: "2024.12.12",
      viewCount: 945,
      commentCount: 16,
      likeCount: 58,
      category: "JavaScript",
      tags: ["设计模式", "JavaScript"],
    },
    {
      id: 5,
      articleTitle: "CSS Grid 布局完全指南",
      articleContent:
        "CSS Grid 是现代网页布局的强大工具。本文将从基础概念开始，逐步深入到高级应用，帮助读者掌握Grid布局的各种技巧和最佳实践。",
      articleCover: "https://picsum.photos/800/400?random=14",
      createTime: "2024.12.10",
      viewCount: 1567,
      commentCount: 22,
      likeCount: 78,
      category: "CSS",
      tags: ["CSS", "布局", "Grid"],
    },
  ];

  // 模拟API延迟
  setTimeout(() => {
    // 根据标签ID返回不同的文章
    let filteredArticles = [];
    if (id == 1) { // 生活倒影
      filteredArticles = allArticles.slice(0, 2);
    } else if (id == 2) { // java
      filteredArticles = allArticles.slice(2, 4);
    } else if (id == 3) { // python
      filteredArticles = allArticles.slice(1, 3);
    } else if (id == 4) { // javascript
      filteredArticles = allArticles.filter(article => 
        article.tags.some(tag => tag.toLowerCase().includes('javascript'))
      );
    } else {
      filteredArticles = allArticles.slice(0, 3);
    }

    // 分页处理
    const startIndex = (state.pagination.current - 1) * state.pagination.size;
    const endIndex = startIndex + state.pagination.size;
    const pageArticles = filteredArticles.slice(startIndex, endIndex);

    if (state.pagination.current === 1) {
      state.articleList = pageArticles;
    } else {
      state.articleList = [...state.articleList, ...pageArticles];
    }
    
    state.pagination.total = filteredArticles.length;
    state.loading = false;
  }, 500);
};

const refresh = (id: number) => {
  if (id === currentTagId.value) return;
  
  state.pagination.current = 1;
  state.articleList = [];
  router.push("/tags/" + id);
};

onMounted(() => {
  getArticles(currentTagId.value);
});

// 监听路由变化
watch(() => route.params.id, (newId) => {
  if (newId) {
    state.pagination.current = 1;
    state.articleList = [];
    getArticles(Number(newId));
  }
});
</script>

<style lang="scss" scoped>
.page-container {
  justify-content: center;
  width: 90%;
  margin: 0 auto;
  flex-direction: row;
  max-width: 1200px;
  padding: 4rem 2rem 1rem 2rem;
  position: relative;
}

.tags-nav {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  position: absolute;
  z-index: 1;
  top: 0;
  max-height: 68px;
  overflow: hidden;
  backdrop-filter: saturate(180%) blur(20px);
  transition: 0.1s ease-out;
  width: calc(100% - 64px);
  justify-content: center;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  &:hover {
    max-height: 1000px;
    transition: 0.3s ease-out;
  }
  
  :deep(.myTag.active) {
    background: var(--themeBackground) !important;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.current-tag-info {
  margin-top: 100px;
  margin-bottom: 30px;
  text-align: center;
  padding: 20px;
  background: var(--background);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  h2 {
    color: var(--themeBackground);
    margin: 0 0 10px 0;
    font-size: 28px;
    font-weight: bold;
  }
  
  p {
    color: var(--text-color-secondary);
    margin: 0;
    font-size: 14px;
  }
}

.article-wrap {
  margin: 40px auto 0 auto;
  min-height: 600px;
  padding-bottom: 40px;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.pagination {
  padding: 13px 25px;
  border: 1px solid var(--lightGray);
  border-radius: 3rem;
  color: var(--greyFont);
  user-select: none;
  cursor: pointer;
  text-align: center;
  background: var(--background);
  transition: all 0.3s ease;
  
  &:hover {
    border: 1px solid var(--themeBackground);
    color: var(--themeBackground);
    box-shadow: 0 0 5px var(--themeBackground);
    transform: translateY(-2px);
  }
}

.no-more {
  color: var(--text-color-secondary);
  font-size: 14px;
  user-select: none;
  text-align: center;
  padding: 20px;
}

.no-articles {
  color: var(--text-color-secondary);
  font-size: 16px;
  text-align: center;
  padding: 60px 20px;
  background: var(--background);
  border-radius: 10px;
  border: 1px dashed var(--border-color);
}

@media screen and (max-width: 900px) {
  .tags-nav {
    width: calc(100% - 32px);
    position: relative;
    max-height: none;
    margin-bottom: 20px;
  }
  
  .current-tag-info {
    margin-top: 20px;
  }
  
  .article-wrap {
    margin-top: 20px;
  }
}

@media screen and (max-width: 768px) {
  .page-container {
    padding: 2rem 1rem 1rem 1rem;
  }
  
  .current-tag-info {
    h2 {
      font-size: 24px;
    }
  }
}
</style>