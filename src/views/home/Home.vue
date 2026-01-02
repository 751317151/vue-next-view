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
import { getArticleList } from "@/api";
import type { Article } from "@/types";

const state = reactive({
  articleList: [] as Article[],
  showAside: true,
  pagination: {
    current: 1,
    size: 6,
    total: 0,
  },
  loading: false,
});

// 处理分页变化
const handlePageChange = (page: number) => {
  state.pagination.current = page;
  loadArticles();
};

// 加载文章数据
const loadArticles = async () => {
  state.loading = true;
  try {
    const { list, total } = await getArticleList({
      page: state.pagination.current,
      size: state.pagination.size,
    });
    state.articleList = list;
    state.pagination.total = total;
  } finally {
    state.loading = false;
  }
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

/* 平板/移动端布局切换 - 与 isMobile 断点一致 */
@media screen and (max-width: 1050px) {
  .recent-posts {
    width: 100%;
  }

  .page-container {
    width: 100%;
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

/* 小屏手机优化 */
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