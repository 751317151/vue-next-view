<template>
  <Teleport to="body">
    <transition name="fade">
      <div 
        v-if="visible" 
        class="image-preview-overlay"
        @click="close"
      >
        <img :src="currentImage" alt="预览图片" @click.stop />
        <div class="preview-actions">
          <button @click.stop="zoomIn" title="放大">
            <el-icon><ZoomIn /></el-icon>
          </button>
          <button @click.stop="zoomOut" title="缩小">
            <el-icon><ZoomOut /></el-icon>
          </button>
          <button @click.stop="resetZoom" title="重置">
            <el-icon><RefreshRight /></el-icon>
          </button>
          <button @click="close" title="关闭">
            <el-icon><Close /></el-icon>
          </button>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ZoomIn, ZoomOut, RefreshRight, Close } from '@element-plus/icons-vue';

const visible = ref(false);
const currentImage = ref('');
const scale = ref(1);

const open = (src: string) => {
  currentImage.value = src;
  visible.value = true;
  scale.value = 1;
  document.body.style.overflow = 'hidden';
};

const close = () => {
  visible.value = false;
  document.body.style.overflow = '';
};

const zoomIn = () => {
  scale.value = Math.min(scale.value + 0.25, 3);
  updateImageScale();
};

const zoomOut = () => {
  scale.value = Math.max(scale.value - 0.25, 0.5);
  updateImageScale();
};

const resetZoom = () => {
  scale.value = 1;
  updateImageScale();
};

const updateImageScale = () => {
  const img = document.querySelector('.image-preview-overlay img') as HTMLImageElement;
  if (img) {
    img.style.transform = `scale(${scale.value})`;
  }
};

// 监听图片点击
const handleImageClick = (e: Event) => {
  const target = e.target as HTMLElement;
  
  // 检查是否是图片元素
  let imgElement: HTMLImageElement | null = null;
  
  if (target.tagName === 'IMG') {
    imgElement = target as HTMLImageElement;
  }
  
  if (!imgElement) return;
  
  // 排除已有预览功能的 el-image 组件（有 preview-src-list 属性的）
  const elImageWrapper = imgElement.closest('.el-image');
  if (elImageWrapper) {
    // el-image 组件自带预览功能，不需要我们处理
    return;
  }
  
  // 排除首页文章卡片（因为点击应该跳转到文章）
  if (imgElement.closest('.recent-post-item')) {
    return;
  }
  
  // 排除导航栏、头像等区域
  if (imgElement.closest('.top-nav-bar') || 
      imgElement.closest('.side-nav-bar') ||
      imgElement.closest('.user-info') ||
      imgElement.closest('.footer')) {
    return;
  }
  
  // 检查图片是否在允许预览的容器内
  const allowedContainers = [
    '.entry-content',        // 文章详情页内容
    '.v-md-preview',         // markdown 预览
    '.markdown-body',        // markdown 内容
    '.github-markdown-body', // github markdown 样式
    '.article-container',    // 文章容器
    '.message-content',      // 留言内容
    '.about-content',        // 关于页面
  ];
  
  const isInAllowedContainer = allowedContainers.some(selector => 
    imgElement?.closest(selector)
  );
  
  // 或者图片有特定的类名
  const hasPreviewClass = imgElement.classList.contains('preview-image');
  
  if (isInAllowedContainer || hasPreviewClass) {
    const src = imgElement.src;
    // 排除头像和logo等小图标
    if (src && !src.includes('avatar') && !src.includes('logo') && !src.includes('favicon') && !src.includes('.svg')) {
      e.preventDefault();
      e.stopPropagation();
      open(src);
    }
  }
};

// ESC 关闭
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && visible.value) {
    close();
  }
};

onMounted(() => {
  document.addEventListener('click', handleImageClick);
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('click', handleImageClick);
  document.removeEventListener('keydown', handleKeydown);
});

// 暴露方法供外部调用
defineExpose({ open, close });
</script>

<style lang="scss" scoped>
.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.92);
  z-index: var(--z-preview);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
  
  img {
    max-width: 90%;
    max-height: 85%;
    object-fit: contain;
    border-radius: 4px;
    cursor: default;
    transition: transform 0.3s ease;
  }
}

.preview-actions {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 15px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 12px 20px;
  border-radius: 30px;
  
  button {
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: scale(1.1);
    }
    
    .el-icon {
      font-size: 18px;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
