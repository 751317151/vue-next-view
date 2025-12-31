<template>
  <div class="reading-progress-container" v-if="showProgress" :class="{ 'nav-hidden': !navVisible }">
    <div 
      class="reading-progress-bar"
      :style="{ width: progress + '%' }"
    ></div>
    <div class="reading-info" v-if="showInfo" :class="{ 'nav-hidden': !navVisible }">
      <span class="reading-percentage">{{ Math.round(progress) }}%</span>
      <span class="reading-time">{{ estimatedTime }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useConfig } from '@/stores/config';

interface Props {
  showInfo?: boolean;
  wordsPerMinute?: number;
}

const props = withDefaults(defineProps<Props>(), {
  showInfo: true,
  wordsPerMinute: 200
});

const storesConfig = useConfig();
const { toolbar } = storeToRefs(storesConfig);

const progress = ref(0);
const showProgress = ref(false);

// 监听导航栏可见性
const navVisible = computed(() => toolbar.value.visible);

const estimatedTime = computed(() => {
  const remainingProgress = 100 - progress.value;
  const totalWords = document.body.innerText?.split(/\s+/).length || 0;
  const remainingWords = Math.round((totalWords * remainingProgress) / 100);
  const minutes = Math.ceil(remainingWords / props.wordsPerMinute);
  
  if (minutes < 1) return '< 1分钟';
  return `${minutes}分钟`;
});

const updateProgress = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight;
  const winHeight = window.innerHeight;
  
  // 计算可滚动的总高度
  const scrollableHeight = docHeight - winHeight;
  
  if (scrollableHeight <= 0) {
    progress.value = 100;
    return;
  }
  
  // 计算滚动百分比
  const scrollPercentage = (scrollTop / scrollableHeight) * 100;
  progress.value = Math.min(Math.max(scrollPercentage, 0), 100);
  
  // 当滚动超过一定距离时显示进度条
  showProgress.value = scrollTop > 100;
};

const handleScroll = () => {
  requestAnimationFrame(updateProgress);
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('resize', updateProgress);
});
</script>

<style lang="scss" scoped>
.reading-progress-container {
  position: fixed;
  top: 60px; // 导航栏高度，避免遮挡
  left: 0;
  right: 0;
  z-index: 99; // 降低 z-index，确保不遮挡导航栏
  height: 3px;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  transition: top 0.3s ease;
  
  // 当导航栏隐藏时，进度条移到顶部
  &.nav-hidden {
    top: 0;
  }
}

.reading-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--themeBackground), var(--themeBackground-light, #42b883));
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(var(--themeBackground-rgb, 64, 158, 255), 0.3);
}

.reading-info {
  position: fixed;
  top: 75px; // 调整位置，避免与导航栏冲突
  right: 20px;
  background: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 12px;
  color: var(--text-color-secondary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 98; // 确保不遮挡导航栏
  transition: top 0.3s ease;
  
  // 当导航栏隐藏时，信息框移到顶部
  &.nav-hidden {
    top: 15px;
  }
  
  .reading-percentage {
    color: var(--themeBackground);
    font-weight: 600;
  }
  
  .reading-time {
    &::before {
      content: '📖';
      margin-right: 4px;
    }
  }
}

@media screen and (max-width: 768px) {
  .reading-progress-container {
    top: 60px; // 移动端导航栏高度
    
    &.nav-hidden {
      top: 0;
    }
  }
  
  .reading-info {
    top: 70px;
    right: 10px;
    padding: 6px 12px;
    font-size: 11px;
    
    &.nav-hidden {
      top: 10px;
    }
  }
}
</style>