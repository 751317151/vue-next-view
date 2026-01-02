<template>
  <transition
    :name="transitionName"
    mode="out-in"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @before-leave="onBeforeLeave"
    @leave="onLeave"
    @after-leave="onAfterLeave"
  >
    <slot></slot>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

interface Props {
  type?: 'fade' | 'slide' | 'scale' | 'flip' | 'zoom' | 'slideUp';
  duration?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'fade',
  duration: 300,
  disabled: false
});

const route = useRoute();
const transitionName = ref('');
const isTransitioning = ref(false);

// 根据路由变化设置过渡效果
watch(() => route.path, (newPath, oldPath) => {
  if (props.disabled) {
    transitionName.value = '';
    return;
  }
  
  // 根据路由层级决定过渡方向
  const getRouteLevel = (path: string) => {
    if (path === '/') return 0;
    if (path.includes('/article/')) return 2;
    if (path.includes('/tags/') || path.includes('/categories/')) return 2;
    return 1;
  };
  
  const newLevel = getRouteLevel(newPath);
  const oldLevel = getRouteLevel(oldPath || '');
  
  if (newLevel > oldLevel) {
    transitionName.value = `${props.type}-forward`;
  } else if (newLevel < oldLevel) {
    transitionName.value = `${props.type}-backward`;
  } else {
    transitionName.value = props.type;
  }
}, { immediate: true });

// 过渡事件处理
const onBeforeEnter = () => {
  isTransitioning.value = true;
};

const onEnter = () => {
  // 添加进入动画的自定义逻辑
};

const onAfterEnter = () => {
  isTransitioning.value = false;
  
  // 简化处理，只做必要的操作
  setTimeout(() => {
    // 触发重新渲染
    window.dispatchEvent(new Event('resize'));
    
    // 确保浮动按钮正确显示
    const floatingActions = document.querySelector('.floating-actions') as HTMLElement;
    if (floatingActions && window.innerWidth <= 768) {
      floatingActions.style.display = 'block';
      floatingActions.style.opacity = '1';
      floatingActions.style.visibility = 'visible';
    }
  }, 50);
  
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const onBeforeLeave = () => {
  // 添加离开前的自定义逻辑
};

const onLeave = () => {
  // 添加离开动画的自定义逻辑
};

const onAfterLeave = () => {
  // 添加离开后的自定义逻辑
};
</script>

<style lang="scss">
// 淡入淡出效果
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 滑动效果
.slide-forward-enter-active,
.slide-forward-leave-active,
.slide-backward-enter-active,
.slide-backward-leave-active,
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-forward-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-forward-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-backward-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-backward-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

// 缩放效果
.scale-enter-active,
.scale-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.scale-enter-from {
  transform: scale(0.9);
  opacity: 0;
}

.scale-leave-to {
  transform: scale(1.1);
  opacity: 0;
}

// 翻转效果
.flip-enter-active,
.flip-leave-active {
  transition: transform 0.4s ease, opacity 0.4s ease;
}

.flip-enter-from {
  transform: rotateY(-90deg);
  opacity: 0;
}

.flip-leave-to {
  transform: rotateY(90deg);
  opacity: 0;
}

// 缩放淡入效果
.zoom-enter-active,
.zoom-leave-active {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease;
}

.zoom-enter-from {
  transform: scale(0.95);
  opacity: 0;
}

.zoom-leave-to {
  transform: scale(1.02);
  opacity: 0;
}

// 向上滑入效果
.slideUp-enter-active,
.slideUp-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
}

.slideUp-enter-from {
  transform: translateY(30px);
  opacity: 0;
}

.slideUp-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

// 移动端优化
@media screen and (max-width: 768px) {
  .slide-forward-enter-from,
  .slide-backward-leave-to {
    transform: translateX(100%);
  }
  
  .slide-backward-enter-from,
  .slide-forward-leave-to {
    transform: translateX(-100%);
  }
}
</style>