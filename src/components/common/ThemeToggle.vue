<template>
  <div class="theme-toggle">
    <el-dropdown 
      placement="bottom-end"
      @command="handleThemeChange"
      trigger="click"
    >
      <div class="theme-button">
        <el-icon class="theme-icon">
          <Sunny v-if="currentTheme === 'light'" />
          <Moon v-else-if="currentTheme === 'dark'" />
          <Monitor v-else />
        </el-icon>
      </div>
      
      <template #dropdown>
        <el-dropdown-menu class="theme-menu">
          <el-dropdown-item 
            command="light"
            :class="{ active: currentTheme === 'light' }"
          >
            <div class="theme-option">
              <el-icon class="option-icon">
                <Sunny />
              </el-icon>
              <span class="option-label">浅色模式</span>
              <div 
                class="theme-preview"
                style="background: linear-gradient(45deg, #409EFF, #ffffff)"
              ></div>
            </div>
          </el-dropdown-item>
          
          <el-dropdown-item 
            command="dark"
            :class="{ active: currentTheme === 'dark' }"
          >
            <div class="theme-option">
              <el-icon class="option-icon">
                <Moon />
              </el-icon>
              <span class="option-label">深色模式</span>
              <div 
                class="theme-preview"
                style="background: linear-gradient(45deg, #409EFF, #1f1f1f)"
              ></div>
            </div>
          </el-dropdown-item>
          
          <el-dropdown-item 
            command="auto"
            :class="{ active: currentTheme === 'auto' }"
          >
            <div class="theme-option">
              <el-icon class="option-icon">
                <Monitor />
              </el-icon>
              <span class="option-label">跟随系统</span>
              <div 
                class="theme-preview"
                style="background: linear-gradient(45deg, #409EFF, #79bbff)"
              ></div>
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useThemeStore } from '@/stores/theme';
import { Sunny, Moon, Monitor } from '@element-plus/icons-vue';

const themeStore = useThemeStore();
const { currentTheme } = storeToRefs(themeStore);

// 处理主题切换
const handleThemeChange = (themeName: string) => {
  themeStore.setTheme(themeName as any);
};
</script>

<style lang="scss" scoped>
.theme-toggle {
  .theme-button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--card-background);
    border: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: var(--background);
      border-color: var(--themeBackground);
      transform: scale(1.05);
    }
    
    .theme-icon {
      font-size: 18px;
      color: var(--text-color);
      transition: color 0.3s ease;
    }
  }
}

:deep(.theme-menu) {
  padding: 8px 0;
  min-width: 180px;
  
  .el-dropdown-menu__item {
    padding: 0;
    
    &.active {
      background: var(--themeBackground);
      color: var(--white);
      
      .theme-option {
        .option-icon,
        .option-label {
          color: var(--white);
        }
      }
    }
    
    &:hover:not(.active) {
      background: var(--background);
    }
  }
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  width: 100%;
  
  .option-icon {
    font-size: 16px;
    color: var(--text-color);
    flex-shrink: 0;
  }
  
  .option-label {
    flex: 1;
    color: var(--text-color);
    font-size: 14px;
  }
  
  .theme-preview {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    flex-shrink: 0;
    border: 2px solid var(--border-color);
  }
}
</style>