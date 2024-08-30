<template>
  <div>
    <!-- 网站信息 -->
    <div class="card-content1 shadow-box background-opacity">
      <el-avatar
        style="margin-top: 20px"
        class="user-avatar"
        :size="120"
        :src="webInfo.avatar"
      ></el-avatar>
      <div class="web-name">网站名称</div>
      <div class="web-info">
        <div class="blog-info-box">
          <span>文章</span>
          <span class="blog-info-num">99</span>
        </div>
        <div class="blog-info-box">
          <span>分类</span>
          <span class="blog-info-num">99</span>
        </div>
      </div>
      <a class="collection-btn" @click="showTip()">
        <i class="el-icon-star-off" style="margin-right: 2px"></i>朋友圈
      </a>
    </div>

    <!-- 赞赏 -->
    <div
      class="shadow-box-mini background-opacity wow admire-box"
      v-if="!common.isEmpty(state.admires)"
    >
      <div style="font-weight: bold; margin-bottom: 20px">🧨赞赏名单</div>
      <div>
        <vue3-seamless-scroll
          :list="state.admires"
          style="height: 200px; overflow: hidden"
        >
          <div
            v-for="(item, i) in state.admires"
            style="display: flex; justify-content: space-between"
            :key="i"
          >
            <div style="display: flex">
              <el-avatar
                style="margin-bottom: 10px"
                :size="36"
                :src="item.avatar"
              ></el-avatar>
              <div
                style="
                  margin-left: 10px;
                  height: 36px;
                  line-height: 36px;
                  overflow: hidden;
                  max-width: 80px;
                "
              >
                {{ item.username }}
              </div>
            </div>
            <div style="height: 36px; line-height: 36px">
              {{ item.admire }}元
            </div>
          </div>
        </vue3-seamless-scroll>
      </div>
      <div class="admire-btn" @click="showAdmire()">赞赏</div>
    </div>

    <!-- 速览 -->
    <div
      :style="{
        background: constant.sortColor[0],
      }"
      class="shadow-box-mini background-opacity wow"
      style="
        position: relative;
        padding: 20px 25px 40px;
        border-radius: 10px;
        animation: hideToShow 1s ease-in-out;
        margin-top: 40px;
        cursor: pointer;
        color: var(--white);
      "
    >
      <div>速览</div>
      <div class="sort-name">标题</div>
      <div
        style="
          font-weight: bold;
          margin-top: 15px;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        "
      >
        描述
      </div>
    </div>

    <!-- 分类 -->
    <div
      class="shadow-box background-opacity wow"
      style="
        margin-top: 40px;
        padding: 25px 25px 5px;
        border-radius: 10px;
        animation: hideToShow 1s ease-in-out;
      "
    >
      <div class="card-content2-title">
        <i class="el-icon-folder-opened card-content2-icon"></i>
        <span>分类</span>
      </div>
      <div
        class="post-sort"
        @click="router.push({ path: '/sort', query: { sortId: 1 } })"
      >
        <div>
          <span>具体分类</span>
        </div>
      </div>
    </div>

    <!-- 推荐文章 -->
    <div
      v-if="!common.isEmpty(state.recommendArticles)"
      style="
        padding: 25px;
        border-radius: 10px;
        margin-top: 40px;
        animation: hideToShow 1s ease-in-out;
      "
      class="shadow-box background-opacity wow"
    >
      <div class="card-content2-title">
        <i class="el-icon-reading card-content2-icon"></i>
        <span>推荐文章</span>
      </div>
      <div
        v-for="(article, index) in state.recommendArticles"
        :key="index"
        @click="$router.push({ path: '/article', query: { id: article.id } })"
      >
        <div class="aside-post-detail">
          <div class="aside-post-image">
            <el-image
              lazy
              class="my-el-image"
              :src="article.articleCover"
              fit="cover"
            >
            </el-image>
          </div>
          <div class="aside-post-title">
            {{ article.articleTitle }}
          </div>
        </div>
        <div class="aside-post-date">
          <i class="el-icon-date" style="color: var(--greyFont)"></i
          >{{ article.createTime }}
        </div>
      </div>
    </div>

    <!-- 微信 -->
    <el-dialog
      title="赞赏"
      v-model="state.showAdmireDialog"
      width="25%"
      :append-to-body="true"
      destroy-on-close
      center
    >
      <div>
        <div class="admire-image"></div>
        <div>
          <div class="admire-content">1. 感谢老铁送来的666</div>
          <div class="admire-content">
            2.
            申请通过后会加博客交流群，不需要加群或者退群后会定期清理好友（强迫症福利）
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Vue3SeamlessScroll } from "vue3-seamless-scroll";
import { onMounted, watch, reactive, ref } from "vue";
import { storeToRefs } from "pinia";
import { useConfig } from "@/stores/config";
import common from "@/utils/common";
import constant from "@/utils/constant";
import { ElMessage } from "element-plus";

const router = useRouter();
const route = useRoute();
const storesConfig = useConfig();
const { webInfo, sortInfo, currentUser } = storeToRefs(storesConfig);

const state = reactive({
  pagination: {
    current: 1,
    size: 5,
    recommendStatus: true,
  },
  recommendArticles: [
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
  admires: [
    {
      avatar: "https://haiyong.site/img/favicon.png",
      username: "blackstar",
      admire: 122,
    },
  ],
  showAdmireDialog: false,
});

const showAdmire = () => {
  if (common.isEmpty(currentUser.value)) {
    ElMessage.error("请先登录！");
    return;
  }

  state.showAdmireDialog = true;
};
const getAdmire = () => {};
const getRecommendArticles = () => {};
const showTip = () => {};

getRecommendArticles();
getAdmire();
</script>

<style lang="scss" scoped>
.card-content1 {
  background: linear-gradient(-45deg, #b7d3ee, #5d6fc9, #ebfffe, #485dab);
  background-size: 400% 400%;
  animation: gradientBG 5s ease infinite;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 10px;
  position: relative;
  /*color: var(--white);*/
  overflow: hidden;
}

.card-content1 :not(:first-child) {
  z-index: 10;
}

.web-name {
  font-size: 30px;
  font-weight: bold;
  margin: 20px 0;
}

.web-info {
  width: 80%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}

.blog-info-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
}

.blog-info-num {
  margin-top: 12px;
}

.collection-btn {
  position: relative;
  margin-top: 12px;
  background: var(--lightGreen);
  cursor: pointer;
  width: 65%;
  height: 35px;
  border-radius: 1rem;
  text-align: center;
  line-height: 35px;
  color: var(--white);
  overflow: hidden;
  z-index: 1;
  margin-bottom: 25px;
}

.collection-btn::before {
  background: var(--gradualRed);
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  content: "";
  transform: scaleX(0);
  transform-origin: 0;
  transition: transform 0.5s ease-out;
  transition-timing-function: cubic-bezier(0.45, 1.64, 0.47, 0.66);
  border-radius: 1rem;
  z-index: -1;
}

.collection-btn:hover::before {
  transform: scaleX(1);
}

.card-content2-title {
  font-size: 18px;
  margin-bottom: 20px;
}

.card-content2-icon {
  color: var(--red);
  margin-right: 5px;
  animation: scale 1s ease-in-out infinite;
}

.aside-post-detail {
  display: flex;
  cursor: pointer;
}

.aside-post-image {
  width: 40%;
  border-radius: 0.2rem;
  margin-right: 8px;
  overflow: hidden;
}

.error-aside-image {
  background: var(--themeBackground);
  color: var(--white);
  padding: 10px;
  text-align: center;
  width: 100%;
  height: 100%;
}

.aside-post-title {
  width: 60%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.aside-post-date {
  margin-top: 8px;
  margin-bottom: 20px;
  color: var(--greyFont);
  font-size: 12px;
}

.post-sort {
  border-radius: 1rem;
  margin-bottom: 15px;
  line-height: 30px;
  transition: all 0.3s;
}

.post-sort:hover {
  background: var(--themeBackground);
  padding: 2px 15px;
  cursor: pointer;
  color: var(--white);
}

.sort-name {
  font-weight: bold;
  font-size: 25px;
  margin-top: 30px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.sort-name:after {
  top: 98px;
  width: 22px;
  left: 26px;
  height: 2px;
  background: var(--white);
  content: "";
  border-radius: 1px;
  position: absolute;
}

.admire-box {
  background: var(--springBg) center center / cover no-repeat;
  padding: 25px;
  border-radius: 10px;
  animation: hideToShow 1s ease-in-out;
  margin-top: 40px;
}

.admire-btn {
  padding: 13px 15px;
  background: var(--maxLightRed);
  border-radius: 3rem;
  color: var(--white);
  width: 100px;
  user-select: none;
  cursor: pointer;
  text-align: center;
  margin: 20px auto 0;
  transition: all 1s;
}

.admire-btn:hover {
  transform: scale(1.2);
}

.admire-image {
  margin: 0 auto 10px;
  border-radius: 10px;
  height: 150px;
  width: 150px;
  background: var(--admireImage) center center / cover no-repeat;
}

.admire-content {
  font-size: 12px;
  color: var(--maxGreyFont);
  line-height: 1.5;
  margin: 5px;
}
</style>
