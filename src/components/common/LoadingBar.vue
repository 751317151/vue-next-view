<template>
  <Teleport to="body">
    <div class="loading-bar-container" v-show="isLoading">
      <div class="loading-bar" :style="{ width: progress + '%' }"></div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isLoading = ref(false);
const progress = ref(0);
let timer: number | null = null;

const startLoading = () => {
  isLoading.value = true;
  progress.value = 0;
  
  // 模拟进度增长
  timer = window.setInterval(() => {
    if (progress.value < 90) {
      progress.value += Math.random() * 10;
    }
  }, 100);
};

const finishLoading = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  
  progress.value = 100;
  
  setTimeout(() => {
    isLoading.value = false;
    progress.value = 0;
  }, 300);
};

onMounted(() => {
  router.beforeEach((to, from, next) => {
    if (to.path !== from.path) {
      startLoading();
    }
    next();
  });
  
  router.afterEach(() => {
    finishLoading();
  });
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style lang="scss" scoped>
.loading-bar-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 9999;
  background: transparent;
}

.loading-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--themeBackground), #ff9a56, var(--themeBackground));
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  transition: width 0.2s ease;
  border-radius: 0 2px 2px 0;
  box-shadow: 0 0 10px var(--themeBackground), 0 0 5px var(--themeBackground);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
