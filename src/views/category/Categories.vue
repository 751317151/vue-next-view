<template>
  <div>
    <!-- 两句诗 -->
    <div class="my-animation-slide-top">
      <CommonHead :typeName="'分类'"></CommonHead>
    </div>
    <div
      style="background-color: var(--background); padding-top: 40px"
      class="my-animation-slide-bottom"
    >
      <div class="page-container">
        <!-- 标签 -->
        <div
          class="sort-warp shadow-box"
          v-if="!common.isEmpty(state.Categories)"
        >
          <div
            v-for="(category, index) in state.Categories"
            :key="index"
            @click="
              $router.push({
                path: '/categories/' + category.id,
              })
            "
          >
            <ProTag
              :info="category.categoryName"
              :color="constant.before_color_list[Math.floor(Math.random() * 6)]"
              style="margin: 12px"
            >
            </ProTag>
          </div>
        </div>

        <!-- 文章 -->
        <div class="article-wrap"></div>
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
const { Categories } = storeToRefs(storesConfig);

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
  Categories: new Array<Category>(),
});

const getCategories = () => {
  if (!common.isEmpty(Categories.value)) {
    state.Categories = Categories.value;
  }
};

onMounted(() => {
  getCategories();
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
