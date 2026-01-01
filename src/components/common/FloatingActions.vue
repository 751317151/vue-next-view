<template>
  <div class="floating-actions" v-show="shouldShow">
    <!-- 主按钮 -->
    <div 
      class="fab-main"
      :class="{ active: isOpen }"
      @click="toggleMenu"
    >
      <el-icon class="fab-icon">
        <component :is="isOpen ? Close : Menu" />
      </el-icon>
    </div>
    
    <!-- 子按钮 -->
    <transition-group name="fab" tag="div" class="fab-menu">
      <div 
        v-for="(action, index) in actions" 
        :key="action.name"
        v-show="isOpen"
        class="fab-item"
        :style="{ '--delay': `${index * 0.05}s` }"
        @click="handleAction(action)"
      >
        <div class="fab-item-btn" :class="{ active: action.isActive }">
          <el-icon><component :is="action.icon" /></el-icon>
        </div>
      </div>
    </transition-group>
    
    <!-- 遮罩层 -->
    <transition name="fade">
      <div v-if="isOpen" class="fab-overlay" @click="closeMenu"></div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useThemeStore } from '@/stores/theme';
import { useConfig } from '@/stores/config';
import { ElMessage } from 'element-plus';
import { 
  Menu,
  Close, 
  ArrowUp, 
  Share,
  Setting,
  Sunny,
  Moon,
  Monitor,
  List
} from '@element-plus/icons-vue';

const themeStore = useThemeStore();
const configStore = useConfig();

const isOpen = ref(false);
const windowWidth = ref(window.innerWidth);

const shouldShow = computed(() => windowWidth.value <= 1050);

const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

interface Action {
  name: string;
  icon: any;
  isActive?: boolean;
  handler: () => void;
}

// 获取主题标签
const getThemeLabel = (theme: string) => {
  const labels: Record<string, string> = {
    'light': '浅色',
    'dark': '深色',
    'auto': '自动'
  };
  return labels[theme] || theme;
};

// 获取当前主题图标
const getThemeIcon = () => {
  // 显示当前主题的图标
  if (themeStore.currentTheme === 'auto') return Monitor;
  if (themeStore.currentTheme === 'dark') return Moon;
  return Sunny;
};

const actions = computed<Action[]>(() => [
  {
    name: 'top',
    icon: ArrowUp,
    handler: () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },
  {
    name: 'toc',
    icon: List,
    isActive: configStore.showToc,
    handler: () => {
      configStore.changeTocStatus();
      ElMessage.success(configStore.showToc ? '目录已显示' : '目录已隐藏');
    }
  },
  {
    name: 'theme',
    icon: getThemeIcon(),
    handler: () => {
      themeStore.toggleTheme();
      ElMessage.success(`已切换到${getThemeLabel(themeStore.currentTheme)}模式`);
    }
  },
  {
    name: 'settings',
    icon: Setting,
    handler: () => {
      document.dispatchEvent(new CustomEvent('open-settings-modal'));
    }
  },
  {
    name: 'share',
    icon: Share,
    handler: () => {
      if (navigator.share) {
        navigator.share({
          title: document.title,
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        ElMessage.success('链接已复制');
      }
    }
  }
]);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const closeMenu = () => {
  isOpen.value = false;
};

const handleAction = (action: Action) => {
  action.handler();
  setTimeout(closeMenu, 150);
};
</script>

<style lang="scss" scoped>
.floating-actions {
  position: fixed;
  bottom: 24px;
  right: 20px;
  z-index: 1000;
  
  // 桌面端隐藏（与 shouldShow 的 1050px 断点一致）
  @media screen and (min-width: 1051px) {
    display: none !important;
  }
}

.fab-main {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--themeBackground);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1002;
  
  &:active {
    transform: scale(0.92);
  }
  
  &.active {
    background: #ff6b6b;
    transform: rotate(90deg);
  }
  
  .fab-icon {
    font-size: 22px;
  }
}

.fab-menu {
  position: absolute;
  bottom: 64px;
  right: 4px; /* 调整位置使子按钮与主按钮中心对齐 */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  z-index: 1003;
}

.fab-item {
  display: flex;
  align-items: center;
  justify-content: center;
  
  .fab-item-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--card-background);
    color: var(--text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    border: 1px solid var(--border-color-light);
    transition: all 0.2s ease;
    cursor: pointer;
    
    &:active {
      transform: scale(0.9);
      background: var(--themeBackground);
      color: white;
    }
    
    &.active {
      background: var(--themeBackground);
      color: white;
      border-color: var(--themeBackground);
    }
  }
}

.fab-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1001;
}

// 动画
.fab-enter-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: var(--delay);
}

.fab-leave-active {
  transition: all 0.15s ease-in;
}

.fab-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.8);
}

.fab-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 小屏幕优化
@media screen and (max-width: 480px) {
  .floating-actions {
    bottom: 20px;
    right: 16px;
  }
  
  .fab-main {
    width: 48px;
    height: 48px;
    
    .fab-icon {
      font-size: 20px;
    }
  }
  
  .fab-menu {
    bottom: 58px;
    gap: 10px;
  }
  
  .fab-item {
    .fab-item-btn {
      width: 40px;
      height: 40px;
      font-size: 16px;
    }
  }
}
</style>
