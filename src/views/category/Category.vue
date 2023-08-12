<template>
  <div>
    <!-- 两句诗 -->
    <div class="my-animation-slide-top">
      <TwoPoem :isHitokoto="true"></TwoPoem>
    </div>
    <div
      style="background-color: var(--background); padding-top: 40px"
      class="my-animation-slide-bottom"
    >
      <div class="page-container">
        <!-- 标签 -->
        <div
          class="sort-warp shadow-box"
          v-if="
            !common.isEmpty(state.sort) && !common.isEmpty(state.sort.labels)
          "
        >
          <div
            v-for="(label, index) in state.sort.labels"
            :key="index"
            :class="{
              isActive:
                !common.isEmpty(state.labelId) &&
                parseInt(state.labelId) === label.id,
            }"
            @click="listArticle(label)"
          >
            <ProTag
              :info="label.labelName + ' ' + label.countOfLabel"
              :color="constant.before_color_list[Math.floor(Math.random() * 6)]"
              style="margin: 12px"
            >
            </ProTag>
          </div>
        </div>

        <!-- 文章 -->
        <div class="article-wrap">
          <articleList :articleList="state.articleList"></articleList>
          <div class="pagination-wrap">
            <div
              @click="pageArticles()"
              class="pagination"
              v-if="state.pagination.total !== state.articleList.length"
            >
              下一页
            </div>
            <div v-else style="user-select: none">~~到底啦~~</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useConfig } from "@/stores/config";
import common from "@/utils/common";
import constant from "@/utils/constant";

const storesConfig = useConfig();
const { sortInfo } = storeToRefs(storesConfig);

const router = useRouter();
const route = useRoute();

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
  sortId: route.query.sortId || 3,
  labelId: route.query.labelId || 8,
  sort: null,
  pagination: {
    current: 1,
    size: 10,
    total: 0,
    searchKey: "",
    sortId: route.query.sortId,
    labelId: route.query.labelId,
  },
});

const pageArticles = () => {
  state.pagination.current = state.pagination.current + 1;
  getArticles();
};

const getSort = () => {
  if (!common.isEmpty(sortInfo.value)) {
    let sortArray = sortInfo.value.filter((f) => {
      return f.id === parseInt(state.sortId);
    });
    if (!common.isEmpty(sortArray)) {
      state.sort = sortArray[0];
    }
  }
};
const listArticle = (label) => {};
const getArticles = () => {};

onMounted(() => {
  getSort();
});
</script>

<style lang="scss" scoped>
.page-container {
  justify-content: center;
  width: 90%;
  padding: 0 20px 40px 20px;
  margin: 0 auto;
  flex-direction: row;
  max-width: 1200px;
}
.sort-warp {
  margin: 0 auto;
  padding: 20px;
  border-radius: 10px;
  display: flex;
  flex-wrap: wrap;
}

.article-wrap {
  margin: 40px auto 0 auto;
  min-height: 600px;
  padding-bottom: 40px;
}

.isActive {
  animation: scale 1.5s ease-in-out infinite;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.pagination {
  padding: 13px 15px;
  border: 1px solid var(--lightGray);
  border-radius: 3rem;
  color: var(--greyFont);
  width: 100px;
  user-select: none;
  cursor: pointer;
  text-align: center;
}

.pagination:hover {
  border: 1px solid var(--themeBackground);
  color: var(--themeBackground);
  box-shadow: 0 0 5px var(--themeBackground);
}

@media screen and (max-width: 900px) {
  .sort-warp {
    width: 90%;
  }

  .article-wrap {
    width: 90%;
  }
}
</style>
