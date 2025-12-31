<template>
  <div class="floating-actions" v-show="shouldShow">
    <!-- 主按钮 -->
    <div 
      class="fab-main"
      :class="{ active: isOpen }"
      @click="toggleMenu"
    >
      <el-icon class="fab-icon">
        <component :is="isOpen ? Close : Plus" />
      </el-icon>
    </div>
    
    <!-- 子按钮 -->
    <transition-group name="fab" tag="div" class="fab-menu">
      <div 
        v-for="(action, index) in actions" 
        :key="action.name"
        v-show="isOpen"
        class="fab-item"
        :style="{ 
          '--delay': `${index * 0.1}s`,
          '--index': index + 1
        }"
        @click="handleAction(action)"
      >
        <el-icon class="fab-item-icon">
          <component :is="action.icon" />
        </el-icon>
        <span class="fab-item-label">{{ action.label }}</span>
      </div>
    </transition-group>
    
    <!-- 遮罩层 -->
    <div 
      v-if="isOpen" 
      class="fab-overlay"
      @click="closeMenu"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useThemeStore } from '@/stores/theme';
import { 
  Plus, 
  Close, 
  Search, 
  ArrowUp, 
  Share,
  Setting,
  Sunny
} from '@element-plus/icons-vue';

const themeStore = useThemeStore();

const isOpen = ref(false);
const windowWidth = ref(window.innerWidth);

// 更稳定的移动端检测
const shouldShow = computed(() => {
  return windowWidth.value <= 768; // 使用固定的断点而不是依赖store
});

// 监听窗口大小变化
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  // 初始化时确保正确检测
  handleResize();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

interface Action {
  name: string;
  label: string;
  icon: any;
  handler: () => void;
}

const actions = computed<Action[]>(() => [
  {
    name: 'search',
    label: '搜索',
    icon: Search,
    handler: () => {
      // 触发全局搜索
      const searchInput = document.querySelector('.search-input input') as HTMLInputElement;
      searchInput?.focus();
    }
  },
  {
    name: 'settings',
    label: '设置',
    icon: Setting,
    handler: () => {
      // 触发设置弹框
      const event = new CustomEvent('open-settings-modal', {
        bubbles: true,
        cancelable: true,
        detail: { source: 'floating-actions' }
      });
      document.dispatchEvent(event);
    }
  },
  {
    name: 'theme',
    label: '主题',
    icon: Sunny,
    handler: () => {
      // 切换主题
      themeStore.toggleTheme();
    }
  },
  {
    name: 'share',
    label: '分享',
    icon: Share,
    handler: () => {
      if (navigator.share) {
        navigator.share({
          title: document.title,
          url: window.location.href
        });
      } else {
        // 复制链接到剪贴板
        navigator.clipboard.writeText(window.location.href);
        // 这里可以添加提示消息
      }
    }
  },
  {
    name: 'top',
    label: '回顶部',
    icon: ArrowUp,
    handler: () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
  // 添加触摸反馈
  const activeElement = document.activeElement as HTMLElement;
  if (activeElement) {
    activeElement.style.transform = 'scale(0.95)';
    setTimeout(() => {
      activeElement.style.transform = '';
    }, 150);
  }
  
  action.handler();
  
  // 对于设置操作，延迟关闭菜单以确保弹框能正常打开
  if (action.name === 'settings') {
    setTimeout(() => {
      closeMenu();
    }, 200);
  } else {
    closeMenu();
  }
};
</script>

<style lang="scss" scoped>
.floating-actions {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  
  // 确保在所有页面都能正确显示
  &[v-show="true"] {
    display: block !important;
    opacity: 1;
    visibility: visible;
  }
}

.fab-main {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--themeBackground);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-heavy);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1002;
  border: 2px solid var(--border-color-light);
  
  &:hover {
    transform: scale(1.1);
    box-shadow: var(--shadow-heavy);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &.active {
    transform: rotate(45deg);
    background: var(--danger);
  }
  
  .fab-icon {
    font-size: 24px;
    transition: transform 0.3s ease;
  }
}

.fab-menu {
  position: absolute;
  bottom: 70px;
  right: 0;
  z-index: 1003; /* 确保子按钮在遮罩层之上 */
}

.fab-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  position: relative;
  z-index: 1004; /* 确保子按钮可点击 */
  
  .fab-item-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--card-background);
    color: var(--text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    box-shadow: var(--shadow-medium);
    transition: all 0.3s ease;
    border: 1px solid var(--border-color);
    backdrop-filter: blur(10px); /* 增加背景模糊效果 */
    
    &:hover {
      background: var(--themeBackground);
      color: var(--white);
      transform: scale(1.1);
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
  
  .fab-item-label {
    background: var(--card-background);
    color: var(--text-color);
    padding: 8px 12px;
    border-radius: 20px;
    font-size: 12px;
    white-space: nowrap;
    box-shadow: var(--shadow-light);
    border: 1px solid var(--border-color);
    opacity: 0;
    transform: translateX(10px);
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }
  
  &:hover .fab-item-label {
    opacity: 1;
    transform: translateX(0);
  }
}

.fab-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--translucent);
  z-index: 1001;
  backdrop-filter: blur(2px);
  pointer-events: none; /* 允许子按钮接收点击事件 */
}

// 动画
.fab-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: var(--delay);
}

.fab-leave-active {
  transition: all 0.2s ease-in;
}

.fab-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

.fab-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.9);
}

// 响应式调整
@media screen and (max-width: 480px) {
  .floating-actions {
    bottom: 20px;
    right: 20px;
  }
  
  .fab-main {
    width: 52px;
    height: 52px;
    
    // 增加触摸反馈
    &:active {
      transform: scale(0.9);
    }
    
    .fab-icon {
      font-size: 22px;
    }
  }
  
  .fab-menu {
    z-index: 1005; /* 移动端更高的z-index */
  }
  
  .fab-item {
    margin-bottom: 16px;
    z-index: 1006; /* 确保移动端子按钮可点击 */
    
    .fab-item-icon {
      width: 44px;
      height: 44px;
      font-size: 18px;
      background: var(--card-background);
      border: 2px solid var(--border-color);
      box-shadow: var(--shadow-heavy); /* 增强阴影效果 */
      
      // 增加触摸反馈
      &:active {
        transform: scale(0.9);
        background: var(--themeBackground);
        color: var(--white);
      }
    }
    
    .fab-item-label {
      font-size: 11px;
      padding: 6px 10px;
      // 在移动端始终显示标签
      opacity: 1;
      transform: translateX(0);
      margin-left: 8px;
      background: var(--card-background);
      border: 2px solid var(--border-color);
      box-shadow: var(--shadow-medium);
    }
  }
  
  // 增加触摸区域
  .fab-item {
    padding: 8px;
    border-radius: 12px;
    min-height: 56px; // 确保足够的触摸区域
    background: rgba(var(--card-background), 0.1);
    
    &:active {
      background: var(--btn-bg);
      transform: scale(0.98);
    }
    
    // 改进触摸反馈
    &:hover {
      background: rgba(var(--themeBackground), 0.1);
    }
  }
  
  // 增大主按钮触摸区域
  .fab-main {
    &:active {
      transform: scale(0.9) !important;
      transition: transform 0.1s ease;
    }
  }
  
  // 优化遮罩层
  .fab-overlay {
    background: rgba(0, 0, 0, 0.3); /* 移动端使用更明显的遮罩 */
    backdrop-filter: blur(4px);
  }
}
</style>