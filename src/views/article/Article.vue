<template>
  <div>
    <!-- 封面 -->
    <div class="article-head my-animation-slide-top">
      <!-- 背景图片 -->
      <el-image
        class="article-image my-el-image"
        v-once
        lazy
        :src="
          !common.isEmpty(state.article.articleCover)
            ? state.article.articleCover
            : constant.random_image +
              new Date() +
              Math.floor(Math.random() * 10)
        "
        fit="cover"
      >
        <div slot="error" class="image-slot">
          <div class="article-image"></div>
        </div>
      </el-image>
      <!-- 文章信息 -->
      <div class="article-info-container">
        <div class="article-title">{{ state.article.articleTitle }}</div>
        <div id="post-meta">
          <div class="meta-firstline">
            <span class="post-meta-date">
              <el-icon class="post-meta-icon"><Calendar /></el-icon>
              <span class="post-meta-label">发表于</span>
              <time
                class="post-meta-date-created"
                datetime="2023-04-14T16:45:14.000Z"
                title="发表于 2023-04-15 00:45:14"
              >
                2023-04-15
              </time>
              <span class="post-meta-separator">|</span>
              <el-icon class="post-meta-icon"><Menu /></el-icon>
              分类
            </span>
          </div>
          <div class="meta-secondline">
            <span class="post-meta-wordcount">
              <el-icon class="post-meta-icon"><EditPen /></el-icon>
              <span class="post-meta-label">字数总计:</span>
              <span class="word-count">558</span>
              <span class="post-meta-separator">|</span>
              <el-icon class="post-meta-icon"><Clock /></el-icon>
              <span class="post-meta-label">阅读时长:</span>
              <span>1分钟</span></span
            >
            <span class="post-meta-separator">|</span>
            <span
              class="post-meta-pv-cv"
              id=""
              data-flag-title="关于博客更新的二三事"
            >
              <el-icon class="post-meta-icon"><View /></el-icon>
              <span class="post-meta-label">阅读量:</span>
              <span id="busuanzi_value_page_pv">1006</span>
            </span>
          </div>
        </div>
      </div>
    </div>
    <!-- 文章 -->
    <div style="background: var(--background)">
      <div id="page-container-id" :class="state.pageContainerClass">
        <div class="article-container my-animation-slide-bottom my-card">
          <!-- 文章内容 -->
          <div class="entry-content">
            <v-md-preview
              class="font-class"
              ref="articleRef"
              :text="state.articleContentText"
              height="400px"
            ></v-md-preview>
          </div>

          <!-- 最后更新时间 -->
          <div class="article-update-time">
            <span>文章最后更新于 2022-02-02</span>
          </div>
          <!-- 分类 -->
          <div class="article-sort">
            <span
              @click="
                $router.push({
                  path: '/categories/1',
                })
              "
              >{{ "aaa ▶ bbb" }}</span
            >
          </div>
          <!-- 作者信息 -->
          <blockquote>
            <!-- 版权声明 -->
            <div class="aritcle-copyright">
              <div>
                <span>文章作者：</span>
                <router-link to="/"> blackstar </router-link>
              </div>
              <div>
                <span>文章链接：</span>
                <a href="/article" target="_blank">
                  http://localhost:8080/article?id=1
                </a>
              </div>
              <div>
                <span>版权声明：</span>本博客所有文章除特别声明外，均采用
                <a
                  href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                  target="_blank"
                >
                  CC BY-NC-SA 4.0
                </a>
                许可协议。转载请注明文章来自
                <a href="http://localhost:<!-- 8080 -->" target="_blank"> blackstar </a>
                。
              </div>
            </div>
          </blockquote>
          <!-- 转发 -->
          <div class="article-operation">
            <div class="tag-container">
              <router-link
                v-for="item of state.tagList"
                :key="item.id"
                :to="'/tags/' + item.id"
              >
                {{ item.tagName }}
              </router-link>
            </div>
            <share style="margin-left: auto" />
          </div>

          <!-- 点赞打赏等 -->
          <div class="article-reward">
            <!-- 点赞按钮 -->
            <a :class="isLike">
              <i
                class="iconfont icon-31dianzan"
                style="font-size: 1.5em; margin-bottom: -1px"
              ></i>
              点赞
              <span v-show="state.article.likeCount > 0">{{
                state.article.likeCount
              }}</span>
            </a>
            <a class="reward-btn" v-if="true">
              <!-- 打赏按钮 -->
              <i class="iconfont iconerweima" /> 打赏
              <!-- 二维码 -->
              <div class="animated fadeInDown reward-main">
                <ul class="reward-all">
                  <li class="reward-item">
                    <img class="reward-img" :src="state.article.articleCover" />
                    <div class="reward-desc">微信</div>
                  </li>
                  <li class="reward-item">
                    <img class="reward-img" :src="state.article.articleCover" />
                    <div class="reward-desc">支付宝</div>
                  </li>
                </ul>
              </div>
            </a>
          </div>
          <div class="pagination-post">
            <!-- 上一篇 -->
            <div :class="isFull(state.article.id)" v-if="state.article.id">
              <router-link :to="'/article/' + state.article.id">
                <img class="post-cover" :src="state.article.articleCover" />
                <div class="post-info">
                  <div class="label">上一篇</div>
                  <div class="post-title">
                    {{ state.article.articleTitle }}
                  </div>
                </div>
              </router-link>
            </div>
            <!-- 下一篇 -->
            <div :class="isFull(state.article.id)" v-if="state.article.id">
              <router-link :to="'/article/' + state.article.id">
                <img class="post-cover" :src="state.article.articleCover" />
                <div class="post-info" style="text-align: right">
                  <div class="label">下一篇</div>
                  <div class="post-title">
                    {{ state.article.articleTitle }}
                  </div>
                </div>
              </router-link>
            </div>
          </div>
          <!-- 推荐文章 -->
          <div
            class="recommend-container"
            v-if="state.article.recommendArticleList.length"
          >
            <div class="recommend-title">
              <i
                class="iconfont icon-tuijian"
                style="font-size: 1.5em; margin-bottom: -3px"
              ></i>
              相关推荐
            </div>
            <div class="recommend-list">
              <div
                class="recommend-item"
                v-for="item of state.article.recommendArticleList"
                :key="item.id"
              >
                <router-link :to="'/article/' + item.id">
                  <img class="recommend-cover" :src="item.articleCover" />
                  <div class="recommend-info">
                    <div class="recommend-date">
                      <i class="iconfont iconrili" />
                      {{ item.createTime }}
                    </div>
                    <div>{{ item.articleTitle }}</div>
                  </div>
                </router-link>
              </div>
            </div>
          </div>
          <!-- 分割线 -->

          <div class="fenge"></div>

          <!-- 点赞 -->
          <div class="myCenter" id="article-like">
            <i
              class="el-icon-thumb article-like-icon"
              :class="{ 'article-like': 99 }"
            ></i>
          </div>

          <!-- 评论 -->
          <div v-if="state.article.commentStatus === true">
            <comment
              :type="'article'"
              :source="article.id"
              :userId="article.userId"
            ></comment>
          </div>
        </div>
        <div class="aside-content">
          <!-- 作者信息卡片 -->
          <div class="my-card aside-card author-card">
            <div class="author-avatar">
              <el-avatar :size="80" src="https://bu.dusays.com/2022/05/03/627010707b598.webp" />
            </div>
            <div class="author-name">BlackStar</div>
            <div class="author-desc">记录技术成长，分享编程心得</div>
            <div class="author-stats">
              <div class="stat-item">
                <span class="stat-value">{{ state.article.viewCount }}</span>
                <span class="stat-label">阅读</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ state.article.likeCount }}</span>
                <span class="stat-label">点赞</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ state.article.commentCount }}</span>
                <span class="stat-label">评论</span>
              </div>
            </div>
          </div>
          
          <div class="sticky-layout">
            <!-- 目录卡片 -->
            <div
              v-show="showToc || !isMobile"
              class="card-toc my-card aside-card"
              ref="tocCardRef"
            >
              <div class="toc-header">
                <el-icon><List /></el-icon>
                <span>目录导航</span>
                <span class="toc-count" v-if="tocCount > 0">{{ tocCount }}</span>
              </div>
              <div id="toc" class="toc"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, computed, nextTick, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useConfig } from "@/stores/config";
import common from "@/utils/common";
import constant from "@/utils/constant";
import tocbot from "tocbot";
import { Share } from "vue3-social-share";
import "vue3-social-share/lib/index.css";

import VueMarkdownEditor, { xss } from "@kangc/v-md-editor";

const storesConfig = useConfig();
const { showToc, isMobile, scrollTop } = storeToRefs(storesConfig);

const router = useRouter();
const route = useRoute();

const state = reactive({
  article: {
    id: 1,
    articleTitle: "标题",
    articleContent:
      "《百年孤独》，是哥伦比亚作家加西亚·马尔克斯创作的长篇小说，是其代表作，也是拉丁美洲魔幻现实主义文学的代表作，被誉为“再现拉丁美洲历史社会图景的鸿篇巨著”。",
    articleCover: "https://bu.dusays.com/2022/05/03/627010707b598.webp",
    createTime: "2022.02.02",
    viewCount: 99,
    commentCount: 99,
    likeCount: 99,

    recommendArticleList: [
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
    ],
  },
  articleContentText: `# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 \`<script setup>\` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## 示例图片（点击可预览）

下面是一些示例图片，点击图片可以放大预览：

![风景图片1](https://picsum.photos/800/600?random=1)

这是一张美丽的风景图片，展示了大自然的壮丽景色。

![风景图片2](https://picsum.photos/800/600?random=2)

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support For '.vue' Imports in TS

TypeScript cannot handle type information for '.vue' imports by default, so we replace the 'tsc' CLI with 'vue-tsc' for type checking.

![代码示例](https://picsum.photos/800/400?random=3)

# 一级标题

这里是一些示例文本内容，用于展示文章的排版效果。

## 二级标题

更多的示例内容，包含一张图片：

![示例图片](https://picsum.photos/600/400?random=4)

### 三级标题

这是三级标题下的内容，展示了文章的层级结构。

 `,
  treeHoleList: [],
  weiYanDialogVisible: false,
  newsTime: "",
  pageContainerClass: "page-container page-container-scroll",
  tagList: [
    {
      id: 1,
      tagName: "css",
    },
    {
      id: 2,
      tagName: "js",
    },
  ],
  shareConfig: {
    sites: ["qzone", "wechat", "weibo", "qq"],
  },
});

const articleRef = ref();
const tocCount = ref(0);
const tocCardRef = ref<HTMLElement | null>(null);

const isLike = computed(() => {
  return state.tagList.length > 1 ? "like-btn-active" : "like-btn";
});

const isFull = computed(() => {
  return function (id: number) {
    return id ? "post full" : "post";
  };
});

const getTocbot = () => {
  // 添加文章生成目录功能
  let nodes = articleRef.value.$el.querySelectorAll("h1,h2,h3,h4,h5,h6");
  tocCount.value = nodes.length;
  
  if (nodes.length) {
    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i];
      let reg = /^H[1-6]{1}$/;
      if (reg.exec(node.tagName)) {
        node.id = `heading-${i}`;
      }
    }
  }

  tocbot.init({
    tocSelector: "#toc",
    contentSelector: ".entry-content",
    headingSelector: "h1, h2, h3, h4, h5, h6",
    scrollSmooth: true,
    fixedSidebarOffset: "auto",
    scrollSmoothOffset: -80,
    hasInnerContainers: false,
    headingsOffset: 80,
    onClick: function (e: MouseEvent) {
      e.preventDefault();
    },
  });
};
const getArticle = () => {
  nextTick(() => {
    highlight();
    getTocbot();
  });
};

const highlight = () => {
  let attributes = {
    autocomplete: "off",
    autocorrect: "off",
    autocapitalize: "off",
    spellcheck: "false",
    contenteditable: "false",
  };

  $("pre").each(function (i, item) {
    let preCode = $(item).children("code");
    let classNameStr = preCode[0].className;
    let classNameArr = classNameStr.split(" ");

    let lang = "";
    classNameArr.some(function (className) {
      if (className.indexOf("language-") > -1) {
        lang = className.substring(
          className.indexOf("-") + 1,
          className.length
        );
        return true;
      }
    });

    // 检测语言是否存在，不存在则自动检测
    let language = hljs.getLanguage(lang.toLowerCase());
    if (language === undefined) {
      // 启用自动检测
      let autoLanguage = hljs.highlightAuto(preCode.text());
      preCode.removeClass("language-" + lang);
      lang = autoLanguage.language;
      if (lang === undefined) {
        lang = "java";
      }
      preCode.addClass("language-" + lang);
    } else {
      lang = language.name;
    }

    $(item).addClass("highlight-wrap");
    $(item).attr(attributes);
    preCode.attr("data-rel", lang.toUpperCase()).addClass(lang.toLowerCase());
    // 启用代码高亮
    hljs.highlightBlock(preCode[0]);
    // 启用代码行号
    hljs.lineNumbersBlock(preCode[0]);
  });

  $("pre code").each(function (i, block) {
    $(block).attr({
      id: "hljs-" + i,
    });

    $(block).after(
      '<a class="copy-code" href="javascript:" data-clipboard-target="#hljs-' +
        i +
        '"><i class="fa fa-clipboard" aria-hidden="true"></i></a>'
    );
    new ClipboardJS(".copy-code");
  });

  if ($(".entry-content").children("table").length > 0) {
    $(".entry-content")
      .children("table")
      .wrap("<div class='table-wrapper'></div>");
  }
};
onMounted(() => {
  getArticle();
  
  // 粘性定位逻辑
  let initialTop = 0;
  let initialized = false;
  
  const initPosition = () => {
    if (tocCardRef.value && !initialized) {
      const rect = tocCardRef.value.getBoundingClientRect();
      initialTop = rect.top + window.scrollY;
      initialized = true;
    }
  };
  
  // 延迟初始化
  setTimeout(initPosition, 500);
  
  const handleScroll = () => {
    if (!tocCardRef.value || isMobile.value) return;
    if (!initialized) initPosition();
    
    const scrollY = window.scrollY;
    const threshold = initialTop - 80;
    const stickyLayout = tocCardRef.value.parentElement;
    
    if (scrollY > threshold) {
      // 获取父容器位置来定位
      if (stickyLayout) {
        const parentRect = stickyLayout.getBoundingClientRect();
        // 使用 requestAnimationFrame 确保在下一帧渲染时更新位置
        requestAnimationFrame(() => {
          if (tocCardRef.value) {
            const updatedRect = stickyLayout.getBoundingClientRect();
            tocCardRef.value.style.position = 'fixed';
            tocCardRef.value.style.top = '80px';
            tocCardRef.value.style.left = `${updatedRect.left}px`;
            tocCardRef.value.style.width = `${updatedRect.width}px`;
            tocCardRef.value.style.zIndex = '90';
          }
        });
      }
    } else {
      tocCardRef.value.style.position = '';
      tocCardRef.value.style.top = '';
      tocCardRef.value.style.left = '';
      tocCardRef.value.style.width = '';
      tocCardRef.value.style.zIndex = '';
    }
  };
  
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', () => {
    initialized = false;
    if (tocCardRef.value) {
      tocCardRef.value.style.position = '';
      tocCardRef.value.style.top = '';
      tocCardRef.value.style.left = '';
      tocCardRef.value.style.width = '';
    }
  });
});
onUnmounted(() => {
  tocbot.destroy();
});
watch(
  () => storesConfig.scrollTop,
  (scrollTop, oldScrollTop) => {
    const downScroll = scrollTop - oldScrollTop > 0;
    if (downScroll) {
      state.pageContainerClass = "page-container ";
    } else {
      state.pageContainerClass = "page-container page-container-scroll";
    }
  }
);
</script>

<style lang="scss" scoped>
::v-deep .github-markdown-body {
  font-family: "LXGW";
}
.my-card {
  border-radius: 8px;
  background: var(--trans-card-bg);
  border: var(--border-style);
  -webkit-transition: all 0.3s;
  -moz-transition: all 0.3s;
  -o-transition: all 0.3s;
  -ms-transition: all 0.3s;
  transition: all 0.3s;
}
.page-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  max-width: 1200px;
  padding: 40px 15px;
  margin: 0 auto;
  justify-content: center;
  align-items: flex-start; /* 让子元素从顶部开始，使 sticky 生效 */

  .article-container {
    // max-width: 800px;
    width: 70%;
    padding: 40px 50px;
    border: var(--border-style);

    .fenge {
      background: url(https://npm.elemecdn.com/hassan-assets/img/Bilibili_Dividing_Line.png)
        no-repeat;
      position: relative;
      margin: 20px auto;
      width: calc(100% - 4px);
      height: 100px;
      background-size: 100%;
    }

    blockquote {
      line-height: 2;
      border-left: 0.2rem solid var(--blue);
      background-color: var(--azure);
      border-radius: 4px;
      margin: 0 0 10px 0;
      user-select: none;
      color: var(--black);

      .aritcle-copyright {
        position: relative;
        margin-bottom: 10px;
        font-size: 0.875rem;
        line-height: 2;
        padding: 0.625rem 1rem;
        border: 1px solid #eee;
        font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica,
          Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji;
      }
      .aritcle-copyright span {
        color: #49b1f5;
        font-weight: bold;
      }
      .aritcle-copyright a {
        text-decoration: underline !important;
        color: #99a9bf !important;
      }
      .aritcle-copyright:before {
        position: absolute;
        top: 0.7rem;
        right: 0.7rem;
        width: 1rem;
        height: 1rem;
        border-radius: 1rem;
        background: #49b1f5;
        content: "";
      }
      .aritcle-copyright:after {
        position: absolute;
        top: 0.95rem;
        right: 0.95rem;
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 0.5em;
        background: #fff;
        content: "";
      }
    }

    // 点赞打赏
    .article-reward {
      margin-top: 5rem;
      display: flex;
      justify-content: center;
      align-items: center;

      .like-btn {
        display: inline-block;
        width: 100px;
        background: #969696;
        color: #fff !important;
        text-align: center;
        line-height: 36px;
        font-size: 0.875rem;
      }
      .like-btn-active {
        display: inline-block;
        width: 100px;
        background: #ec7259;
        color: #fff !important;
        text-align: center;
        line-height: 36px;
        font-size: 0.875rem;
      }

      .reward-btn {
        position: relative;
        display: inline-block;
        width: 100px;
        background: #49b1f5;
        margin: 0 1rem;
        color: #fff !important;
        text-align: center;
        line-height: 36px;
        font-size: 0.875rem;

        .reward-main {
          display: none;
          position: absolute;
          bottom: 40px;
          left: 0;
          margin: 0;
          padding: 0 0 15px;
          width: 100%;

          .reward-all {
            display: inline-block;
            margin: 0 0 0 -110px;
            padding: 20px 10px 8px !important;
            width: 320px;
            border-radius: 4px;
            background: #f5f5f5;

            .reward-item {
              display: inline-block;
              padding: 0 8px;
              list-style-type: none;

              .reward-img {
                width: 130px;
                height: 130px;
                display: block;
              }
              .reward-desc {
                margin: -5px 0;
                color: #858585;
                text-align: center;
              }
            }
          }
          .reward-all:before {
            position: absolute;
            bottom: -10px;
            left: 0;
            width: 100%;
            height: 20px;
            content: "";
          }
          .reward-all:after {
            content: "";
            position: absolute;
            right: 0;
            bottom: 2px;
            left: 0;
            margin: 0 auto;
            width: 0;
            height: 0;
            border-top: 13px solid #f5f5f5;
            border-right: 13px solid transparent;
            border-left: 13px solid transparent;
          }
        }
      }
      .reward-btn:hover .reward-main {
        display: block;
      }
    }

    // 上一篇下一篇
    .pagination-post {
      display: flex;
      margin-top: 40px;
      overflow: hidden;
      width: 100%;
      background: #000;

      .post {
        position: relative;
        width: 50%;
        height: 150px;
        overflow: hidden;

        a {
          position: relative;
          display: block;
          overflow: hidden;
          height: 150px;
        }
        .post-info {
          position: absolute;
          top: 50%;
          padding: 20px 40px;
          width: 100%;
          transform: translate(0, -50%);
          line-height: 2;
          font-size: 14px;

          .label {
            font-size: 90%;
            color: #eee;
          }
          .post-title {
            font-weight: 500;
            color: #fff;
          }
        }
        .post-cover {
          position: absolute;
          width: 100%;
          height: 100%;
          opacity: 0.4;
          transition: all 0.6s;
          object-fit: cover;
        }
      }
      .full {
        width: 100% !important;
      }
      .post:hover .post-cover {
        opacity: 0.8;
        transform: scale(1.1);
      }
    }

    // 推荐文章
    .recommend-container {
      margin-top: 40px;

      .recommend-title {
        font-size: 20px;
        line-height: 2;
        font-weight: bold;
        margin-bottom: 5px;
      }
      .recommend-item {
        position: relative;
        display: inline-block;
        overflow: hidden;
        margin: 3px;
        width: calc(33.333% - 6px);
        height: 200px;
        background: #000;
        vertical-align: bottom;

        .recommend-cover {
          width: 100%;
          height: 100%;
          opacity: 0.4;
          transition: all 0.6s;
          object-fit: cover;
        }
        .recommend-info {
          line-height: 2;
          color: #fff;
          position: absolute;
          top: 50%;
          padding: 0 20px;
          width: 100%;
          transform: translate(0, -50%);
          text-align: center;
          font-size: 14px;
          .recommend-date {
            font-size: 90%;
          }
        }
      }
      .recommend-item:hover .recommend-cover {
        opacity: 0.8;
        transform: scale(1.1);
      }
    }
  }

  .aside-content {
    width: calc(30% - 40px);
    user-select: none;
    margin-left: 40px;
    margin-right: 60px;
    max-width: 300px;

    .sticky-layout {
      position: sticky;
      top: 80px;
      margin-top: 20px;
    }

    .aside-card {
      margin-top: 20px;
    }
    .aside-card:first-child {
      margin-top: 0;
    }
    
    // 作者信息卡片
    .author-card {
      text-align: center;
      padding: 30px 20px;
      
      .author-avatar {
        margin-bottom: 15px;
        
        .el-avatar {
          border: 3px solid var(--themeBackground);
          box-shadow: 0 4px 15px rgba(57, 197, 187, 0.3);
        }
      }
      
      .author-name {
        font-size: 18px;
        font-weight: 600;
        color: var(--fontColor);
        margin-bottom: 8px;
      }
      
      .author-desc {
        font-size: 13px;
        color: var(--greyFont);
        margin-bottom: 20px;
        line-height: 1.5;
      }
      
      .author-stats {
        display: flex;
        justify-content: space-around;
        padding-top: 15px;
        border-top: 1px solid var(--borderColor);
        
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          
          .stat-value {
            font-size: 18px;
            font-weight: 600;
            color: var(--themeBackground);
          }
          
          .stat-label {
            font-size: 12px;
            color: var(--greyFont);
            margin-top: 4px;
          }
        }
      }
    }
    
    // 目录卡片
    .card-toc {
      .toc-header {
        display: flex;
        align-items: center;
        padding: 16px 20px;
        background: linear-gradient(135deg, var(--themeBackground) 0%, #5dd5cb 100%);
        color: #fff;
        font-weight: 600;
        font-size: 15px;
        border-radius: 12px 12px 0 0;
        
        .el-icon {
          font-size: 18px;
          margin-right: 8px;
        }
        
        .toc-count {
          margin-left: auto;
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 12px;
        }
      }
    }
  }
}

.article-head {
  height: 40vh;
  position: relative;

  .article-info-container {
    position: absolute;
    bottom: 100px;
    width: 100%;
    text-align: center;
    color: var(--white);

    #post-meta {
      .post-meta-label {
        margin-right: 4px;
      }
      .post-meta-separator {
        margin: 0 5px;
      }
      .post-meta-icon {
        vertical-align: -1px;
        margin-right: 4px;
      }
    }
  }
}

.article-image::before {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: var(--miniMask);
  content: "";
}

.article-title {
  font-size: 28px;
  margin-bottom: 15px;
}

.article-update-time {
  color: var(--greyFont);
  font-size: 12px;
  margin: 20px 0;
  user-select: none;
}

.article-operation {
  display: flex;
  align-items: center;
}

.tag-container a {
  display: inline-block;
  margin: 0.5rem 0.5rem 0.5rem 0;
  padding: 0 0.75rem;
  width: fit-content;
  border: 1px solid #49b1f5;
  border-radius: 1rem;
  color: #49b1f5 !important;
  font-size: 12px;
  line-height: 2;
  text-decoration: none;
}
.tag-container a:hover {
  color: #fff !important;
  background: #49b1f5;
  transition: all 0.5s;
}

.article-sort {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.article-sort span {
  padding: 3px 10px;
  background-color: var(--themeBackground);
  border-radius: 5px;
  font-size: 14px;
  color: var(--white);
  transition: all 0.3s;
  margin-right: 25px;
  cursor: pointer;
  user-select: none;
}

.article-sort span:hover {
  background-color: var(--red);
}

.article-like {
  color: var(--red) !important;
}

.article-like-icon {
  font-size: 60px;
  cursor: pointer;
  color: var(--greyFont);
  transition: all 0.5s;
  border-radius: 50%;
  margin-bottom: 20px;
}

.article-like-icon:hover {
  transform: rotate(360deg);
}

.page-container-scroll > .aside-content > .sticky-layout.toc-fixed {
  top: 80px; /* 导航栏显示时的位置 */
}

/* 小屏手机优化 */
@media screen and (max-width: 768px) {
  .article-head {
    .article-info-container {
      bottom: 22px;
    }
  }
  .page-container {
    .article-container {
      .pagination-post {
        display: block;
      }
      .recommend-container {
        .recommend-item {
          position: relative;
          display: inline-block;
          overflow: hidden;
          margin: 3px;
          width: calc(100% - 4px);
          height: 150px;
          margin: 2px;
          background: #000;
          vertical-align: bottom;
        }
      }
      .fenge {
        height: 50px;
      }
    }
  }
}

/* 平板/移动端布局切换 - 与 isMobile 断点一致 */
@media screen and (max-width: 1050px) {
  .page-container {
    width: 100%;
    /* 文章栏与侧标栏垂直排列 */
    flex-direction: column;

    .article-container {
      width: 100%;
      padding: 20px;
    }
    .aside-content {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
      margin-top: 50px;
      
      // 移动端隐藏作者卡片
      .author-card {
        display: none;
      }

      .sticky-layout {
        position: relative;

        .card-toc {
          position: fixed;
          top: 70px; /* 从顶部定位，避免与底部浮动按钮重叠 */
          bottom: auto;
          right: 20px;
          width: 260px;
          max-height: calc(100vh - 200px); /* 留出顶部和底部空间 */
          z-index: 90; /* 低于浮动按钮(1000)和工具栏(100) */
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
      }
    }
  }
}
</style>
