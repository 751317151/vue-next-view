<template>
  <teleport to="body">
    <transition name="modal" appear>
      <div v-if="visible" class="settings-modal-overlay" @click="handleOverlayClick">
        <div class="settings-modal" @click.stop>
          <!-- 移动端拖拽指示器 -->
          <div class="drag-indicator"></div>
          
          <!-- 头部 -->
          <div class="modal-header">
            <h3 class="modal-title">
              <el-icon class="title-icon"><Setting /></el-icon>
              设置
            </h3>
            <button class="close-btn" @click="closeModal">
              <el-icon><Close /></el-icon>
            </button>
          </div>
          
          <!-- 内容 -->
          <div class="modal-content">
            <!-- 主题设置 -->
            <div class="setting-section">
              <div class="section-header">
                <el-icon class="section-icon"><Sunny /></el-icon>
                <h4>主题</h4>
              </div>
              <div class="theme-options">
                <div 
                  v-for="theme in themeOptions" 
                  :key="theme.name"
                  class="theme-option"
                  :class="{ active: currentTheme === theme.name }"
                  @click="handleThemeChange(theme.name)"
                >
                  <div class="theme-preview" :style="{ background: theme.gradient }">
                    <el-icon class="theme-icon">
                      <component :is="theme.icon" />
                    </el-icon>
                  </div>
                  <span class="theme-label">{{ theme.label }}</span>
                  <div v-if="currentTheme === theme.name" class="theme-check">
                    <el-icon><Check /></el-icon>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 显示设置 -->
            <div class="setting-section">
              <div class="section-header">
                <el-icon class="section-icon"><View /></el-icon>
                <h4>显示</h4>
              </div>
              <div class="setting-items">
                <div class="setting-item">
                  <div class="item-info">
                    <span class="item-label">鼠标点击特效</span>
                    <span class="item-desc">点击时显示动画</span>
                  </div>
                  <el-switch 
                    v-model="mouseAnimation" 
                    @change="handleMouseAnimationChange"
                  />
                </div>
                
                <div class="setting-item">
                  <div class="item-info">
                    <span class="item-label">页面动画</span>
                    <span class="item-desc">页面切换动画效果</span>
                  </div>
                  <el-switch 
                    v-model="pageAnimation" 
                    @change="handlePageAnimationChange"
                  />
                </div>
              </div>
            </div>
            
            <!-- 快捷操作 -->
            <div class="setting-section">
              <div class="section-header">
                <el-icon class="section-icon"><Tools /></el-icon>
                <h4>快捷操作</h4>
              </div>
              <div class="quick-actions">
                <div class="action-btn" @click="handleScrollTop">
                  <el-icon><ArrowUp /></el-icon>
                  <span>回到顶部</span>
                </div>
                <div class="action-btn" @click="handleShare">
                  <el-icon><Share /></el-icon>
                  <span>分享</span>
                </div>
                <div class="action-btn" @click="handleRefresh">
                  <el-icon><Refresh /></el-icon>
                  <span>刷新</span>
                </div>
                <div class="action-btn" @click="handleAbout">
                  <el-icon><InfoFilled /></el-icon>
                  <span>关于</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 底部 -->
          <div class="modal-footer">
            <span class="copyright">© 2024 BlackStar's Blog</span>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useThemeStore } from '@/stores/theme';
import { 
  Setting, 
  Close, 
  Sunny, 
  Moon, 
  Monitor, 
  Check, 
  View, 
  Tools, 
  ArrowUp,
  Share,
  Refresh,
  InfoFilled
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

interface Props {
  visible: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

const router = useRouter();
const themeStore = useThemeStore();
const { currentTheme, mouseAnimation } = storeToRefs(themeStore);

// 本地状态
const pageAnimation = ref(true);

// 主题选项
const themeOptions = [
  {
    name: 'light',
    label: '浅色',
    icon: Sunny,
    gradient: 'linear-gradient(135deg, #74b9ff 0%, #a29bfe 100%)'
  },
  {
    name: 'dark',
    label: '深色',
    icon: Moon,
    gradient: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)'
  },
  {
    name: 'auto',
    label: '自动',
    icon: Monitor,
    gradient: 'linear-gradient(135deg, #74b9ff 0%, #636e72 100%)'
  }
];

// 关闭弹框
const closeModal = () => {
  emit('update:visible', false);
};

// 点击遮罩关闭
const handleOverlayClick = () => {
  closeModal();
};

// 主题切换
const handleThemeChange = (themeName: string) => {
  themeStore.setTheme(themeName as any);
  ElMessage.success(`已切换到${themeOptions.find(t => t.name === themeName)?.label}模式`);
};

// 鼠标动画切换
const handleMouseAnimationChange = () => {
  themeStore.toggleMouseAnimation();
};

// 页面动画切换
const handlePageAnimationChange = () => {
  ElMessage.success(pageAnimation.value ? '已开启页面动画' : '已关闭页面动画');
};

// 回到顶部
const handleScrollTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  closeModal();
};

// 分享
const handleShare = () => {
  if (navigator.share) {
    navigator.share({
      title: document.title,
      url: window.location.href
    });
  } else {
    navigator.clipboard.writeText(window.location.href);
    ElMessage.success('链接已复制');
  }
  closeModal();
};

// 刷新页面
const handleRefresh = () => {
  closeModal();
  setTimeout(() => {
    window.location.reload();
  }, 300);
};

// 关于网站
const handleAbout = () => {
  router.push('/about');
  closeModal();
};
</script>

<style lang="scss" scoped>
.settings-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.settings-modal {
  background: var(--card-background);
  border-radius: 24px;
  width: 100%;
  max-width: 420px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color-light);
  display: flex;
  flex-direction: column;
}

.drag-indicator {
  display: none;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color-light);
  
  .modal-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    color: var(--text-color);
    font-size: 18px;
    font-weight: 600;
    
    .title-icon {
      font-size: 22px;
      color: var(--themeBackground);
    }
  }
  
  .close-btn {
    width: 36px;
    height: 36px;
    border: none;
    background: var(--background);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--text-color);
    
    &:hover {
      background: var(--themeBackground);
      color: white;
    }
    
    &:active {
      transform: scale(0.9);
    }
  }
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 2px;
  }
}

.setting-section {
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    
    .section-icon {
      font-size: 18px;
      color: var(--themeBackground);
    }
    
    h4 {
      margin: 0;
      color: var(--text-color);
      font-size: 15px;
      font-weight: 600;
    }
  }
}

.theme-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 10px;
  border-radius: 16px;
  background: var(--background);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: scale(0.96);
  }
  
  &.active {
    border-color: var(--themeBackground);
    background: rgba(var(--themeBackground-rgb), 0.1);
    
    .theme-label {
      color: var(--themeBackground);
      font-weight: 600;
    }
  }
  
  .theme-preview {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    
    .theme-icon {
      font-size: 20px;
      color: white;
    }
  }
  
  .theme-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-color);
  }
  
  .theme-check {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 18px;
    height: 18px;
    background: var(--themeBackground);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .el-icon {
      font-size: 10px;
      color: white;
    }
  }
}

.setting-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: 14px;
  background: var(--background);
  transition: all 0.2s ease;
  
  .item-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    
    .item-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-color);
    }
    
    .item-desc {
      font-size: 12px;
      color: var(--text-color-secondary);
      opacity: 0.7;
    }
  }
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px;
  border-radius: 14px;
  background: var(--background);
  cursor: pointer;
  transition: all 0.2s ease;
  
  .el-icon {
    font-size: 22px;
    color: var(--themeBackground);
  }
  
  span {
    font-size: 11px;
    color: var(--text-color);
    font-weight: 500;
  }
  
  &:hover {
    background: var(--themeBackground);
    transform: translateY(-2px);
    
    .el-icon, span {
      color: white;
    }
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color-light);
  text-align: center;
  
  .copyright {
    font-size: 12px;
    color: var(--text-color-secondary);
    opacity: 0.6;
  }
}

// 动画
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
  
  .settings-modal {
    transition: transform 0.3s ease;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  
  .settings-modal {
    transform: scale(0.9) translateY(20px);
  }
}

// 移动端样式
@media screen and (max-width: 768px) {
  .settings-modal-overlay {
    padding: 0;
    align-items: flex-end;
  }
  
  .settings-modal {
    max-width: 100%;
    max-height: 75vh;
    border-radius: 24px 24px 0 0;
  }
  
  .drag-indicator {
    display: block;
    width: 36px;
    height: 4px;
    background: var(--border-color);
    border-radius: 2px;
    margin: 10px auto 0;
  }
  
  .modal-header {
    padding: 16px 20px;
    
    .modal-title {
      font-size: 17px;
    }
    
    .close-btn {
      width: 40px;
      height: 40px;
    }
  }
  
  .modal-content {
    padding: 16px 20px;
  }
  
  .theme-options {
    gap: 10px;
  }
  
  .theme-option {
    padding: 12px 8px;
    
    .theme-preview {
      width: 40px;
      height: 40px;
      
      .theme-icon {
        font-size: 18px;
      }
    }
    
    .theme-label {
      font-size: 12px;
    }
  }
  
  .setting-item {
    padding: 16px;
    
    .item-info .item-label {
      font-size: 15px;
    }
  }
  
  .quick-actions {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
  
  .action-btn {
    padding: 12px 6px;
    
    .el-icon {
      font-size: 20px;
    }
    
    span {
      font-size: 10px;
    }
  }
  
  // 增大开关触摸区域
  :deep(.el-switch) {
    transform: scale(1.1);
  }
  
  .modal-footer {
    padding: 14px 20px 24px;
  }
  
  // 移动端进入动画
  .modal-enter-from .settings-modal,
  .modal-leave-to .settings-modal {
    transform: translateY(100%);
  }
}
</style>
