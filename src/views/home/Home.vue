<template>
  <!-- <div class="web-bg"></div> -->
  <IndexBack></IndexBack>
  <!-- 首页内容 -->
  <div class="page-container-wrap">
    <div class="page-container">
      <div class="recent-posts">
        <ArticleList :ArticleList="state.articleList"></ArticleList>
        <div class="pagination-wrap">
          <!-- 分页 -->
          <Pagination 
            :current="state.pagination.current"
            :total="state.pagination.total"
            :pageSize="state.pagination.size"
            @change="handlePageChange"
          ></Pagination>
        </div>
      </div>
      <div class="aside-content" v-if="state.showAside">
        <MyAside></MyAside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from "vue";

const state = reactive({
  articleList: [
    {
      id: 1,
      articleTitle: "Vue 3 + TypeScript 开发实战指南",
      articleContent:
        "Vue 3 带来了许多令人兴奋的新特性，包括 Composition API、更好的 TypeScript 支持、性能优化等。本文将详细介绍如何使用 Vue 3 和 TypeScript 构建现代化的前端应用，涵盖项目搭建、组件开发、状态管理等核心内容。",
      articleCover: "https://picsum.photos/800/400?random=1",
      createTime: "2024.12.28",
      viewCount: 1256,
      commentCount: 23,
      likeCount: 89,
      category: "前端开发",
      tags: ["Vue3", "TypeScript", "前端"],
    },
    {
      id: 2,
      articleTitle: "现代 CSS 布局技巧与最佳实践",
      articleContent:
        "CSS Grid 和 Flexbox 已经成为现代网页布局的标准工具。本文深入探讨了这两种布局方式的使用场景、技巧和最佳实践，帮助开发者创建更加灵活和响应式的网页布局。同时还介绍了一些新兴的 CSS 特性。",
      articleCover: "https://picsum.photos/800/400?random=2",
      createTime: "2024.12.25",
      viewCount: 892,
      commentCount: 15,
      likeCount: 67,
      category: "前端开发",
      tags: ["CSS", "布局", "响应式"],
    },
    {
      id: 3,
      articleTitle: "JavaScript 异步编程深度解析",
      articleContent:
        "异步编程是 JavaScript 的核心概念之一。从回调函数到 Promise，再到 async/await，JavaScript 的异步处理方式不断演进。本文将系统性地介绍 JavaScript 异步编程的各种模式，帮助读者深入理解异步编程的本质。",
      articleCover: "https://picsum.photos/800/400?random=3",
      createTime: "2024.12.22",
      viewCount: 1543,
      commentCount: 31,
      likeCount: 124,
      category: "JavaScript",
      tags: ["JavaScript", "异步编程", "Promise"],
    },
    {
      id: 4,
      articleTitle: "Node.js 性能优化实战经验分享",
      articleContent:
        "Node.js 在服务端开发中越来越受欢迎，但性能优化往往是开发者面临的挑战。本文基于实际项目经验，分享了 Node.js 应用的性能优化策略，包括内存管理、事件循环优化、数据库查询优化等方面的实用技巧。",
      articleCover: "https://picsum.photos/800/400?random=4",
      createTime: "2024.12.20",
      viewCount: 756,
      commentCount: 18,
      likeCount: 52,
      category: "后端开发",
      tags: ["Node.js", "性能优化", "服务端"],
    },
    {
      id: 5,
      articleTitle: "设计模式在前端开发中的应用",
      articleContent:
        "设计模式是软件开发中的重要概念，在前端开发中同样有着广泛的应用。本文介绍了观察者模式、单例模式、工厂模式等常用设计模式在前端项目中的具体应用场景，帮助开发者写出更加优雅和可维护的代码。",
      articleCover: "https://picsum.photos/800/400?random=5",
      createTime: "2024.12.18",
      viewCount: 634,
      commentCount: 12,
      likeCount: 43,
      category: "编程思想",
      tags: ["设计模式", "前端架构", "代码质量"],
    },
    {
      id: 6,
      articleTitle: "微前端架构设计与实践",
      articleContent:
        "随着前端应用规模的不断增长，微前端架构成为了解决大型前端项目复杂性的有效方案。本文详细介绍了微前端的核心概念、技术选型、架构设计以及在实际项目中的落地经验，为团队采用微前端提供参考。",
      articleCover: "https://picsum.photos/800/400?random=6",
      createTime: "2024.12.15",
      viewCount: 987,
      commentCount: 25,
      likeCount: 78,
      category: "前端架构",
      tags: ["微前端", "架构设计", "团队协作"],
    },
  ],
  showAside: true,
  pagination: {
    current: 1,
    size: 6,
    total: 50,
  },
  loading: false,
});

// 处理分页变化
const handlePageChange = (page: number) => {
  state.pagination.current = page;
  loadArticles();
};

// 模拟加载文章数据
const loadArticles = () => {
  state.loading = true;
  // 模拟API调用
  setTimeout(() => {
    // 这里可以根据分页参数加载不同的数据
    state.loading = false;
  }, 500);
};

onMounted(() => {
  loadArticles();
});
</script>

<style lang="scss" scoped>
.page-container-wrap {
  // background: var(--background); /*主题配色切换，使用elemtnt-plus需要注释掉*/
  position: relative;
  min-height: calc(100vh - 60px);
}

.page-container {
  display: flex;
  justify-content: center;
  width: 90%;
  padding: 0 20px 40px 20px;
  margin: 0 auto;
  flex-direction: row;
  max-width: 1200px;
}

.aside-content {
  width: calc(30% - 40px);
  user-select: none;
  margin-top: 50px;
  margin-left: 40px;
  max-width: 300px;
  float: right;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  padding: 20px 0;
}

.recent-posts {
  width: 70%;
  min-height: 600px;
  position: relative;
  z-index: 1;
  
  // 确保文章内容正确显示
  .recent-post-container {
    opacity: 1;
    visibility: visible;
    transform: translateZ(0); // 强制硬件加速
  }
}

@media screen and (max-width: 1100px) {
  .recent-posts {
    width: 100%;
  }

  .page-container {
    width: 100%;
  }
}

@media screen and (max-width: 1000px) {
  .page-container {
    /* 文章栏与侧标栏垂直排列 */
    flex-direction: column;
  }

  .aside-content {
    width: 100%;
    max-width: unset;
    float: unset;
    margin: 50px auto 0;
  }
}

@media screen and (max-width: 768px) {
  h1 {
    font-size: 35px;
  }
  
  .page-container {
    padding: 0 10px 40px 10px;
  }
}

.myFooter-wrap {
  background-color: transparent;
}
</style>