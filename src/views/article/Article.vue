<template>
  <!-- 加载状态 -->
  <div v-if="state.loading" class="article-loading">
    <div class="loading-skeleton">
      <div class="skeleton-header"></div>
      <div class="skeleton-content">
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>
  </div>
  
  <!-- 文章内容 -->
  <div v-else-if="state.article">
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
                :datetime="state.article.createTime"
                :title="'发表于 ' + state.article.createTime"
              >
                {{ state.article.createTime }}
              </time>
              <span class="post-meta-separator">|</span>
              <el-icon class="post-meta-icon"><Menu /></el-icon>
              {{ state.article.category || '未分类' }}
            </span>
          </div>
          <div class="meta-secondline">
            <span class="post-meta-wordcount">
              <el-icon class="post-meta-icon"><EditPen /></el-icon>
              <span class="post-meta-label">字数总计:</span>
              <span class="word-count">{{ state.article.wordCount || 0 }}</span>
              <span class="post-meta-separator">|</span>
              <el-icon class="post-meta-icon"><Clock /></el-icon>
              <span class="post-meta-label">阅读时长:</span>
              <span>{{ state.article.readingTime || 1 }}分钟</span></span
            >
            <span class="post-meta-separator">|</span>
            <span
              class="post-meta-pv-cv"
              :data-flag-title="state.article.articleTitle"
            >
              <el-icon class="post-meta-icon"><View /></el-icon>
              <span class="post-meta-label">阅读量:</span>
              <span>{{ state.article.viewCount }}</span>
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
              :text="state.article.content"
              height="400px"
            ></v-md-preview>
          </div>

          <!-- 最后更新时间 -->
          <div class="article-update-time">
            <span>文章最后更新于 {{ state.article.updateTime || state.article.createTime }}</span>
          </div>
          <!-- 分类 -->
          <div class="article-sort" v-if="state.article.category">
            <span
              @click="
                $router.push({
                  path: '/categories/' + (state.article.categoryId || 1),
                })
              "
              >{{ state.article.category }}</span
            >
          </div>
          <!-- 作者信息 -->
          <blockquote>
            <!-- 版权声明 -->
            <div class="aritcle-copyright">
              <div>
                <span>文章作者：</span>
                <router-link to="/"> {{ webInfo.author || 'blackstar' }} </router-link>
              </div>
              <div>
                <span>文章链接：</span>
                <a :href="currentUrl" target="_blank">
                  {{ currentUrl }}
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
                <a :href="siteUrl" target="_blank"> {{ webInfo.webName || 'blackstar' }} </a>
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
            v-if="state.article.recommendList.length"
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
                v-for="item of state.article.recommendList"
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
          <div class="myCenter" id="article-like" @click="handleLikeArticle">
            <i
              class="iconfont icon-dianzan article-like-icon"
              :class="{ 'article-like': state.isLiked }"
            ></i>
          </div>

          <!-- 评论 -->
          <div v-if="state.article.commentStatus === true" id="comment">
            <Comment
              :type="'article'"
              :source="state.article.id"
              :userId="state.article.userId"
            ></Comment>
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
import { ElMessage } from "element-plus";
import { useSwipe } from "@/composables/useSwipe";
import { getArticleDetail, likeArticle } from "@/api/article";
import type { ArticleDetail, ArticleNav, Tag } from "@/types";
import common from "@/utils/common";
import constant from "@/utils/constant";
import tocbot from "tocbot";
import { Share } from "vue3-social-share";
import "vue3-social-share/lib/index.css";
import Comment from "@/components/comment/Comment.vue";

import VueMarkdownEditor, { xss } from "@kangc/v-md-editor";

const storesConfig = useConfig();
const { showToc, isMobile, scrollTop, webInfo } = storeToRefs(storesConfig);

// 动态 URL
const currentUrl = computed(() => window.location.href);
const siteUrl = computed(() => window.location.origin);

const router = useRouter();
const route = useRoute();

// 文章详情状态
interface ArticleState {
  article: ArticleDetail | null;
  loading: boolean;
  isLiked: boolean;
  tagList: Tag[];
  prevArticle: ArticleNav | null;
  nextArticle: ArticleNav | null;
  pageContainerClass: string;
}

const state = reactive<ArticleState>({
  article: null,
  loading: true,
  isLiked: false,
  tagList: [],
  prevArticle: null,
  nextArticle: null,
  pageContainerClass: "page-container page-container-scroll",
});

// 加载文章详情
const loadArticle = async (id: number) => {
  state.loading = true;
  try {
    const article = await getArticleDetail(id);
    state.article = article;
    state.prevArticle = article.prevArticle || null;
    state.nextArticle = article.nextArticle || null;
    
    // 设置标签列表
    if (article.tags && article.tags.length > 0) {
      state.tagList = article.tags.map((tag, index) => ({
        id: index + 1,
        tagName: tag,
      }));
    }
    
    // 检查是否已点赞 (从 localStorage 读取)
    const likedArticles = JSON.parse(localStorage.getItem('likedArticles') || '[]');
    state.isLiked = likedArticles.includes(id);
    
    // 重新初始化目录
    nextTick(() => {
      highlight();
      getTocbot();
    });
  } catch (error) {
    console.error('加载文章失败:', error);
    ElMessage.error('加载文章失败');
  } finally {
    state.loading = false;
  }
};

// 点赞文章
const handleLikeArticle = async () => {
  if (!state.article) return;
  
  if (state.isLiked) {
    ElMessage.info('您已经点赞过了');
    return;
  }
  
  try {
    const result = await likeArticle(state.article.id);
    if (result.success) {
      state.isLiked = true;
      state.article.likeCount = result.likeCount;
      
      // 保存到 localStorage
      const likedArticles = JSON.parse(localStorage.getItem('likedArticles') || '[]');
      likedArticles.push(state.article.id);
      localStorage.setItem('likedArticles', JSON.stringify(likedArticles));
      
      ElMessage.success('点赞成功！');
    }
  } catch (error) {
    ElMessage.error('点赞失败');
  }
};

const articleRef = ref();
const tocCount = ref(0);
const tocCardRef = ref<HTMLElement | null>(null);
const articleContainerRef = ref<HTMLElement | null>(null);

// 手势支持 - 左右滑动切换文章
const { bindSwipe, unbindSwipe } = useSwipe({
  threshold: 80,
  onSwipeLeft: () => {
    // 下一篇文章
    if (isMobile.value && state.article.id) {
      const nextId = state.article.id + 1;
      router.push(`/article/${nextId}`);
      ElMessage.info('下一篇文章');
    }
  },
  onSwipeRight: () => {
    // 上一篇文章
    if (isMobile.value && state.article.id > 1) {
      const prevId = state.article.id - 1;
      router.push(`/article/${prevId}`);
      ElMessage.info('上一篇文章');
    }
  },
});

const isLike = computed(() => {
  return state.tagList.length > 1 ? "like-btn-active" : "like-btn";
});

const isFull = computed(() => {
  return function (id: number) {
    return id ? "post full" : "post";
  };
});

const getTocbot = () => {
  // 先销毁之前的实例
  tocbot.destroy();

  // 添加文章生成目录功能
  nextTick(() => {
    const contentEl = document.querySelector(".entry-content");
    if (!contentEl) {
      console.warn('找不到 .entry-content 元素');
      return;
    }

    let nodes = contentEl.querySelectorAll("h1,h2,h3,h4,h5,h6");
    tocCount.value = nodes.length;

    if (nodes.length === 0) {
      console.warn('文章中没有找到标题元素');
      return;
    }

    // 为标题添加 ID
    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i] as HTMLElement;
      if (!node.id) {
        node.id = `heading-${i}`;
      }
    }

    // 初始化 tocbot
    tocbot.init({
      tocSelector: "#toc",
      contentSelector: ".entry-content",
      headingSelector: "h1, h2, h3, h4, h5, h6",
      scrollSmooth: true,
      fixedSidebarOffset: "auto",
      scrollSmoothOffset: -80,
      hasInnerContainers: true,
      headingsOffset: 80,
      onClick: function (e: MouseEvent) {
        e.preventDefault();
      },
    });
  });
};
const getArticle = () => {
  nextTick(() => {
    highlight();
    getTocbot();
  });
};

const highlight = () => {
  // 使用 requestAnimationFrame 等待渲染完成
  requestAnimationFrame(() => {
    const container = document.querySelector(".entry-content");
    if (!container) return;

    // 查找所有代码块（v-md-preview 渲染的结构）
    container.querySelectorAll("pre").forEach((pre, i) => {
      // 跳过已处理的
      if (pre.classList.contains("highlight-wrap")) return;

      const code = pre.querySelector("code");
      if (!code) return;

      // 获取语言 - v-md-editor 在 pre 上添加 v-md-hljs-xxx 类
      let lang = "CODE";
      const preMatch = pre.className.match(/v-md-hljs-(\w+)/);
      if (preMatch) {
        lang = preMatch[1].toUpperCase();
      } else {
        const codeMatch = code.className.match(/(?:language-|lang-)(\w+)/);
        if (codeMatch) {
          lang = codeMatch[1].toUpperCase();
        }
      }

      pre.classList.add("highlight-wrap");
      code.id = "code-block-" + i;

      // 添加行号 - 保留原始 HTML 以保持语法高亮
      const codeHtml = code.innerHTML;
      const lines = codeHtml.split('\n');
      if (lines[lines.length - 1].trim() === '') lines.pop();
      const numberedCode = lines.map((line, idx) =>
        `<span class="code-line"><span class="line-num">${idx + 1}</span><span class="line-code">${line || ' '}</span></span>`
      ).join('\n');
      code.innerHTML = numberedCode;

      // 创建工具栏
      const toolbar = document.createElement("div");
      toolbar.className = "code-toolbar";
      toolbar.innerHTML = `
        <span class="code-lang">${lang}</span>
        <div class="code-actions">
          <button class="code-collapse-btn" title="折叠/展开">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <button class="code-copy-btn" data-clipboard-target="#code-block-${i}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span>复制</span>
          </button>
        </div>
      `;
      pre.insertBefore(toolbar, pre.firstChild);

      // 折叠按钮事件
      const collapseBtn = toolbar.querySelector('.code-collapse-btn');
      collapseBtn?.addEventListener('click', () => {
        pre.classList.toggle('collapsed');
        const svg = collapseBtn.querySelector('svg');
        if (pre.classList.contains('collapsed')) {
          svg.style.transform = 'rotate(-90deg)';
        } else {
          svg.style.transform = '';
        }
      });
    });

    // 初始化复制功能
    if ((window as any).ClipboardJS) {
      const clipboard = new (window as any).ClipboardJS(".code-copy-btn", {
        text: function(trigger: HTMLElement) {
          const codeId = trigger.getAttribute('data-clipboard-target');
          if (!codeId) return '';
          const codeEl = document.querySelector(codeId);
          if (!codeEl) return '';
          // 只获取 .line-code 的文本内容
          const lines = codeEl.querySelectorAll('.line-code');
          if (lines.length > 0) {
            return Array.from(lines).map(el => el.textContent || '').join('\n');
          }
          return codeEl.textContent || '';
        }
      });
      clipboard.on("success", (e: any) => {
        const btn = e.trigger;
        btn.classList.add("copied");
        btn.querySelector("span").textContent = "已复制";
        ElMessage.success("代码已复制到剪贴板");
        e.clearSelection();
        setTimeout(() => {
          btn.classList.remove("copied");
          btn.querySelector("span").textContent = "复制";
        }, 2000);
      });
    }

    // 包装表格
    container.querySelectorAll("table").forEach((table) => {
      if (!table.parentElement?.classList.contains("table-wrapper")) {
        const wrapper = document.createElement("div");
        wrapper.className = "table-wrapper";
        table.parentNode?.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }
    });
  });
};
onMounted(() => {
  // 从路由参数获取文章ID并加载文章
  const articleId = Number(route.params.id) || 1;
  loadArticle(articleId);

  // 绑定手势事件
  nextTick(() => {
    const container = document.querySelector('.article-container') as HTMLElement;
    if (container) {
      bindSwipe(container);
    }
  });

  // 粘性定位逻辑 - 使用固定宽度避免滚动时的宽度变化
  let initialTop = 0;
  let fixedLeft = 0;
  let fixedWidth = 300;
  let initialized = false;
  let currentState = 'normal'; // 'normal' | 'fixed' | 'stopped'

  const initPosition = () => {
    if (tocCardRef.value && !initialized) {
      const rect = tocCardRef.value.getBoundingClientRect();
      initialTop = rect.top + window.scrollY;
      fixedLeft = rect.left;
      fixedWidth = 300;
      initialized = true;
    }
  };

  setTimeout(initPosition, 500);

  const handleScroll = () => {
    if (!tocCardRef.value || isMobile.value) return;
    if (!initialized) initPosition();

    const scrollY = window.scrollY;
    const threshold = initialTop - 80;
    const articleContainer = document.querySelector('.article-container');
    if (!articleContainer) return;

    const articleRect = articleContainer.getBoundingClientRect();
    const tocHeight = tocCardRef.value.offsetHeight;
    const articleBottomFromViewport = articleRect.bottom;
    const maxTocTop = articleBottomFromViewport - tocHeight;

    // 更新 left 位置
    const stickyLayout = tocCardRef.value.parentElement;
    if (stickyLayout) {
      fixedLeft = stickyLayout.getBoundingClientRect().left;
    }

    if (scrollY <= threshold) {
      // 还没滚动到需要固定的位置
      if (currentState !== 'normal') {
        tocCardRef.value.style.cssText = '';
        currentState = 'normal';
      }
    } else {
      // 计算实际应该使用的 top 值
      const actualTop = Math.min(80, maxTocTop);
      tocCardRef.value.style.cssText = `position: fixed; top: ${actualTop}px; left: ${fixedLeft}px; width: ${fixedWidth}px; z-index: 90;`;
      currentState = actualTop < 80 ? 'stopped' : 'fixed';
    }
  };
  
  window.addEventListener('scroll', handleScroll);

  window.addEventListener('resize', () => {
    // resize 时只更新 left 位置，保持其他状态不变
    if (!tocCardRef.value || currentState === 'normal') return;
    const stickyLayout = tocCardRef.value.parentElement;
    if (stickyLayout) {
      const newLeft = stickyLayout.getBoundingClientRect().left;
      if (Math.abs(newLeft - fixedLeft) > 1) {
        fixedLeft = newLeft;
        tocCardRef.value.style.left = `${fixedLeft}px`;
      }
    }
  });
});
onUnmounted(() => {
  tocbot.destroy();
  // 解绑手势事件
  const container = document.querySelector('.article-container') as HTMLElement;
  if (container) {
    unbindSwipe(container);
  }
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
:deep(.github-markdown-body) {
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
    flex: 1; /* 使用 flex 自动填充剩余空间 */
    min-width: 0; /* 防止 flex 子元素溢出 */
    max-width: 800px;
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
        color: var(--theme-background);
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
        background: var(--theme-background);
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
        background: var(--theme-background);
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
    width: 300px; /* 固定宽度 */
    flex-shrink: 0; /* 不允许收缩 */
    user-select: none;
    margin-left: 40px;

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
      background: var(--trans-card-bg, rgba(255, 255, 255, 0.98));
      border: 1px solid var(--borderColor, rgba(169, 169, 169, 0.7));
      border-radius: 8px;
      position: relative;
      z-index: 10;
      
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
  border: 1px solid var(--theme-background);
  border-radius: 1rem;
  color: var(--theme-background) !important;
  font-size: 12px;
  line-height: 2;
  text-decoration: none;
}
.tag-container a:hover {
  color: #fff !important;
  background: var(--theme-background);
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
          z-index: var(--z-sticky); /* 低于浮动按钮和导航栏 */
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
      }
    }
  }
}

/* 加载骨架屏样式 */
.article-loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background);
  
  .loading-skeleton {
    width: 100%;
    max-width: 800px;
    padding: 40px;
    
    .skeleton-header {
      height: 300px;
      background: linear-gradient(90deg, var(--border-color) 25%, var(--card-background) 50%, var(--border-color) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 12px;
      margin-bottom: 30px;
    }
    
    .skeleton-content {
      .skeleton-line {
        height: 20px;
        background: linear-gradient(90deg, var(--border-color) 25%, var(--card-background) 50%, var(--border-color) 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 4px;
        margin-bottom: 15px;
        
        &.short {
          width: 60%;
        }
      }
    }
  }
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}


</style>
