<template>
  <div>
    <!-- 两句诗 -->
    <div class="my-animation-slide-top">
      <TwoPoem :isHitokoto="true"></TwoPoem>
    </div>
    <div style="padding-top: 40px" class="my-animation-slide-bottom">
      <div class="page-container">
        <!-- 标签 -->
        <div class="shadow-box tags-nav" v-if="!common.isEmpty(state.Tags)">
          <ProTag
            v-for="(tag, index) in state.Tags"
            :key="index"
            @click="refresh(tag.id)"
            :info="tag.tagName"
            :color="constant.before_color_list[Math.floor(Math.random() * 6)]"
            style="margin: 12px"
          >
          </ProTag>
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
const { Tags } = storeToRefs(storesConfig);

const router = useRouter();
const route = useRoute();

const state = reactive({
  articleList: [],
  Tags: new Array<Tag>(),
  pagination: {
    current: 1,
    size: 10,
    total: 0,
    searchKey: "",
  },
});

const pageArticles = () => {
  state.pagination.current = state.pagination.current + 1;
  getArticles(route.params.id);
};

const getTags = () => {
  if (!common.isEmpty(Tags.value)) {
    state.Tags = Tags.value;
  }
};

const getArticles = (id) => {
  if (id == 1) {
    state.articleList = [
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
    ];
  } else {
    state.articleList = [
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
    ];
  }
};
const refresh = (id) => {
  getArticles(id);
  router.push("/tags/" + id);
};

onMounted(() => {
  getTags();
  getArticles(route.params.id);
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
}
.tags-nav:hover {
  max-height: 1000px;
  transition: 0.3s ease-out;
}
</style>
