<template>
  <div>
    <div class="favorite-container">
      <!-- 封面 -->
      <div class="favorite-header my-animation-slide-top">
        <!-- 背景图片 -->
        <video
          class="index-video"
          autoplay="autoplay"
          muted="muted"
          loop="loop"
          :src="constant.favoriteVideo"
        ></video>
        <div style="position: absolute; left: 0; top: 0; padding: 20px">
          <!-- 标题 -->
          <div style="color: var(--white); margin: 10px">
            <div>记录</div>
            <div style="font-size: 36px; font-weight: bold; line-height: 2">
              百宝箱
            </div>
          </div>
          <div class="card-container">
            <!-- 收藏夹 -->
            <div @click="changeFavorite(1)" class="card-item">
              <div class="favorite-image"></div>
              <div
                style="
                  position: absolute;
                  left: 0;
                  top: 0;
                  padding: 20px 25px 15px;
                "
              >
                <div class="card-name">收藏夹</div>
                <div class="card-desc">
                  将 blackstar.nyc.mn 添加到您的收藏夹吧
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 内容 -->
      <div class="favorite-content my-animation-slide-bottom">
        <!-- 收藏夹 -->
        <div v-show="state.card === 1 && !common.isEmpty(state.collects)">
          <div
            v-for="(value, key) in state.collects"
            :key="key"
            style="margin-top: 20px"
          >
            <div class="collect-classify">
              {{ key }}
            </div>
            <div class="favorite-item-wrap">
              <div
                v-for="(item, index) in value"
                :key="index"
                @click="toUrl(item.url)"
                class="favorite-item"
              >
                <div>
                  <el-avatar
                    class="favorite-item-image"
                    :size="60"
                    :src="item.cover"
                  >
                    <template #error>
                      <div class="avatar-fallback">
                        <i class="el-icon-link"></i>
                      </div>
                    </template>
                  </el-avatar>
                </div>
                <div style="width: calc(100% - 80px)">
                  <div class="favorite-item-title">
                    {{ item.title }}
                  </div>
                  <div class="favorite-item-introduction">
                    {{ item.introduction }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from "vue";
import common from "@/utils/common";
import constant from "@/utils/constant";

const state = reactive({
  card: 1,
  collects: {},
});

const toUrl = (url) => {
  window.open(url);
};
const changeFavorite = (card) => {
  state.card = card;
  if (card === 1) {
    if (common.isEmpty(state.collects)) {
      getCollect();
    }
  }
};
const getCollect = () => {
  // 模拟收藏数据
  state.collects = {
    "开发工具": [
      {
        title: "Visual Studio Code",
        introduction: "微软开发的免费代码编辑器，支持多种编程语言",
        url: "https://code.visualstudio.com/",
        cover: "https://code.visualstudio.com/assets/images/code-stable.png"
      },
      {
        title: "GitHub",
        introduction: "全球最大的代码托管平台，开发者必备",
        url: "https://github.com/",
        cover: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
      },
      {
        title: "Figma",
        introduction: "在线协作设计工具，UI/UX设计师首选",
        url: "https://www.figma.com/",
        cover: "https://cdn.worldvectorlogo.com/logos/figma-1.svg"
      },
      {
        title: "Postman",
        introduction: "API开发和测试工具，简化API工作流程",
        url: "https://www.postman.com/",
        cover: "https://www.postman.com/assets/logos/postman-logo-stacked.svg"
      }
    ],
    "学习资源": [
      {
        title: "MDN Web Docs",
        introduction: "Mozilla维护的Web技术文档，权威且全面",
        url: "https://developer.mozilla.org/",
        cover: "https://developer.mozilla.org/mdn-social-share.cd6c4a5a.png"
      },
      {
        title: "Vue.js 官方文档",
        introduction: "Vue.js框架的官方文档，学习Vue的最佳资源",
        url: "https://vuejs.org/",
        cover: "https://vuejs.org/logo.svg"
      },
      {
        title: "TypeScript 官方文档",
        introduction: "TypeScript的官方文档，深入学习类型系统",
        url: "https://www.typescriptlang.org/",
        cover: "https://www.typescriptlang.org/icons/icon-512x512.png"
      },
      {
        title: "CSS-Tricks",
        introduction: "CSS技巧和前端开发技术分享网站",
        url: "https://css-tricks.com/",
        cover: "https://css-tricks.com/wp-content/uploads/2019/06/akqcss.png"
      }
    ],
    "设计灵感": [
      {
        title: "Dribbble",
        introduction: "设计师作品展示平台，寻找设计灵感的好地方",
        url: "https://dribbble.com/",
        cover: "https://cdn.dribbble.com/assets/dribbble-ball-mark-2bd45f09c2fb58dbbfb44766d5d1d07c5a12972d602ef8b32204d28fa3dda554.svg"
      },
      {
        title: "Behance",
        introduction: "Adobe旗下的创意作品展示平台",
        url: "https://www.behance.net/",
        cover: "https://a5.behance.net/2acd763c2a24b9e75b8e5e8b8e8e8e8e/img/site/apple-touch-icon.png"
      },
      {
        title: "Awwwards",
        introduction: "展示优秀网页设计的获奖网站",
        url: "https://www.awwwards.com/",
        cover: "https://assets.awwwards.com/awards/images/2014/09/awwwards-logo-2014.svg"
      },
      {
        title: "UI Movement",
        introduction: "UI动画和交互设计灵感收集",
        url: "https://uimovement.com/",
        cover: "https://uimovement.com/static/website/images/ui-movement-logo.svg"
      }
    ],
    "实用工具": [
      {
        title: "Can I Use",
        introduction: "查询CSS、HTML5、JS等Web技术的浏览器兼容性",
        url: "https://caniuse.com/",
        cover: "https://caniuse.com/img/favicon-128.png"
      },
      {
        title: "TinyPNG",
        introduction: "在线图片压缩工具，减小图片文件大小",
        url: "https://tinypng.com/",
        cover: "https://tinypng.com/images/panda-happy.png"
      },
      {
        title: "JSON Formatter",
        introduction: "JSON数据格式化和验证工具",
        url: "https://jsonformatter.curiousconcept.com/",
        cover: "https://jsonformatter.curiousconcept.com/img/jsonformatter.png"
      },
      {
        title: "RegExr",
        introduction: "正则表达式学习、构建和测试工具",
        url: "https://regexr.com/",
        cover: "https://regexr.com/assets/icons/icon-512x512.png"
      }
    ]
  };
};
getCollect();
</script>

<style lang="scss" scoped>
.favorite-container {
  padding: 25px;
  background: var(--favoriteBg);
}

.favorite-header {
  margin: 60px auto 30px;
  height: 410px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  max-width: 1200px;
}

.index-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.favorite-image::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: var(--translucent);
}

.card-container {
  display: flex;
  flex-wrap: wrap;
  margin-top: 60px;
}

.card-item {
  transition: all 0.3s;
  position: relative;
  width: 250px;
  height: 120px;
  border-radius: 20px;
  animation: hideToShow 1s ease-in-out;
  cursor: pointer;
  overflow: hidden;
  margin: 10px;
  color: var(--white);
}

.card-item:hover {
  transform: translateY(-6px);
}

.card-name {
  font-weight: bold;
  font-size: 25px;
}

.card-name:after {
  top: 50px;
  width: 22px;
  left: 26px;
  height: 2px;
  background: var(--white);
  content: "";
  border-radius: 1px;
  position: absolute;
}

.card-desc {
  font-weight: bold;
  margin-top: 15px;
}

.favorite-content {
  margin: 0 auto;
  max-width: 1200px;
}

.collect-classify {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
}

.favorite-item-wrap {
  display: flex;
  flex-wrap: wrap;
  margin-left: -10px;
}

.favorite-item {
  transition: all 0.3s;
  border-radius: 12px;
  box-shadow: 0 8px 16px -4px #2c2d300c;
  background: var(--background);
  display: flex;
  width: calc(100% / 4 - 20px);
  max-width: 320px;
  height: 90px;
  overflow: hidden;
  padding: 15px;
  cursor: pointer;
  margin: 10px;
}

.favorite-item:hover {
  background: #425aef;
  color: var(--white);
}

.favorite-item:hover .favorite-item-image {
  transition: all 0.6s;
  transform: scale(1.1);
  opacity: 0.8;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--themeBackground);
  color: var(--white);
  font-size: 24px;
}

.favorite-item:hover div:nth-child(2) {
  width: 100% !important;
}

.favorite-item-image {
  margin-right: 20px;
  transition: all 0.3s;
}

.favorite-item-title {
  font-size: 19px;
  font-weight: bold;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin-bottom: 5px;
}

.favorite-item-introduction {
  opacity: 0.7;
  font-weight: bold;
  letter-spacing: 1px;
  font-size: 14px;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

@media screen and (max-width: 620px) {
  .card-container {
    margin-top: 0;
  }
}

@media screen and (max-width: 900px) {
  .favorite-item {
    width: calc(100% / 3 - 20px);
  }
}

@media screen and (max-width: 700px) {
  .favorite-item {
    width: calc(100% / 2 - 20px);
  }
}

@media screen and (max-width: 400px) {
  .favorite-item {
    width: calc(100% - 20px);
  }
}
</style>
