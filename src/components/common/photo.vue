<template>
  <div class="photo-gallery">
    <div class="photo-grid">
      <div
        v-for="(photo, index) in resourcePathList"
        :key="index"
        class="photo-item"
      >
        <el-image
          :src="photo"
          fit="cover"
          class="photo-image"
          lazy
          :preview-src-list="resourcePathList"
          :initial-index="index"
          :preview-teleported="true"
        >
          <template #error>
            <div class="image-error">
              <el-icon><Picture /></el-icon>
              <span>加载失败</span>
            </div>
          </template>
          <template #placeholder>
            <div class="image-loading">
              <el-icon class="is-loading"><Loading /></el-icon>
            </div>
          </template>
        </el-image>
        <div class="photo-overlay">
          <div class="photo-actions">
            <el-icon class="action-icon"><ZoomIn /></el-icon>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-if="!resourcePathList || resourcePathList.length === 0" class="empty-state">
      <el-icon class="empty-icon"><Picture /></el-icon>
      <p>暂无照片</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Picture, Loading, ZoomIn } from '@element-plus/icons-vue';

interface Props {
  resourcePathList?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  resourcePathList: () => []
});
</script>

<style lang="scss" scoped>
.photo-gallery {
  width: 100%;
  padding: 20px 0;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 0 10px;
}

.photo-item {
  position: relative;
  aspect-ratio: 4/3;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    
    .photo-overlay {
      opacity: 1;
    }
    
    .photo-image {
      transform: scale(1.05);
    }
  }
}

.photo-image {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
  
  :deep(.el-image__inner) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none; /* 让点击事件穿透到下面的 el-image */
}

.photo-actions {
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon {
  font-size: 24px;
  color: var(--white);
  background: rgba(255, 255, 255, 0.2);
  padding: 12px;
  border-radius: 50%;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-color-secondary);
  background: var(--fill-color-light);
  
  .el-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }
  
  span {
    font-size: 14px;
  }
}

.image-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: var(--fill-color-lighter);
  
  .el-icon {
    font-size: 24px;
    color: var(--text-color-secondary);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-color-secondary);
  
  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  p {
    font-size: 16px;
    margin: 0;
  }
}

// 响应式设计
@media screen and (max-width: 768px) {
  .photo-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
    padding: 0 5px;
  }
  
  .photo-item {
    border-radius: 8px;
  }
  
  .action-icon {
    font-size: 20px;
    padding: 10px;
  }
}

@media screen and (max-width: 480px) {
  .photo-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>