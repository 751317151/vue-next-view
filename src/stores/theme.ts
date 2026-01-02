import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeConfig {
  name: ThemeMode;
  label: string;
  variables: Record<string, string>;
}

const themes: Record<ThemeMode, ThemeConfig> = {
  light: {
    name: 'light',
    label: '浅色模式',
    variables: {
      '--background': '#ffffff',
      '--card-background': '#ffffff',
      '--text-color': '#2c3e50',
      '--text-color-secondary': '#6c757d',
      '--text-color-light': '#8e9aaf',
      '--border-color': '#e9ecef',
      '--border-color-light': '#f1f3f4',
      '--themeBackground': '#4f46e5',
      '--themeBackground-light': '#6366f1',
      '--themeBackground-dark': '#4338ca',
      '--translucent': 'rgba(255, 255, 255, 0.9)',
      '--toolbarFont': '#2c3e50',
      '--btn-bg': '#f8f9fa',
      '--btn-color': '#6c757d',
      '--btn-hover-color': '#4f46e5',
      '--shadow-light': 'rgba(0, 0, 0, 0.05)',
      '--shadow-medium': 'rgba(0, 0, 0, 0.1)',
      '--shadow-heavy': 'rgba(0, 0, 0, 0.15)',
      '--white': '#ffffff',
      '--success': '#10b981',
      '--warning': '#f59e0b',
      '--danger': '#ef4444',
      '--info': '#3b82f6',
      '--gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      '--gradient-secondary': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      '--backdrop-blur': 'blur(20px)',
      '--scrollbar-track': 'rgba(79, 70, 229, 0.08)',
      '--pagination-bg': '#ffffff',
      '--pagination-border': '#e9ecef',
      '--pagination-text': '#2c3e50',
      '--pagination-hover-bg': '#f8f9fa',
      '--pagination-hover-border': '#4f46e5',
      '--pagination-active-bg': '#4f46e5',
      '--pagination-active-text': '#ffffff',
      '--pagination-disabled-bg': '#f8f9fa',
      '--pagination-disabled-text': '#cbd5e1',
      '--pagination-disabled-border': '#f1f3f4',
      '--message-bg': '#ffffff',
      '--message-text': '#2c3e50',
      '--message-border': '#e9ecef',
      '--message-success-bg': '#f0f9ff',
      '--message-success-text': '#059669',
      '--message-success-border': '#10b981',
      '--message-info-bg': '#eff6ff',
      '--message-info-text': '#2563eb',
      '--message-info-border': '#3b82f6',
      '--message-warning-bg': '#fffbeb',
      '--message-warning-text': '#d97706',
      '--message-warning-border': '#f59e0b',
      '--message-error-bg': '#fef2f2',
      '--message-error-text': '#dc2626',
      '--message-error-border': '#ef4444'
    }
  },
  dark: {
    name: 'dark',
    label: '深色模式',
    variables: {
      '--background': '#0f172a',
      '--card-background': '#1e293b',
      '--text-color': '#f1f5f9',
      '--text-color-secondary': '#cbd5e1',
      '--text-color-light': '#94a3b8',
      '--border-color': '#334155',
      '--border-color-light': '#475569',
      '--themeBackground': '#6366f1',
      '--themeBackground-light': '#818cf8',
      '--themeBackground-dark': '#4f46e5',
      '--translucent': 'rgba(15, 23, 42, 0.9)',
      '--toolbarFont': '#f1f5f9',
      '--btn-bg': '#334155',
      '--btn-color': '#cbd5e1',
      '--btn-hover-color': '#6366f1',
      '--shadow-light': 'rgba(0, 0, 0, 0.2)',
      '--shadow-medium': 'rgba(0, 0, 0, 0.3)',
      '--shadow-heavy': 'rgba(0, 0, 0, 0.4)',
      '--white': '#ffffff',
      '--success': '#22c55e',
      '--warning': '#eab308',
      '--danger': '#f87171',
      '--info': '#60a5fa',
      '--gradient-primary': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      '--gradient-secondary': 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
      '--backdrop-blur': 'blur(20px)',
      '--scrollbar-track': 'rgba(99, 102, 241, 0.1)',
      '--pagination-bg': '#1e293b',
      '--pagination-border': '#334155',
      '--pagination-text': '#f1f5f9',
      '--pagination-hover-bg': '#334155',
      '--pagination-hover-border': '#6366f1',
      '--pagination-active-bg': '#6366f1',
      '--pagination-active-text': '#ffffff',
      '--pagination-disabled-bg': '#0f172a',
      '--pagination-disabled-text': '#64748b',
      '--pagination-disabled-border': '#1e293b',
      '--message-bg': '#1e293b',
      '--message-text': '#f1f5f9',
      '--message-border': '#334155',
      '--message-success-bg': '#0f2419',
      '--message-success-text': '#34d399',
      '--message-success-border': '#22c55e',
      '--message-info-bg': '#0f1629',
      '--message-info-text': '#60a5fa',
      '--message-info-border': '#3b82f6',
      '--message-warning-bg': '#2d1b0f',
      '--message-warning-text': '#fbbf24',
      '--message-warning-border': '#f59e0b',
      '--message-error-bg': '#2d0f0f',
      '--message-error-text': '#f87171',
      '--message-error-border': '#ef4444'
    }
  },
  auto: {
    name: 'auto',
    label: '跟随系统',
    variables: {}
  }
};

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<ThemeMode>('light');
  const mouseAnimation = ref(false);
  const showSettingPanel = ref(false);

  // 计算当前主题配置 - 使用函数而不是计算属性避免递归
  const getCurrentThemeConfig = () => {
    return themes[currentTheme.value];
  };

  // 检测系统主题
  const getSystemTheme = (): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // 应用主题
  const applyTheme = (themeName: ThemeMode) => {
    // 避免递归更新 - 先检查是否需要更新
    if (currentTheme.value === themeName) {
      return;
    }
    
    const root = document.documentElement;
    let targetTheme: ThemeConfig;

    if (themeName === 'auto') {
      const systemTheme = getSystemTheme();
      targetTheme = themes[systemTheme];
    } else {
      targetTheme = themes[themeName];
    }

    // 添加过渡效果
    root.style.transition = 'all 0.3s ease';
    
    // 应用 CSS 变量
    Object.entries(targetTheme.variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // 更新 body 类名
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${targetTheme.name}`);
    
    // 兼容旧的主题属性
    document.documentElement.setAttribute('theme', targetTheme.name);

    // 移除过渡效果（避免影响其他动画）
    setTimeout(() => {
      root.style.transition = '';
    }, 300);

    // 最后更新状态，避免递归
    currentTheme.value = themeName;
    localStorage.setItem('theme', themeName);
  };

  // 切换主题
  const toggleTheme = () => {
    const themeOrder: ThemeMode[] = ['light', 'dark', 'auto'];
    const currentIndex = themeOrder.indexOf(currentTheme.value);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    applyTheme(themeOrder[nextIndex]);
  };

  // 设置特定主题
  const setTheme = (themeName: ThemeMode) => {
    applyTheme(themeName);
  };

  // 切换鼠标动画
  const toggleMouseAnimation = () => {
    mouseAnimation.value = !mouseAnimation.value;
    
    // 触发鼠标动画事件
    const event = new CustomEvent('mouse-animation-toggle', {
      detail: { enabled: mouseAnimation.value }
    });
    document.dispatchEvent(event);
  };

  // 切换设置面板
  const toggleSettingPanel = () => {
    showSettingPanel.value = !showSettingPanel.value;
  };

  // 初始化主题
  const initTheme = () => {
    const savedTheme = (localStorage.getItem('theme') as ThemeMode) || 'light';
    applyTheme(savedTheme);

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (currentTheme.value === 'auto') {
        applyTheme('auto');
      }
    });
  };

  // 根据时间自动设置主题
  const autoSetThemeByTime = () => {
    const hour = new Date().getHours();
    const isDaylight = hour >= 7 && hour <= 22;
    applyTheme(isDaylight ? 'light' : 'dark');
  };

  return {
    // 状态
    currentTheme,
    mouseAnimation,
    showSettingPanel,
    
    // 方法
    applyTheme,
    toggleTheme,
    setTheme,
    toggleMouseAnimation,
    toggleSettingPanel,
    initTheme,
    autoSetThemeByTime,
    getSystemTheme,
    getCurrentThemeConfig
  };
});