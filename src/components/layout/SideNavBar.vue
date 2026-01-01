<template>
  <el-drawer
    v-model="sideNavBarShow"
    :show-close="false"
    size="280px"
    class="mobile-drawer"
    :with-header="false"
    :lock-scroll="false"
    direction="ltr"
    style="height: 100vh;"
  >
    <div class="drawer-content">
      <!-- 用户信息区 -->
      <div class="user-section">
        <div class="user-avatar-wrapper">
          <el-avatar
            class="user-avatar"
            :size="80"
            :src="webInfo.avatar"
          />
        </div>
        <div class="user-name">{{ webInfo.webName || '生活倒影' }}</div>
        <div class="user-stats">
          <div class="stat-item">
            <span class="stat-num">22</span>
            <span class="stat-label">文章</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">12</span>
            <span class="stat-label">分类</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">13</span>
            <span class="stat-label">标签</span>
          </div>
        </div>
      </div>

      <!-- 导航菜单 -->
      <nav class="nav-menu">
        <div 
          class="nav-item"
          :class="{ active: currentPath === '/' }"
          @click="navigateTo('/')"
        >
          <span class="nav-icon">🏡</span>
          <span class="nav-text">首页</span>
        </div>

        <!-- 文章子菜单 -->
        <div class="nav-group">
          <div 
            class="nav-item has-sub"
            :class="{ expanded: expandedMenu === 'article' }"
            @click="toggleSubMenu('article')"
          >
            <span class="nav-icon">📝</span>
            <span class="nav-text">文章</span>
            <span class="nav-arrow">
              <el-icon><ArrowDown /></el-icon>
            </span>
          </div>
          <transition name="slide">
            <div v-show="expandedMenu === 'article'" class="sub-menu">
              <div 
                class="sub-item"
                :class="{ active: currentPath === '/archive' }"
                @click="navigateTo('/archive')"
              >
                <span class="sub-icon">📅</span>
                <span>归档</span>
              </div>
              <div 
                class="sub-item"
                :class="{ active: currentPath === '/categories' }"
                @click="navigateTo('/categories')"
              >
                <span class="sub-icon">📂</span>
                <span>分类</span>
              </div>
              <div 
                class="sub-item"
                :class="{ active: currentPath === '/tags' }"
                @click="navigateTo('/tags')"
              >
                <span class="sub-icon">🏷️</span>
                <span>标签</span>
              </div>
            </div>
          </transition>
        </div>

        <div 
          class="nav-item"
          :class="{ active: currentPath === '/favorite' }"
          @click="navigateTo('/favorite')"
        >
          <span class="nav-icon">🧰</span>
          <span class="nav-text">百宝箱</span>
        </div>

        <div 
          class="nav-item"
          :class="{ active: currentPath === '/travel' }"
          @click="navigateTo('/travel')"
        >
          <span class="nav-icon">✈️</span>
          <span class="nav-text">旅途</span>
        </div>

        <div 
          class="nav-item"
          :class="{ active: currentPath === '/funny' }"
          @click="navigateTo('/funny')"
        >
          <span class="nav-icon">🎺</span>
          <span class="nav-text">曲乐</span>
        </div>

        <div 
          class="nav-item"
          :class="{ active: currentPath === '/message' }"
          @click="navigateTo('/message')"
        >
          <span class="nav-icon">📪</span>
          <span class="nav-text">留言</span>
        </div>

        <div 
          class="nav-item"
          :class="{ active: currentPath === '/friend' }"
          @click="navigateTo('/friend')"
        >
          <span class="nav-icon">💃</span>
          <span class="nav-text">友人帐</span>
        </div>

        <div 
          class="nav-item"
          :class="{ active: currentPath === '/about' }"
          @click="navigateTo('/about')"
        >
          <span class="nav-icon">🐟</span>
          <span class="nav-text">关于</span>
        </div>
      </nav>

      <!-- 底部操作区 -->
      <div class="drawer-footer">
        <div class="footer-actions">
          <button class="action-btn" @click="toggleTheme">
            <el-icon><component :is="currentThemeIcon" /></el-icon>
            <span>{{ currentThemeLabel }}</span>
          </button>
          <button class="action-btn" @click="openSettings">
            <el-icon><Setting /></el-icon>
            <span>设置</span>
          </button>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useConfig } from "@/stores/config";
import { useThemeStore } from "@/stores/theme";
import { ArrowDown, Sunny, Moon, Setting, Monitor } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const router = useRouter();
const route = useRoute();
const storesConfig = useConfig();
const themeStore = useThemeStore();

const { webInfo, sideNavBarShow } = storeToRefs(storesConfig);

const expandedMenu = ref<string | null>(null);
const currentPath = computed(() => route.path);

// 获取当前主题的图标
const currentThemeIcon = computed(() => {
  if (themeStore.currentTheme === 'auto') return Monitor;
  if (themeStore.currentTheme === 'dark') return Moon;
  return Sunny;
});

// 获取当前主题的标签
const currentThemeLabel = computed(() => {
  const labels: Record<string, string> = {
    'light': '浅色',
    'dark': '深色',
    'auto': '自动'
  };
  return labels[themeStore.currentTheme];
});

// 监听路由变化，自动展开对应的子菜单
watch(() => route.path, (path) => {
  if (['/archive', '/categories', '/tags'].includes(path) || path.startsWith('/categories/') || path.startsWith('/tags/')) {
    expandedMenu.value = 'article';
  }
}, { immediate: true });

const toggleSubMenu = (menu: string) => {
  expandedMenu.value = expandedMenu.value === menu ? null : menu;
};

const navigateTo = (path: string) => {
  router.push(path);
  // 延迟关闭，让用户看到点击效果
  setTimeout(() => {
    sideNavBarShow.value = false;
  }, 150);
};

const getThemeLabel = (theme: string) => {
  const labels: Record<string, string> = {
    'light': '浅色',
    'dark': '深色',
    'auto': '跟随系统'
  };
  return labels[theme] || theme;
};

const toggleTheme = () => {
  themeStore.toggleTheme();
  ElMessage.success(`已切换到${getThemeLabel(themeStore.currentTheme)}模式`);
};

const openSettings = () => {
  sideNavBarShow.value = false;
  setTimeout(() => {
    document.dispatchEvent(new CustomEvent('open-settings-modal'));
  }, 200);
};
</script>

<style lang="scss" scoped>
.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--card-background);
}

// 用户信息区
.user-section {
  padding: 30px 20px 20px;
  text-align: center;
  background: linear-gradient(135deg, var(--themeBackground) 0%, #ff9a56 100%);
  color: #fff;
}

.user-avatar-wrapper {
  margin-bottom: 12px;
  
  .user-avatar {
    border: 3px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.user-stats {
  display: flex;
  justify-content: center;
  gap: 30px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .stat-num {
    font-size: 18px;
    font-weight: 700;
  }
  
  .stat-label {
    font-size: 12px;
    opacity: 0.9;
    margin-top: 2px;
  }
}

// 导航菜单
.nav-menu {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 14px 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--fontColor);
  
  &:active {
    background: var(--maxMaxLightGray);
  }
  
  &.active {
    color: var(--themeBackground);
    background: rgba(255, 165, 0, 0.1);
    
    .nav-icon {
      transform: scale(1.1);
    }
  }
  
  &.has-sub {
    .nav-arrow {
      margin-left: auto;
      transition: transform 0.3s ease;
    }
    
    &.expanded .nav-arrow {
      transform: rotate(180deg);
    }
  }
}

.nav-icon {
  font-size: 20px;
  margin-right: 14px;
  transition: transform 0.2s ease;
}

.nav-text {
  font-size: 15px;
  font-weight: 500;
}

// 子菜单
.sub-menu {
  background: var(--maxMaxLightGray);
  overflow: hidden;
}

.sub-item {
  display: flex;
  align-items: center;
  padding: 12px 24px 12px 58px;
  cursor: pointer;
  color: var(--fontColor);
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:active {
    background: rgba(0, 0, 0, 0.05);
  }
  
  &.active {
    color: var(--themeBackground);
  }
  
  .sub-icon {
    margin-right: 10px;
    font-size: 16px;
  }
}

// 子菜单动画
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 200px;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

// 底部操作区
.drawer-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--borderColor);
  background: var(--card-background);
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border: 1px solid var(--borderColor);
  border-radius: 8px;
  background: var(--card-background);
  color: var(--fontColor);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:active {
    background: var(--maxMaxLightGray);
    transform: scale(0.98);
  }
  
  .el-icon {
    font-size: 16px;
  }
}
</style>

<style lang="scss">
// 全局样式覆盖 drawer
.mobile-drawer {
  .el-drawer__body {
    padding: 0 !important;
    overflow: hidden;
  }
}

.mobile-drawer.el-drawer {
  height: 100vh !important;
  max-height: 100vh !important;
}
</style>
