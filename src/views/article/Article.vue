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
        <div class="article-container my-animation-slide-bottom">
          <!-- 文章内容 -->
          <div class="entry-content">
            <v-md-preview
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
                  path: '/sort',
                  query: { sortId: 1, labelId: 1 },
                })
              "
              >{{ "aaa ▶ bbb" }}</span
            >
          </div>
          <!-- 作者信息 -->
          <blockquote>
            <div>作者：blackstar</div>
            <div>版权声明：转载请注明文章出处</div>
          </blockquote>
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
          <div style="width: 100px; height: 100px">占位</div>
          <div class="sticky-layout">
            <div v-show="showToc || !isMobile" class="card-toc">
              <div style="padding-bottom: 6px">
                <el-icon><Operation /></el-icon>
                <span style="margin-left: 10px">目录</span>
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
import { onMounted, onUnmounted, reactive, created, nextTick, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useConfig } from "@/stores/config";
import common from "@/utils/common";
import constant from "@/utils/constant";
import tocbot from "tocbot";

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

 `,
  treeHoleList: [],
  weiYanDialogVisible: false,
  newsTime: "",
  pageContainerClass: "page-container page-container-scroll",
});

const articleRef = ref();

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
    hasInnerContainers: true,
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
.page-container {
  display: flex;
  flex-direction: row;
  width: 90%;
  padding: 0 20px 40px 20px;
  margin: 0 auto;
  justify-content: center;

  .article-container {
    // max-width: 800px;
    width: 70%;
    padding: 40px 20px;
  }

  .aside-content {
    width: calc(30% - 40px);
    user-select: none;
    margin-top: 50px;
    margin-left: 40px;
    max-width: 300px;
    float: right;

    .sticky-layout {
      position: sticky;
      top: 20px;

      -webkit-transition: top 0.3s;
      -moz-transition: top 0.3s;
      -o-transition: top 0.3s;
      -ms-transition: top 0.3s;
      transition: top 0.3s;
    }
  }
}

.article-head {
  height: 40vh;
  position: relative;
}

.article-image::before {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: var(--miniMask);
  content: "";
}

.article-info-container {
  position: absolute;
  bottom: 15px;
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

blockquote {
  line-height: 2;
  border-left: 0.2rem solid var(--blue);
  padding: 10px 1rem;
  background-color: var(--azure);
  border-radius: 4px;
  margin: 0 0 40px 0;
  user-select: none;
  color: var(--black);
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
  .article-info-container {
    left: 20px;
    max-width: 320px;
  }
}

@media screen and (max-width: 1000px) {
  .page-container {
    width: 100%;
    /* 文章栏与侧标栏垂直排列 */
    flex-direction: column;

    .article-container {
      width: 100%;
    }
    .aside-content {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;

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
