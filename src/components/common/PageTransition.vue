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
  type?: 'fade' | 'slide' | 'scale' | 'flip';
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
  
  // 确保页面内容正确显示
  setTimeout(() => {
    // 触发重新渲染以修复可能的显示问题
    window.dispatchEvent(new Event('resize'));
    
    // 强制确保所有文章可见
    const articles = document.querySelectorAll('.recent-post-item');
    articles.forEach(article => {
      const element = article as HTMLElement;
      element.style.opacity = '1';
      element.style.visibility = 'visible';
      element.style.display = 'flex';
    });
    
    // 重新初始化AOS动画
    if (typeof window !== 'undefined' && (window as any).AOS) {
      (window as any).AOS.refreshHard();
    }
    
    // 确保浮动按钮正确显示
    const floatingActions = document.querySelector('.floating-actions') as HTMLElement;
    if (floatingActions && window.innerWidth <= 768) {
      floatingActions.style.display = 'block';
      floatingActions.style.opacity = '1';
      floatingActions.style.visibility = 'visible';
    }
  }, 100);
  
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