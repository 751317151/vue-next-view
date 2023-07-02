<template>
  <IndexBack></IndexBack>
  <!-- 首页内容 -->
  <div class="page-container-wrap">
    <div class="page-container">
      <div class="recent-posts">
        <div class="recent-post-container">
          <div
            class="recent-post-item shadow-box background-opacity"
            v-for="(article, index) in state.articleList"
            :key="index"
            :class="{
              'my-animation-slide-top': index % 2 !== 0,
              'my-animation-slide-bottom': index % 2 === 0,
            }"
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
                <SvgIcon
                  style="vertical-align: -2px"
                  icon-name="time"
                ></SvgIcon>
                发布于 {{ article.createTime }}
              </div>
              <!-- 标题 -->
              <h3>{{ article.articleTitle }}</h3>

              <!-- 信息 -->
              <div class="post-meta" style="margin-bottom: 15px">
                <span>
                  <SvgIcon
                    style="vertical-align: -2px"
                    icon-name="hot"
                  ></SvgIcon>
                  {{ article.viewCount }} 热度
                </span>
                <span>
                  <SvgIcon
                    style="vertical-align: -2px"
                    icon-name="comment"
                  ></SvgIcon>
                  {{ article.commentCount }} 条评论
                </span>
                <span>
                  <SvgIcon
                    style="vertical-align: -2px"
                    icon-name="like"
                  ></SvgIcon>
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
.recent-post-container {
  max-width: 780px;
  margin: auto;
  margin-top: 50px;
}

.recent-post-container .recent-post-item:not(:last-child) {
  margin-bottom: 40px;
}

.recent-post-item {
  height: 300px;
  position: relative;
  display: flex;
  flex-direction: row;
  user-select: none;
  cursor: pointer;
  overflow: hidden;
  border-radius: 10px;
  animation: hideToShow 1s ease-in-out;
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
  /* 超出4行就... */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 4;
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
</style>
