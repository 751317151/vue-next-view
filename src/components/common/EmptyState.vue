<template>
  <div class="empty-state">
    <div class="empty-icon">
      <slot name="icon">
        <el-icon :size="64"><DocumentDelete /></el-icon>
      </slot>
    </div>
    <div class="empty-title">{{ title }}</div>
    <div class="empty-desc" v-if="description">{{ description }}</div>
    <div class="empty-action" v-if="$slots.action">
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DocumentDelete } from '@element-plus/icons-vue';

defineProps({
  title: { type: String, default: '暂无数据' },
  description: { type: String, default: '' }
});
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  .empty-icon {
    color: var(--greyFont);
    margin-bottom: 20px;
    opacity: 0.6;
  }

  .empty-title {
    font-size: 18px;
    color: var(--fontColor);
    margin-bottom: 8px;
  }

  .empty-desc {
    font-size: 14px;
    color: var(--greyFont);
    max-width: 300px;
  }

  .empty-action {
    margin-top: 20px;
  }
}
</style>
