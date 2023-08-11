<template>
  <div v-if="!common.isEmpty(articleList)" class="recent-post-container">
    <div
      class="recent-post-item shadow-box background-opacity"
      v-for="(article, index) in articleList"
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
import { toRefs } from "vue";
import common from "@/utils/common";

const props = defineProps({
  //子组件接收父组件传递过来的值
  articleList: [],
});
//使用父组件传递过来的值
const { articleList } = toRefs(props);
</script>

<style scoped>
.article-first {
  color: var(--greyFont);
  border-bottom: 1px dashed var(--lightGray);
  padding-bottom: 5px;
  margin-bottom: 50px;
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
</style>
