<template>
  <teleport to="body">
    <transition name="modal" appear>
      <div v-if="visible" class="settings-modal-overlay" @click="handleOverlayClick">
        <div class="settings-modal" @click.stop>
          <!-- 头部 -->
          <div class="modal-header">
            <h3 class="modal-title">
              <el-icon class="title-icon"><Setting /></el-icon>
              设置中心
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
                <h4>主题设置</h4>
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
                <h4>显示设置</h4>
              </div>
              <div class="setting-items">
                <div class="setting-item">
                  <div class="item-info">
                    <span class="item-label">阅读模式</span>
                    <span class="item-desc">专注阅读体验</span>
                  </div>
                  <el-switch 
                    v-model="readingMode" 
                    @change="handleReadingModeChange"
                  />
                </div>
                
                <div class="setting-item">
                  <div class="item-info">
                    <span class="item-label">鼠标点击动画</span>
                    <span class="item-desc">点击时显示动画效果</span>
                  </div>
                  <el-switch 
                    v-model="mouseAnimation" 
                    @change="handleMouseAnimationChange"
                  />
                </div>
                
                <div class="setting-item">
                  <div class="item-info">
                    <span class="item-label">阅读进度</span>
                    <span class="item-desc">显示页面阅读进度</span>
                  </div>
                  <el-switch 
                    v-model="showReadingProgress" 
                    @change="handleReadingProgressChange"
                  />
                </div>
              </div>
            </div>
            
            <!-- 其他设置 -->
            <div class="setting-section">
              <div class="section-header">
                <el-icon class="section-icon"><Tools /></el-icon>
                <h4>其他设置</h4>
              </div>
              <div class="setting-items">
                <div class="setting-item clickable" @click="handleShare">
                  <div class="item-info">
                    <span class="item-label">分享网站</span>
                    <span class="item-desc">分享给朋友</span>
                  </div>
                  <el-icon class="item-arrow"><ArrowRight /></el-icon>
                </div>
                
                <div class="setting-item clickable" @click="handleFeedback">
                  <div class="item-info">
                    <span class="item-label">意见反馈</span>
                    <span class="item-desc">帮助我们改进</span>
                  </div>
                  <el-icon class="item-arrow"><ArrowRight /></el-icon>
                </div>
                
                <div class="setting-item clickable" @click="handleAbout">
                  <div class="item-info">
                    <span class="item-label">关于网站</span>
                    <span class="item-desc">了解更多信息</span>
                  </div>
                  <el-icon class="item-arrow"><ArrowRight /></el-icon>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 底部 -->
          <div class="modal-footer">
            <div class="footer-info">
              <span class="version">v1.0.0</span>
              <span class="copyright">© 2024 生活倒影</span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
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
  ArrowRight 
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
const readingMode = ref(false);
const showReadingProgress = ref(true);

// 主题选项
const themeOptions = [
  {
    name: 'light',
    label: '浅色模式',
    icon: Sunny,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    name: 'dark',
    label: '深色模式',
    icon: Moon,
    gradient: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
  },
  {
    name: 'auto',
    label: '跟随系统',
    icon: Monitor,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #2c3e50 100%)'
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
  ElMessage.success(`已切换到${themeOptions.find(t => t.name === themeName)?.label}`);
};

// 阅读模式切换
const handleReadingModeChange = (value: boolean) => {
  if (value) {
    document.body.classList.add('reading-mode');
    ElMessage.success('已开启阅读模式');
  } else {
    document.body.classList.remove('reading-mode');
    ElMessage.success('已关闭阅读模式');
  }
};

// 鼠标动画切换
const handleMouseAnimationChange = (value: boolean) => {
  themeStore.toggleMouseAnimation();
  ElMessage.success(value ? '已开启鼠标动画' : '已关闭鼠标动画');
};

// 阅读进度切换
const handleReadingProgressChange = (value: boolean) => {
  // 这里可以添加控制阅读进度显示的逻辑
  ElMessage.success(value ? '已显示阅读进度' : '已隐藏阅读进度');
};

// 分享
const handleShare = () => {
  if (navigator.share) {
    navigator.share({
      title: '生活倒影',
      text: '一个优雅的个人博客',
      url: window.location.href
    });
  } else {
    navigator.clipboard.writeText(window.location.href);
    ElMessage.success('链接已复制到剪贴板');
  }
};

// 意见反馈
const handleFeedback = () => {
  ElMessage.info('感谢您的反馈！');
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
  background: var(--translucent);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.settings-modal {
  background: var(--card-background);
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: var(--shadow-heavy);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-color-light);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0;
  
  .modal-title {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
    color: var(--text-color);
    font-size: 20px;
    font-weight: 600;
    
    .title-icon {
      font-size: 24px;
      color: var(--themeBackground);
    }
  }
  
  .close-btn {
    width: 36px;
    height: 36px;
    border: none;
    background: var(--btn-bg);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    color: var(--btn-color);
    
    &:hover {
      background: var(--btn-hover-color);
      color: var(--white);
      transform: scale(1.1);
    }
  }
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--background);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
    
    &:hover {
      background: var(--text-color-secondary);
    }
  }
}

.setting-section {
  margin-bottom: 32px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    
    .section-icon {
      font-size: 20px;
      color: var(--themeBackground);
    }
    
    h4 {
      margin: 0;
      color: var(--text-color);
      font-size: 16px;
      font-weight: 600;
    }
  }
}

.theme-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  background: var(--background);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-medium);
  }
  
  &.active {
    border-color: var(--themeBackground);
    background: var(--themeBackground);
    color: var(--white);
    
    .theme-label {
      color: var(--white);
    }
  }
  
  .theme-preview {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    
    .theme-icon {
      font-size: 24px;
      color: var(--white);
      z-index: 1;
    }
  }
  
  .theme-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-color);
    text-align: center;
  }
  
  .theme-check {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 20px;
    height: 20px;
    background: var(--white);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .el-icon {
      font-size: 12px;
      color: var(--themeBackground);
    }
  }
}

.setting-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: 12px;
  background: var(--background);
  transition: all 0.3s ease;
  
  &.clickable {
    cursor: pointer;
    
    &:hover {
      background: var(--btn-bg);
      transform: translateX(2px);
    }
  }
  
  .item-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    .item-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-color);
    }
    
    .item-desc {
      font-size: 12px;
      color: var(--text-color-secondary);
    }
  }
  
  .item-arrow {
    font-size: 16px;
    color: var(--text-color-secondary);
  }
}

.modal-footer {
  padding: 0 24px 24px;
  border-top: 1px solid var(--border-color);
  margin-top: 8px;
  padding-top: 16px;
  
  .footer-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    color: var(--text-color-secondary);
    
    .version {
      background: var(--background);
      padding: 4px 8px;
      border-radius: 6px;
    }
  }
}

// 动画
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.modal-enter-active .settings-modal,
.modal-leave-active .settings-modal {
  transition: all 0.3s ease;
}

.modal-enter-from .settings-modal,
.modal-leave-to .settings-modal {
  transform: scale(0.9) translateY(20px);
}

// 响应式
@media screen and (max-width: 768px) {
  .settings-modal-overlay {
    padding: 10px;
    align-items: flex-end;
  }
  
  .settings-modal {
    max-height: 85vh;
    border-radius: 20px 20px 0 0;
    margin-bottom: 0;
    animation: slideUp 0.3s ease-out;
  }
  
  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
  
  .modal-header,
  .modal-content,
  .modal-footer {
    padding-left: 20px;
    padding-right: 20px;
  }
  
  .modal-header {
    padding-top: 20px;
    
    .close-btn {
      width: 40px;
      height: 40px;
      
      &:active {
        transform: scale(0.95);
      }
    }
  }
  
  .theme-options {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  
  .theme-option {
    padding: 16px 12px;
    
    &:active {
      transform: scale(0.95);
    }
    
    .theme-preview {
      width: 44px;
      height: 44px;
      
      .theme-icon {
        font-size: 22px;
      }
    }
    
    .theme-label {
      font-size: 13px;
    }
  }
  
  .setting-item {
    padding: 18px 16px;
    border-radius: 16px;
    
    &.clickable:active {
      transform: scale(0.98);
      background: var(--btn-hover-color);
      
      .item-info .item-label {
        color: var(--white);
      }
    }
    
    .item-info {
      .item-label {
        font-size: 15px;
      }
      
      .item-desc {
        font-size: 13px;
      }
    }
  }
  
  // 增大开关的触摸区域
  :deep(.el-switch) {
    .el-switch__core {
      min-width: 50px;
      height: 24px;
      
      &::after {
        width: 20px;
        height: 20px;
      }
    }
  }
}

// 阅读模式样式
:global(.reading-mode) {
  .settings-modal {
    background: #f8f9fa;
    color: #2c3e50;
  }
}
</style>