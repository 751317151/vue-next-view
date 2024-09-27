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
                <a href="http://localhost:8080" target="_blank"> blackstar </a>
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
              <router-link :to="'/articles?id=' + state.article.id">
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
              <router-link :to="'/articles?id=' + state.article.id">
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
                <router-link :to="'/articles/' + item.id">
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
          <!-- <MyAside></MyAside> -->
          <div class="my-card aside-card">占位</div>
          <div class="sticky-layout">
            <div
              v-show="showToc || !isMobile"
              class="card-toc my-card aside-card"
            >
              <div style="padding-bottom: 6px">
                <el-icon><Operation /></el-icon>
                <span style="margin-left: 10px">目录</span>
              </div>
              <div id="toc" class="toc"></div>
            </div>
            <div class="my-card aside-card">占位</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, computed, nextTick, ref } from "vue";
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
This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 '<1script setup1>' SFCs, check out the [script1 setup1 docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.
## Recommended IDE Setup
- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).
## Type Support For '.vue' Imports in TS

TypeScript cannot handle type information for '.vue' imports by default, so we replace the 'tsc' CLI with 'vue-tsc' for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of '.vue' types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
   1. Run 'Extensions: Show Built-in Extensions' from VSCode's command palette
   2. Find 'TypeScript and JavaScript Language Features', right click and select 'Disable (Workspace)'
2. Reload the VSCode window by running 'Developer: Reload Window' from the command palette.

# 一级标题
dsa犯得上发射点广泛的和哥哥符合国家和国际换个房间很干净很干净地方官梵蒂冈发生的官方电话给发货的，dsa犯得上发射点广泛的和哥哥符合国家和国际换个房间很干净很干净地方官梵蒂冈发生的官方电话给发货的，
dsa犯得上发射点广泛的和哥哥符合国家和国际换个房间很干净很干净地方官梵蒂冈发生的官方电话给发货的，，dsa犯得上发射点广泛的和哥哥符合国家和国际换个房间很干净很干净地方官梵蒂冈发生的官方电话给发货的，
dsa犯得上发射点广泛的和哥哥符合国家和国际换个房间很干净很干净地方官梵蒂冈发生的官方电话给发货的

## 二级标题
dsa犯得上发射点广泛的和哥哥符合国家和国际换个房间很干净很干净地方官梵蒂冈发生的官方电话给发货的

### 三级标题
dsa犯得上发射点广泛的和哥哥符合国家和国际换个房间很干净很干净地方官梵蒂冈发生的官方电话给发货的,
dsa犯得上发射点广泛的和哥哥符合国家和国际换个房间很干净很干净地方官梵蒂冈发生的官方电话给发货的
# 一级标题
dsa犯得上发射点广泛的和哥哥符合国家和国际换个房间很干净很干净地方官梵蒂冈发生的官方电话给发货的，dsa犯得上发射点广泛的和哥哥符合国家和国际换个房间很干净很干净地方官梵蒂冈发生的官方电话给发货的，
dsa犯得上发射点广泛的和哥哥符合国家和国际换个房间很干净很干净地方官梵蒂冈发生的官方电话给发货的，，dsa犯得上发射点广泛的和哥哥符合国家和国际换个房间很干净很干净地方官梵蒂冈发生的官方电话给发货的，
dsa犯得上发射点广泛的和哥哥符合国家和国际换个房间很干净很干净地方官梵蒂冈发生的官方电话给发货的

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

const isLike = computed(() => {
  return state.tagList.length > 1 ? "like-btn-active" : "like-btn";
});

const isFull = computed(() => {
  return function (id: Number) {
    return id ? "post full" : "post";
  };
});

const getTocbot = () => {
  // 添加文章生成目录功能
  let nodes = articleRef.value.$el.querySelectorAll("h1,h2,h3,h4,h5,h6");
  if (nodes.length) {
    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i];
      let reg = /^H[1-4]{1}$/;
      if (reg.exec(node.tagName)) {
        node.id = i;
      }
    }
  }

  tocbot.init({
    tocSelector: "#toc",
    contentSelector: ".entry-content",
    headingSelector: "h1, h2, h3, h4, h5, h6",
    scrollSmooth: true,
    fixedSidebarOffset: "auto",
    scrollSmoothOffset: -100,
    hasInnerContainers: false,
    onClick: function (e) {
      console.log(e);
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
    max-width: 300px;
    float: right;

    .sticky-layout {
      position: sticky;
      top: 20px;
      margin-top: 20px;
      -webkit-transition: top 0.3s;
      -moz-transition: top 0.3s;
      -o-transition: top 0.3s;
      -ms-transition: top 0.3s;
      transition: top 0.3s;
    }

    .aside-card {
      margin-top: 20px;
    }
    .aside-card:first-child {
      margin-top: 0;
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

.page-container-scroll > .aside-content > .sticky-layout {
  top: 70px;
  //   -webkit-transition: top 0.3s;
  //   -moz-transition: top 0.3s;
  //   -o-transition: top 0.3s;
  //   -ms-transition: top 0.3s;
  //   transition: top 0.3s;
}

@media screen and (max-width: 700px) {
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

@media screen and (max-width: 1000px) {
  .page-container {
    width: 100%;
    /* 文章栏与侧标栏垂直排列 */
    flex-direction: column;

    .article-container {
      width: 100%;
      padding: 0;
    }
    .aside-content {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
      margin-top: 50px;

      .sticky-layout {
        position: relative;

        .card-toc {
          position: fixed;
          top: 60px;
          right: 60px;
        }
      }
    }
  }
}
</style>
