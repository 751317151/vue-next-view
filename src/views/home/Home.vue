<template>
  <div class="web-bg"></div>
  <IndexBack></IndexBack>
  <!-- 首页内容 -->
  <div class="page-container-wrap">
    <div class="page-container">
      <div class="recent-posts">
        <ArticleList :articleList="state.articleList"></ArticleList>
        <div class="pagination-wrap">
          <!-- 分页 -->
        </div>
      </div>
      <div class="aside-content" v-if="state.showAside">
        <MyAside></MyAside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useConfig } from "@/stores/config";
import common from "@/utils/common";
import constant from "@/utils/constant";

const router = useRouter();
const route = useRoute();
const storesConfig = useConfig();
const { toolbar, webInfo, sideNavBarShow, isMobile } =
  storeToRefs(storesConfig);

const state = reactive({
  articleList: [
    {
      id: 1,
      articleTitle: "标题",
      articleContent:
        "《百年孤独》，是哥伦比亚作家加西亚·马尔克斯创作的长篇小说，是其代表作，也是拉丁美洲魔幻现实主义文学的代表作，被誉为“再现拉丁美洲历史社会图景的鸿篇巨著”。",
      articleCover: "https://bu.dusays.com/2022/05/03/627010707b598.webp",
      createTime: "2022.02.02",
      viewCount: 99,
      commentCount: 99,
      likeCount: 99,
    },
    {
      id: 1,
      articleTitle: "标题",
      articleContent:
        "《百年孤独》，是哥伦比亚作家加西亚·马尔克斯创作的长篇小说，是其代表作，也是拉丁美洲魔幻现实主义文学的代表作，被誉为“再现拉丁美洲历史社会图景的鸿篇巨著”。",
      articleCover: "https://bu.dusays.com/2022/05/03/627010707b598.webp",
      createTime: "2022.02.02",
      viewCount: 99,
      commentCount: 99,
      likeCount: 99,
    },
    {
      id: 1,
      articleTitle: "标题",
      articleContent: "内容",
      articleCover: "https://bu.dusays.com/2022/05/03/627010707b598.webp",
      createTime: "2022.02.02",
      viewCount: 99,
      commentCount: 99,
      likeCount: 99,
    },
  ],
  showAside: true,
});
</script>

<style lang="scss" scoped>
.web-bg {
  background: url("https://tuchuang.xkyfzs.top/background/beijingtu2.jpg");
  position: fixed;
  width: 100%;
  height: 100%;
  background-attachment: local;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}
.page-container-wrap {
  // background: var(--background); /*主题配色切换，使用elemtnt-plus需要注释掉*/
  position: relative;
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
  margin-top: 40px;
  margin-left: 40px;
  max-width: 300px;
  float: right;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.recent-posts {
  width: 70%;
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
    margin: 40px auto 0;
  }
}

@media screen and (max-width: 768px) {
  h1 {
    font-size: 35px;
  }
}

.myFooter-wrap {
  background-color: transparent;
}
</style>
