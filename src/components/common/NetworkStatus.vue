<template>
  <Teleport to="body">
    <transition name="slide">
      <div v-if="showStatus" class="network-status" :class="isOnline ? 'online' : 'offline'">
        <el-icon v-if="isOnline"><CircleCheck /></el-icon>
        <el-icon v-else><Warning /></el-icon>
        <span>{{ statusText }}</span>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { CircleCheck, Warning } from '@element-plus/icons-vue';

const isOnline = ref(navigator.onLine);
const showStatus = ref(false);
const statusText = ref('');

let hideTimer: number | null = null;

const updateStatus = (online: boolean) => {
  isOnline.value = online;
  statusText.value = online ? '网络已恢复' : '网络已断开';
  showStatus.value = true;
  
  // 清除之前的定时器
  if (hideTimer) {
    clearTimeout(hideTimer);
  }
  
  // 3秒后自动隐藏（仅在线状态）
  if (online) {
    hideTimer = window.setTimeout(() => {
      showStatus.value = false;
    }, 3000);
  }
};

const handleOnline = () => updateStatus(true);
const handleOffline = () => updateStatus(false);

onMounted(() => {
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
});

onUnmounted(() => {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
  
  if (hideTimer) {
    clearTimeout(hideTimer);
  }
});
</script>

<style lang="scss" scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style>
