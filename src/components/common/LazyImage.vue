<template>
  <div 
    class="lazy-image-container"
    :class="{ loaded: isLoaded, error: hasError }"
    :style="{ 
      width: width, 
      height: height,
      aspectRatio: aspectRatio 
    }"
  >
    <!-- 占位符 -->
    <div v-if="!isLoaded && !hasError" class="image-placeholder">
      <div class="placeholder-content">
        <el-icon class="placeholder-icon">
          <Picture />
        </el-icon>
        <div v-if="showProgress" class="loading-progress">
          <div class="progress-bar" :style="{ width: progress + '%' }"></div>
        </div>
      </div>
    </div>
    
    <!-- 实际图片 -->
    <img
      v-show="isLoaded"
      ref="imageRef"
      :src="currentSrc"
      :alt="alt"
      :loading="lazy ? 'lazy' : 'eager'"
      @load="handleLoad"
      @error="handleError"
      @progress="handleProgress"
      class="lazy-image"
    />
    
    <!-- 错误状态 -->
    <div v-if="hasError" class="image-error">
      <el-icon class="error-icon">
        <Picture />
      </el-icon>
      <p class="error-text">图片加载失败</p>
      <button v-if="allowRetry" @click="retry" class="retry-button">
        重试
      </button>
    </div>
    
    <!-- 图片信息覆盖层 -->
    <div v-if="showOverlay && isLoaded" class="image-overlay">
      <slot name="overlay">
        <div class="overlay-content">
          <p v-if="title" class="overlay-title">{{ title }}</p>
          <p v-if="description" class="overlay-description">{{ description }}</p>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { Picture } from '@element-plus/icons-vue';

interface Props {
  src: string;
  alt?: string;
  width?: string;
  height?: string;
  aspectRatio?: string;
  placeholder?: string;
  lazy?: boolean;
  showProgress?: boolean;
  allowRetry?: boolean;
  showOverlay?: boolean;
  title?: string;
  description?: string;
  fallback?: string;
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  lazy: true,
  showProgress: true,
  allowRetry: true,
  showOverlay: false
});

const imageRef = ref<HTMLImageElement>();
const isLoaded = ref(false);
const hasError = ref(false);
const progress = ref(0);
const retryCount = ref(0);
const maxRetries = 3;

const currentSrc = computed(() => {
  if (hasError.value && props.fallback) {
    return props.fallback;
  }
  return props.src;
});

// 图片加载处理
const handleLoad = () => {
  isLoaded.value = true;
  hasError.value = false;
  progress.value = 100;
};

const handleError = () => {
  if (retryCount.value < maxRetries) {
    // 自动重试
    setTimeout(() => {
      retry();
    }, 1000 * Math.pow(2, retryCount.value)); // 指数退避
  } else {
    hasError.value = true;
    isLoaded.value = false;
  }
};

const handleProgress = (event: Event) => {
  const progressEvent = event as ProgressEvent;
  if (progressEvent.lengthComputable) {
    progress.value = (progressEvent.loaded / progressEvent.total) * 100;
  }
};

const retry = () => {
  retryCount.value++;
  hasError.value = false;
  isLoaded.value = false;
  progress.value = 0;
  
  // 强制重新加载图片
  if (imageRef.value) {
    imageRef.value.src = '';
    setTimeout(() => {
      if (imageRef.value) {
        imageRef.value.src = currentSrc.value;
      }
    }, 100);
  }
};

// Intersection Observer for lazy loading
let observer: IntersectionObserver | null = null;

const setupLazyLoading = () => {
  if (!props.lazy || !imageRef.value) return;
  
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer?.unobserve(img);
          }
        }
      });
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.1
    }
  );
  
  if (imageRef.value) {
    imageRef.value.dataset.src = props.src;
    observer.observe(imageRef.value);
  }
};

// 监听 src 变化
watch(() => props.src, () => {
  isLoaded.value = false;
  hasError.value = false;
  progress.value = 0;
  retryCount.value = 0;
});

onMounted(() => {
  if (props.lazy) {
    setupLazyLoading();
  }
});

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style lang="scss" scoped>
.lazy-image-container {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  background: var(--background);
  transition: all 0.3s ease;
  
  &.loaded {
    .lazy-image {
      opacity: 1;
    }
  }
  
  &.error {
    background: var(--background);
    border: 1px dashed var(--border-color);
  }
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
              linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
              linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
              linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  animation: placeholder-shimmer 2s infinite linear;
  
  .placeholder-content {
    text-align: center;
    color: var(--text-color-secondary);
    
    .placeholder-icon {
      font-size: 32px;
      margin-bottom: 8px;
      opacity: 0.5;
    }
    
    .loading-progress {
      width: 60px;
      height: 4px;
      background: var(--border-color);
      border-radius: 2px;
      overflow: hidden;
      margin: 0 auto;
      
      .progress-bar {
        height: 100%;
        background: var(--themeBackground);
        border-radius: 2px;
        transition: width 0.3s ease;
      }
    }
  }
}

.lazy-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-color-secondary);
  
  .error-icon {
    font-size: 32px;
    margin-bottom: 8px;
    opacity: 0.5;
  }
  
  .error-text {
    font-size: 12px;
    margin: 0 0 12px 0;
  }
  
  .retry-button {
    padding: 4px 12px;
    background: var(--themeBackground);
    color: var(--white);
    border: none;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    
    &:hover {
      background: var(--themeBackground-dark, #337ecc);
    }
  }
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: var(--white);
  padding: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  .overlay-content {
    .overlay-title {
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 4px 0;
    }
    
    .overlay-description {
      font-size: 12px;
      margin: 0;
      opacity: 0.9;
    }
  }
}

.lazy-image-container:hover .image-overlay {
  opacity: 1;
}

@keyframes placeholder-shimmer {
  0% {
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  }
  100% {
    background-position: 20px 20px, 20px 30px, 30px 10px, 10px 20px;
  }
}

@media screen and (max-width: 768px) {
  .image-placeholder .placeholder-content .placeholder-icon {
    font-size: 24px;
  }
  
  .image-overlay {
    padding: 12px;
    
    .overlay-content {
      .overlay-title {
        font-size: 12px;
      }
      
      .overlay-description {
        font-size: 11px;
      }
    }
  }
}
</style>