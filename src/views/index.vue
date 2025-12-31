<template>
  <div class="main-index">
    <!-- 阅读进度条 -->
    <ReadingProgress />
    
    <!-- el过渡动画 -->
    <!-- <transition name="el-fade-in-linear"> -->
    <!-- 导航栏 -->
    <TopNavBar></TopNavBar>
    <!-- </transition> -->

    <div id="main-container">
      <div class="web-bg"></div>
      <canvas id="universe"></canvas>
      <PageTransition type="fade">
        <router-view></router-view>
      </PageTransition>
    </div>

    <!-- 回到顶部按钮 -->
    <!-- <div href="#" class="cd-top" v-show="!isMobile" @click="toTop()"></div> -->

    <div class="rightside" :class="{ show: state.showToolButton }">
      <div
        class="rightside-config-hide"
        :class="{ show: showSettingPanel }"
      >
        <!-- 这些设置项现在移到了设置弹框中 -->
        <div class="config-tip">
          <span>点击设置按钮打开设置面板</span>
        </div>
      </div>
      <div class="rightside-config-show">
        <button
          class="rightside_config"
          type="button"
          title="设置"
          @click="openSettingsModal"
        >
          <i class="fa fa-cog right_side iconRotate"></i>
        </button>
        <button
          v-show="route.path === '/article' && isMobile"
          @click="changeTocStatus()"
          class="close"
          id="mobile-toc-button"
          type="button"
          title="目录"
        >
          <i class="fa fa-list-ul"></i>
        </button>
        <button class="share" type="button" title="分享链接" @click="handleShare">
          <i class="fa fa-share-alt"></i>
        </button>
        <button class="go-up" type="button" title="回到顶部" @click="toTop()">
          <i class="fa fa-arrow-up"></i>
          <span class="percent">{{ state.percent }}%</span>
        </button>
        <button
          class="go-down"
          type="button"
          title="直达底部"
          @click="toBottom()"
        >
          <i class="fa fa-arrow-down"></i>
        </button>
      </div>
      <!-- 点击动画 -->
      <canvas
        v-if="mouseAnimation"
        id="mousedown"
        style="
          position: fixed;
          left: 0;
          top: 0;
          pointer-events: none;
          z-index: 1000;
        "
      ></canvas>
    </div>

    <SideNavBar></SideNavBar>

    <Footer2></Footer2>
    
    <!-- 移动端浮动按钮 -->
    <FloatingActions />
    
    <!-- 性能监控 (开发环境) -->
    <PerformanceMonitor />
    
    <!-- 设置弹框 -->
    <SettingsModal v-model:visible="settingsModalVisible" />
  </div>
</template>

<script setup lang="ts">
import TopNavBar from "@/components/layout/TopNavBar.vue";
import SideNavBar from "@/components/layout/SideNavBar.vue";
import Footer2 from "@/components/layout/Footer2.vue";
import ReadingProgress from "@/components/common/ReadingProgress.vue";
import PageTransition from "@/components/common/PageTransition.vue";
import FloatingActions from "@/components/common/FloatingActions.vue";
import PerformanceMonitor from "@/components/common/PerformanceMonitor.vue";
import SettingsModal from "@/components/common/SettingsModal.vue";
import { useConfig } from "@/stores/config";
import { useThemeStore } from "@/stores/theme";
import { storeToRefs } from "pinia";
import { onMounted, onBeforeUnmount, watch, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import mousedown from "@/utils/mousedown";
import blackstar from "@/utils/blackstar";

const route = useRoute();
const storesConfig = useConfig();
const themeStore = useThemeStore();
const { isMobile } = storeToRefs(storesConfig);
const { mouseAnimation, showSettingPanel } = storeToRefs(themeStore);

const state = reactive({
  showToolButton: false,
  percent: 0,
});

// 设置弹框状态
const settingsModalVisible = ref(false);

// 监听设置弹框打开事件的处理函数
const handleOpenSettingsModal = () => {
  settingsModalVisible.value = true;
};

// methods
const toTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

const toBottom = () => {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth",
  });
};

const changeTocStatus = () => {
  storesConfig.changeTocStatus();
};

// 打开设置弹框
const openSettingsModal = () => {
  settingsModalVisible.value = true;
};

// 分享功能
const handleShare = () => {
  if (navigator.share) {
    navigator.share({
      title: '生活倒影',
      text: '一个优雅的个人博客',
      url: window.location.href
    });
  } else {
    navigator.clipboard.writeText(window.location.href);
    // 这里可以添加提示消息
    console.log('链接已复制到剪贴板');
  }
};
const getCategories = () => {
  let Categories: Array<Category> = [
    {
      id: 1,
      categoryName: "生活倒影",
    },
    {
      id: 2,
      categoryName: "java",
    },
    {
      id: 3,
      categoryName: "python",
    },
    {
      id: 4,
      categoryName: "javascript",
    },
    {
      id: 5,
      categoryName: "c++",
    },
    {
      id: 6,
      categoryName: "php",
    },
    {
      id: 7,
      categoryName: "大数据",
    },
    {
      id: 8,
      categoryName: "spring boot",
    },
    {
      id: 9,
      categoryName: "redis",
    },
    {
      id: 10,
      categoryName: "MySQL",
    },
    {
      id: 11,
      categoryName: "nginx",
    },
    {
      id: 12,
      categoryName: "vue",
    },
  ];
  storesConfig.getCategories(Categories);
};
const getTags = () => {
  let Tags: Array<Tag> = [
    {
      id: 1,
      tagName: "生活倒影",
    },
    {
      id: 2,
      tagName: "java",
    },
    {
      id: 3,
      tagName: "python",
    },
    {
      id: 4,
      tagName: "javascript",
    },
    {
      id: 5,
      tagName: "c++",
    },
    {
      id: 6,
      tagName: "php",
    },
    {
      id: 7,
      tagName: "大数据",
    },
    {
      id: 8,
      tagName: "spring boot",
    },
    {
      id: 9,
      tagName: "redis",
    },
    {
      id: 10,
      tagName: "MySQL",
    },
    {
      id: 11,
      tagName: "nginx",
    },
    {
      id: 12,
      tagName: "vue",
    },
    {
      id: 13,
      tagName: "gpt",
    },
  ];
  storesConfig.getTags(Tags);
};

const createdMethod = () => {
  let toolbarStatus = {
    enter: false,
    visible: true,
  };
  storesConfig.changeToolbarStatus(toolbarStatus);

  isMobile.value = document.body.clientWidth <= 1000;

  window.addEventListener("resize", () => {
    let docWidth = document.body.clientWidth;
    isMobile.value = docWidth <= 1000;
  });

  getCategories();
  getTags();
};
createdMethod();
onMounted(() => {
  // 初始化主题系统 - 确保在组件渲染前完成
  themeStore.initTheme();
  
  // 监听鼠标动画事件
  document.addEventListener('mouse-animation-toggle', (e: any) => {
    if (e.detail.enabled) {
      mousedown();
    }
  });
  
  document.addEventListener('open-settings-modal', handleOpenSettingsModal);
  
  if (mouseAnimation.value) {
    mousedown();
  }
  
  window.addEventListener("scroll", storesConfig.onScrollPage);
  blackstar.dark();
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", storesConfig.onScrollPage);
  document.removeEventListener('mouse-animation-toggle', () => {});
  document.removeEventListener('open-settings-modal', handleOpenSettingsModal);
});
watch(
  () => storesConfig.scrollTop,
  (scrollTop, oldScrollTop) => {
    if (scrollTop < 30) {
      // root.style.setProperty("--translucent", "rgba(0, 0, 0, 0)");
    }

    // 获取文档的总高度
    const docHeight = document.body.scrollHeight;
    // 获取视窗的高度
    const winHeight = window.innerHeight;
    // 计算当前滚动的百分比
    state.percent = Math.round((scrollTop / (docHeight - winHeight)) * 100);

    //如果滑动距离超过屏幕高度三分之一视为进入页面，背景改为白色
    let enter = scrollTop > window.innerHeight / 2;
    const top = scrollTop - oldScrollTop < 0;
    let isShow = scrollTop - window.innerHeight > -1;
    state.showToolButton = isShow;
    if (isShow && !isMobile.value) {
      if (window.innerHeight > 950) {
        $(".cd-top").css("top", "0");
      } else {
        $(".cd-top").css("top", window.innerHeight - 950 + "px");
      }
    } else if (!isShow && !isMobile.value) {
      $(".cd-top").css("top", "-900px");
    }

    //导航栏显示与颜色
    let toolbarStatus = {
      enter: enter,
      visible: top,
    };
    storesConfig.changeToolbarStatus(toolbarStatus);
  }
);
</script>

<style lang="scss" scoped>
.web-bg {
  background: var(--backgroundImage);
  position: fixed;
  width: 100%;
  height: 100%;
  background-attachment: local;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

#universe {
  position: fixed;
  margin: 0;
  padding: 0;
  border: 0;
  outline: 0;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.main-index {
  min-height: 100vh;
  background-color: var(--background);
  display: flex;
  flex-direction: column;
  
  // 移动端优化
  @media screen and (max-width: 768px) {
    // 确保在移动端有足够的底部空间
    padding-bottom: 80px;
    
    // 优化触摸滚动
    -webkit-overflow-scrolling: touch;
    
    // 防止水平滚动
    overflow-x: hidden;
  }
}

#main-container {
  flex: 1 auto;
  -webkit-flex: 1 auto;
}

.el-popper[x-placement^="bottom"] {
  margin-top: -8px;
}

.rightside {
  display: block;
  opacity: 0;
  transform: translateX(-58px);
  position: fixed;
  right: -100px;
  bottom: 40px;
  z-index: 100;
  -moz-transition: all 0.5s;
  -o-transition: all 0.5s;
  -ms-transition: all 0.5s;
  transition: transform 0.5s ease, opacity 0.5s ease;
  // transform: translateX(70px); /* 初始位置在右侧 */

  .rightside-config-hide {
    max-height: 0px;
    opacity: 0;
    transition: max-height 0.6s ease, opacity 0.6s ease, transform 0.6s ease;
    transform: translateX(70px); /* 初始位置在右侧 */
    
    .config-tip {
      padding: 12px 16px;
      background: var(--card-background);
      border-radius: 8px;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-light);
      backdrop-filter: blur(10px);
      white-space: nowrap;
      
      span {
        font-size: 12px;
        color: var(--fontColor);
        display: flex;
        align-items: center;
        gap: 8px;
        
        &::before {
          content: '⚙️';
          font-size: 14px;
        }
      }
    }
  }
  .show {
    max-height: 500px; /* 使用较大的 max-height 值来代替 auto */
    opacity: 1;
    transform: translateY(0); /* 先上移 */
    transition: transform 0.6s ease; /* 上移过渡 0.4s 完成 */
  }

  div > a,
  div > button {
    display: block;
    margin-bottom: 5px;
    width: 35px;
    height: 35px;
    border-radius: 5px;
    background-color: var(--btn-bg);
    color: var(--btn-color);
    text-align: center;
    font-size: 16px;
    line-height: 35px;
  }

  div > a:hover,
  div > button:hover {
    background-color: var(--btn-hover-color);
    color: var(--white);
    transform: translateY(-2px);
  }
  div > a,
  div > button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    font-size: 18px;
    border-radius: 6px;
    border: none;
  }

  .fa-arrow-up {
    display: none;
  }
  .go-up:hover {
    .fa-arrow-up {
      display: block;
    }
    .percent {
      display: none;
    }
  }
  .go-up span {
    margin-right: -1px;
    font-size: 12px !important;
  }
  .go-up .percent {
    font-weight: 700;
    font-size: 15px !important;
  }
}

.rightside.show {
  // max-height: 500px; /* 使用较大的 max-height 值来代替 auto */
  opacity: 1;
  transform: translateX(-120px); /* 平移200px */
  transition: transform 0.5s ease; /* 上移过渡 0.4s 完成 */
}

.cd-top {
  background: var(--toTop) no-repeat center;
  position: fixed;
  right: 5vh;
  top: -900px;
  z-index: 99;
  width: 70px;
  height: 900px;
  background-size: contain;
  transition: all 0.5s ease-in-out;
  cursor: pointer;
}

// 移动端优化
@media screen and (max-width: 768px) {
  // 移动端隐藏右侧工具栏，使用浮动按钮代替
  .rightside {
    display: none !important;
  }
}
</style>
