<template>
  <div v-if="showMonitor && isDev" class="performance-monitor">
    <div class="monitor-header">
      <span class="monitor-title">性能监控</span>
      <button @click="toggleMonitor" class="toggle-btn">
        {{ isExpanded ? '收起' : '展开' }}
      </button>
    </div>
    
    <div v-if="isExpanded" class="monitor-content">
      <div class="metric-item">
        <span class="metric-label">FPS:</span>
        <span class="metric-value" :class="getFPSClass(fps)">{{ fps }}</span>
      </div>
      
      <div class="metric-item">
        <span class="metric-label">内存:</span>
        <span class="metric-value">{{ memoryUsage }}MB</span>
      </div>
      
      <div class="metric-item">
        <span class="metric-label">加载时间:</span>
        <span class="metric-value">{{ loadTime }}ms</span>
      </div>
      
      <div class="metric-item">
        <span class="metric-label">DOM节点:</span>
        <span class="metric-value">{{ domNodes }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const showMonitor = ref(false);
const isExpanded = ref(false);
const isDev = ref(false);
const fps = ref(0);
const memoryUsage = ref(0);
const loadTime = ref(0);
const domNodes = ref(0);

let frameCount = 0;
let lastTime = performance.now();
let animationId: number;

// 检测是否为开发环境
const checkDevMode = () => {
  isDev.value = import.meta.env.DEV || 
                window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1';
};

// 计算FPS
const calculateFPS = () => {
  frameCount++;
  const currentTime = performance.now();
  
  if (currentTime >= lastTime + 1000) {
    fps.value = Math.round((frameCount * 1000) / (currentTime - lastTime));
    frameCount = 0;
    lastTime = currentTime;
  }
  
  animationId = requestAnimationFrame(calculateFPS);
};

// 获取内存使用情况
const updateMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    memoryUsage.value = Math.round(memory.usedJSHeapSize / 1024 / 1024);
  }
};

// 获取页面加载时间
const getLoadTime = () => {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navigation) {
    loadTime.value = Math.round(navigation.loadEventEnd - navigation.fetchStart);
  }
};

// 获取DOM节点数量
const updateDOMNodes = () => {
  domNodes.value = document.querySelectorAll('*').length;
};

// 获取FPS颜色类
const getFPSClass = (fps: number) => {
  if (fps >= 50) return 'good';
  if (fps >= 30) return 'warning';
  return 'poor';
};

// 切换监控面板
const toggleMonitor = () => {
  isExpanded.value = !isExpanded.value;
};

// 定期更新指标
let metricsInterval: number;

const startMonitoring = () => {
  calculateFPS();
  
  metricsInterval = window.setInterval(() => {
    updateMemoryUsage();
    updateDOMNodes();
  }, 2000);
};

const stopMonitoring = () => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  if (metricsInterval) {
    clearInterval(metricsInterval);
  }
};

// 键盘快捷键
const handleKeydown = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'P') {
    e.preventDefault();
    showMonitor.value = !showMonitor.value;
    if (showMonitor.value) {
      startMonitoring();
    } else {
      stopMonitoring();
    }
  }
};

onMounted(() => {
  checkDevMode();
  
  if (isDev.value) {
    getLoadTime();
    document.addEventListener('keydown', handleKeydown);
    
    // 默认不显示，通过快捷键 Ctrl+Shift+P 开启
    console.log('性能监控已加载，按 Ctrl+Shift+P 开启/关闭监控面板');
  }
});

onBeforeUnmount(() => {
  stopMonitoring();
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style lang="scss" scoped>
.performance-monitor {
  position: fixed;
  top: 80px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: var(--white);
  border-radius: 8px;
  padding: 12px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  z-index: 9999;
  min-width: 200px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  .monitor-title {
    font-weight: bold;
    color: #00ff00;
  }
  
  .toggle-btn {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: var(--white);
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10px;
    cursor: pointer;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.monitor-content {
  .metric-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    
    .metric-label {
      color: #ccc;
    }
    
    .metric-value {
      font-weight: bold;
      
      &.good {
        color: #00ff00;
      }
      
      &.warning {
        color: #ffaa00;
      }
      
      &.poor {
        color: #ff0000;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .performance-monitor {
    top: 70px;
    right: 10px;
    min-width: 160px;
    font-size: 11px;
  }
}
</style>