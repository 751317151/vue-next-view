<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-content">
      <div class="error-icon">⚠️</div>
      <h2>出错了</h2>
      <p class="error-message">{{ errorMessage }}</p>
      <button class="retry-btn" @click="retry">
        <el-icon><RefreshRight /></el-icon>
        重试
      </button>
    </div>
  </div>
  <slot v-else></slot>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';
import { RefreshRight } from '@element-plus/icons-vue';

const hasError = ref(false);
const errorMessage = ref('页面加载出现问题');

onErrorCaptured((err: Error) => {
  hasError.value = true;
  errorMessage.value = err.message || '页面加载出现问题';
  console.error('ErrorBoundary caught:', err);
  return false;
});

const retry = () => {
  hasError.value = false;
  window.location.reload();
};
</script>

<style lang="scss" scoped>
.error-boundary {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background);
}

.error-content {
  text-align: center;
  padding: 40px;

  .error-icon {
    font-size: 64px;
    margin-bottom: 20px;
  }

  h2 {
    color: var(--fontColor);
    margin-bottom: 12px;
  }

  .error-message {
    color: var(--greyFont);
    margin-bottom: 24px;
  }

  .retry-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: var(--themeBackground);
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 15px;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
}
</style>
