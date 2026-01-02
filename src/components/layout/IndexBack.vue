<template>
  <header ref="header">
    <!-- 移动端背景 -->
    <el-image
      v-show="isMobile"
      style="animation: header-effect 2s"
      class="background-image"
      src="https://bu.dusays.com/2022/05/03/627010707b598.webp"
      fit="cover"
    />
    
    <!-- 桌面端视差背景 -->
    <div v-show="!isMobile" class="view">
      <div>
        <img
          ref="imgbg1"
          src="https://cdn.naccl.top/blog/img/bg1.jpg"
          style="display: none"
        />
        <div
          class="bg1"
          style="background-image: url('https://cdn.naccl.top/blog/img/bg1.jpg');"
        ></div>
        <div
          class="bg2"
          style="background-image: url('https://cdn.naccl.top/blog/img/bg2.jpg');"
        ></div>
        <div
          class="bg3"
          style="background-image: url('https://cdn.naccl.top/blog/img/bg3.jpg');"
          v-show="state.loaded"
        ></div>
      </div>
    </div>

    <!-- 首页内容区 -->
    <div class="hero-content myCenter my-animation-hideToShow">
      <!-- 头像 -->
      <div class="hero-avatar">
        <el-avatar :size="100" :src="webInfo.avatar" />
      </div>
      
      <!-- 标题 -->
      <h1 class="hero-title">
        <span class="title-text">{{ webInfo.webName || 'BlackStar' }}</span>
      </h1>
      
      <!-- 打字机签名 -->
      <div class="hero-subtitle">
        <span class="typing-text">{{ displayText }}</span>
        <span class="typing-cursor">|</span>
      </div>
      
      <!-- 诗词展示 -->
      <div class="hero-poem" @click="getGuShi()">
        <span class="poem-icon">📜</span>
        <span class="poem-text">{{ state.printerInfo }}</span>
        <span class="poem-refresh">
          <el-icon><Refresh /></el-icon>
        </span>
      </div>
      
      <!-- 社交媒体链接 -->
      <div class="social-links">
        <a href="https://github.com" target="_blank" class="social-link" title="GitHub">
          <i class="fa fa-github"></i>
        </a>
        <a href="mailto:example@email.com" class="social-link" title="邮箱">
          <i class="fa fa-envelope"></i>
        </a>
        <a href="#" class="social-link" title="微信">
          <i class="fa fa-weixin"></i>
        </a>
        <a href="#" class="social-link" title="QQ">
          <i class="fa fa-qq"></i>
        </a>
        <a href="#" class="social-link" title="微博">
          <i class="fa fa-weibo"></i>
        </a>
      </div>
      
      <!-- 统计信息 -->
      <div class="hero-stats">
        <div class="stat-item">
          <span class="stat-num">{{ stats.articles }}</span>
          <span class="stat-label">文章</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-num">{{ stats.categories }}</span>
          <span class="stat-label">分类</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-num">{{ stats.tags }}</span>
          <span class="stat-label">标签</span>
        </div>
      </div>
    </div>

    <!-- 滚动指示器 -->
    <div class="scroll-indicator" @click="scrollToNavigation('.page-container-wrap')">
      <div class="scroll-text">向下滚动</div>
      <div class="scroll-arrow">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>

    <!-- 波浪效果 -->
    <div v-show="!isMobile" class="wave">
      <div class="wave1"></div>
      <div class="wave2"></div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from "vue";
import { storeToRefs } from "pinia";
import { useConfig } from "@/stores/config";
import { Refresh } from "@element-plus/icons-vue";
import constant from "@/utils/constant";
import { getBlogStats } from "@/api/stats";

const storesConfig = useConfig();
const { isMobile, webInfo } = storeToRefs(storesConfig);

const state = reactive({
  loaded: false,
  printerInfo: "你看对面的青山多漂亮",
  guShi: {
    content: "",
    origin: "",
    author: "",
    category: "",
  },
});

// 统计数据
const stats = reactive({
  articles: 0,
  categories: 0,
  tags: 0
});

const loadStats = async () => {
  try {
    const data = await getBlogStats();
    stats.articles = data.articleCount;
    stats.categories = data.categoryCount;
    stats.tags = data.tagCount;
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
};

// 打字机效果
const signatures = [
  "全栈开发者 | 技术分享者 | 终身学习者",
  "用代码书写生活，用技术改变世界",
  "Stay hungry, Stay foolish",
  "生活不止眼前的代码，还有诗和远方"
];
const currentSignatureIndex = ref(0);
const displayText = ref("");
const isDeleting = ref(false);
let typingTimer: number | null = null;

const typeWriter = () => {
  const currentText = signatures[currentSignatureIndex.value];
  
  if (!isDeleting.value) {
    // 打字
    if (displayText.value.length < currentText.length) {
      displayText.value = currentText.substring(0, displayText.value.length + 1);
      typingTimer = window.setTimeout(typeWriter, 100);
    } else {
      // 打完后等待一段时间再删除
      typingTimer = window.setTimeout(() => {
        isDeleting.value = true;
        typeWriter();
      }, 2000);
    }
  } else {
    // 删除
    if (displayText.value.length > 0) {
      displayText.value = displayText.value.substring(0, displayText.value.length - 1);
      typingTimer = window.setTimeout(typeWriter, 50);
    } else {
      // 删完后切换到下一个签名
      isDeleting.value = false;
      currentSignatureIndex.value = (currentSignatureIndex.value + 1) % signatures.length;
      typingTimer = window.setTimeout(typeWriter, 500);
    }
  }
};

const header = ref<HTMLElement | null>(null);
const imgbg1 = ref<HTMLImageElement | null>(null);

const scrollToNavigation = (selector: string) => {
  let pageId = document.querySelector(selector);
  if (pageId) {
    window.scrollTo({
      top: (pageId as HTMLElement).offsetTop,
      behavior: "smooth",
    });
  }
};

const getGuShi = () => {
  let xhr = new XMLHttpRequest();
  xhr.open("get", constant.jinrishici);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      state.guShi = JSON.parse(xhr.responseText);
      state.printerInfo = state.guShi.content;
    }
  };
  xhr.send();
};

onMounted(() => {
  // 背景图加载
  if (imgbg1.value) {
    imgbg1.value.onload = () => {
      state.loaded = true;
    };
  }

  // 视差效果
  if (header.value) {
    let startingPoint = 0;
    const headerEl = header.value;
    
    headerEl.addEventListener("mouseenter", (e: MouseEvent) => {
      startingPoint = e.clientX;
    });
    headerEl.addEventListener("mouseout", () => {
      headerEl.classList.remove("moving");
      headerEl.style.setProperty("--percentage", "0.5");
    });
    headerEl.addEventListener("mousemove", (e: MouseEvent) => {
      let percentage = (e.clientX - startingPoint) / window.outerWidth + 0.5;
      headerEl.style.setProperty("--percentage", String(percentage));
      headerEl.classList.add("moving");
    });
  }

  // 启动打字机效果
  typeWriter();
  
  // 获取诗词
  getGuShi();
  
  // 加载统计数据
  loadStats();
});

onUnmounted(() => {
  if (typingTimer) {
    clearTimeout(typingTimer);
  }
});
</script>

<style lang="scss" scoped>
header {
  --percentage: 0.5;
  user-select: none;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.view {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  transform: translatex(calc(var(--percentage) * 100px));
}

.view div {
  background-position: center center;
  background-size: cover;
  position: absolute;
  width: 110%;
  height: 100%;
}

.view .bg1 {
  z-index: 10;
  width: 100%;
  opacity: calc(1 - (var(--percentage) - 0.5) / 0.3);
}

.view .bg2 {
  z-index: 20;
  width: 110%;
  opacity: calc(1 - (var(--percentage) - 0.25) / 0.25);
}

.view .bg3 {
  width: 110%;
  left: -10%;
  opacity: calc(0.2 + (var(--percentage) - 0.3) / 0.3);
}

header .view,
header .bg1,
header .bg2,
header .bg3 {
  transition: 0.2s all ease-in;
}

header.moving .view,
header.moving .bg1,
header.moving .bg2,
header.moving .bg3 {
  transition: none;
}

/* 主内容区 */
.hero-content {
  position: absolute;
  flex-direction: column;
  left: 0;
  right: 0;
  margin: auto;
  top: 50%;
  transform: translateY(-50%);
  z-index: 50;
  text-align: center;
  padding: 0 20px;
}

.hero-avatar {
  margin-bottom: 20px;
  
  :deep(.el-avatar) {
    border: 4px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    transition: transform 0.3s ease;
    
    &:hover {
      transform: scale(1.05);
    }
  }
}

.hero-title {
  margin: 0 0 15px 0;
  
  .title-text {
    font-size: 48px;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    animation: 10s linear 0s infinite normal none running light_15px;
  }
}

.hero-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 20px;
  min-height: 28px;
  
  .typing-text {
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
  
  .typing-cursor {
    animation: blink 1s infinite;
    color: var(--themeBackground);
    font-weight: bold;
  }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.hero-poem {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 12px 20px;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 25px;
  max-width: 90%;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
    
    .poem-refresh {
      opacity: 1;
      transform: rotate(180deg);
    }
  }
  
  .poem-icon {
    font-size: 20px;
  }
  
  .poem-text {
    color: #fff;
    font-size: 15px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }
  
  .poem-refresh {
    opacity: 0;
    transition: all 0.3s ease;
    color: #fff;
  }
}

/* 社交链接 */
.social-links {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 25px;
}

.social-link {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  transition: all 0.3s ease;
  text-decoration: none;
  
  &:hover {
    background: var(--themeBackground);
    transform: translateY(-3px) scale(1.1);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }
}

/* 统计信息 */
.hero-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 15px 30px;
  border-radius: 50px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .stat-num {
    font-size: 24px;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
  
  .stat-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    margin-top: 2px;
  }
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: rgba(255, 255, 255, 0.3);
}

/* 滚动指示器 */
.scroll-indicator {
  position: absolute;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 90;
  cursor: pointer;
  text-align: center;
  
  .scroll-text {
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    margin-bottom: 10px;
    letter-spacing: 2px;
  }
  
  .scroll-arrow {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    span {
      display: block;
      width: 20px;
      height: 20px;
      border-bottom: 2px solid rgba(255, 255, 255, 0.6);
      border-right: 2px solid rgba(255, 255, 255, 0.6);
      transform: rotate(45deg);
      margin: -8px 0;
      animation: scrollArrow 2s infinite;
      
      &:nth-child(2) {
        animation-delay: 0.2s;
      }
      
      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }
  
  &:hover {
    .scroll-text {
      color: #fff;
    }
    
    .scroll-arrow span {
      border-color: #fff;
    }
  }
}

@keyframes scrollArrow {
  0% {
    opacity: 0;
    transform: rotate(45deg) translate(-5px, -5px);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: rotate(45deg) translate(5px, 5px);
  }
}

/* 波浪效果 */
.wave {
  position: absolute;
  bottom: 0;
  height: 90px;
  width: 100%;
}

.wave1,
.wave2 {
  position: absolute;
  bottom: 0;
  transition-duration: 0.4s, 0.4s;
  z-index: 80;
  animation: gradientBG 120s linear infinite;
}

.wave1 {
  height: 80px;
  width: 200%;
  background: url("https://cdn.naccl.top/blog/img/wave1.png") repeat-x;
}

.wave2 {
  height: 90px;
  width: 400%;
  background: url("https://cdn.naccl.top/blog/img/wave2.png") repeat-x;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .hero-content {
    top: 45%;
  }
  
  .hero-avatar {
    margin-bottom: 15px;
    
    :deep(.el-avatar) {
      width: 80px !important;
      height: 80px !important;
    }
  }
  
  .hero-title .title-text {
    font-size: 32px;
  }
  
  .hero-subtitle {
    font-size: 14px;
    padding: 0 20px;
  }
  
  .hero-poem {
    padding: 10px 15px;
    
    .poem-text {
      font-size: 13px;
    }
  }
  
  .social-links {
    gap: 10px;
  }
  
  .social-link {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
  
  .hero-stats {
    padding: 12px 20px;
    gap: 15px;
    
    .stat-num {
      font-size: 20px;
    }
    
    .stat-label {
      font-size: 11px;
    }
  }
  
  .scroll-indicator {
    bottom: 100px;
  }
}
</style>
