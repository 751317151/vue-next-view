<template>
  <div class="pagination-container">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[5, 10, 20, 50]"
      :small="isMobile"
      :disabled="disabled"
      :background="true"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      class="custom-pagination"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from "pinia";
import { useConfig } from "@/stores/config";

const storesConfig = useConfig();
const { isMobile } = storeToRefs(storesConfig);

interface Props {
  current?: number;
  total?: number;
  pageSize?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  current: 1,
  total: 0,
  pageSize: 10,
  disabled: false,
});

const emit = defineEmits<{
  change: [page: number];
  sizeChange: [size: number];
}>();

const currentPage = computed({
  get: () => props.current,
  set: (value) => emit('change', value)
});

const pageSize = computed({
  get: () => props.pageSize,
  set: (value) => emit('sizeChange', value)
});

const handleSizeChange = (size: number) => {
  emit('sizeChange', size);
};

const handleCurrentChange = (page: number) => {
  emit('change', page);
};
</script>

<style lang="scss" scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
}

.custom-pagination {
  background: transparent;
  
  :deep(.el-pagination__total) {
    color: var(--pagination-text);
    font-weight: 500;
  }
  
  :deep(.el-pagination__sizes) {
    .el-select {
      .el-input {
        .el-input__wrapper {
          background-color: var(--pagination-bg);
          border-color: var(--pagination-border);
          box-shadow: none;
        }
        
        .el-input__inner {
          color: var(--pagination-text);
          background-color: transparent;
          transition: all 0.3s ease;
        }
      }
      
      .el-select__wrapper {
        background-color: var(--pagination-bg);
        border-color: var(--pagination-border);
        
        &:hover {
          border-color: var(--pagination-hover-border);
        }
        
        &.is-focused {
          border-color: var(--pagination-active-bg);
        }
      }
    }
  }
  
  :deep(.el-pager) {
    background: transparent;
    
    li {
      background-color: var(--pagination-bg);
      color: var(--pagination-text);
      border: 1px solid var(--pagination-border);
      margin: 0 2px;
      border-radius: 6px;
      transition: all 0.3s ease;
      font-weight: 500;
      
      &:hover:not(.is-active):not(.is-disabled) {
        color: var(--pagination-hover-border);
        border-color: var(--pagination-hover-border);
        background-color: var(--pagination-hover-bg);
        transform: translateY(-1px);
      }
      
      &.is-active {
        background-color: var(--pagination-active-bg);
        color: var(--pagination-active-text);
        border-color: var(--pagination-active-bg);
        box-shadow: var(--shadow-medium);
      }
      
      &.is-disabled {
        background-color: var(--pagination-disabled-bg);
        color: var(--pagination-disabled-text);
        border-color: var(--pagination-disabled-border);
        cursor: not-allowed;
      }
      
      &.more {
        background-color: var(--pagination-bg);
        color: var(--pagination-text);
        border-color: var(--pagination-border);
      }
    }
  }
  
  :deep(.btn-prev),
  :deep(.btn-next) {
    background-color: var(--pagination-bg);
    color: var(--pagination-text);
    border: 1px solid var(--pagination-border);
    border-radius: 6px;
    transition: all 0.3s ease;
    font-weight: 500;
    
    &:hover:not(:disabled) {
      color: var(--pagination-hover-border);
      border-color: var(--pagination-hover-border);
      background-color: var(--pagination-hover-bg);
      transform: translateY(-1px);
    }
    
    &:disabled {
      background-color: var(--pagination-disabled-bg);
      color: var(--pagination-disabled-text);
      border-color: var(--pagination-disabled-border);
      cursor: not-allowed;
    }
  }
  
  :deep(.el-pagination__jump) {
    color: var(--pagination-text);
    
    .el-input {
      .el-input__wrapper {
        background-color: var(--pagination-bg);
        border-color: var(--pagination-border);
        border-radius: 6px;
        transition: all 0.3s ease;
        box-shadow: none;
        
        &:hover {
          border-color: var(--pagination-hover-border);
        }
        
        &.is-focus {
          border-color: var(--pagination-active-bg);
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
        }
      }
      
      .el-input__inner {
        color: var(--pagination-text);
        background-color: transparent;
      }
    }
  }
  
  // 修复可能的空白区域
  :deep(.el-pagination__rightwrapper) {
    background: transparent;
  }
  
  :deep(.el-pagination__leftwrapper) {
    background: transparent;
  }
}

@media screen and (max-width: 768px) {
  .pagination-container {
    padding: 15px 0;
  }
  
  .custom-pagination {
    :deep(.el-pagination__sizes),
    :deep(.el-pagination__jump) {
      display: none;
    }
    
    :deep(.el-pagination__total) {
      font-size: 12px;
      margin-right: 8px;
    }
    
    :deep(.el-pager li) {
      min-width: 32px;
      height: 32px;
      line-height: 30px;
      font-size: 14px;
      margin: 0 1px;
      
      &:active {
        transform: scale(0.95);
      }
    }
    
    :deep(.btn-prev),
    :deep(.btn-next) {
      width: 32px;
      height: 32px;
      font-size: 14px;
      
      &:active {
        transform: scale(0.95);
      }
    }
  }
}

@media screen and (max-width: 480px) {
  .custom-pagination {
    :deep(.el-pagination__total) {
      font-size: 11px;
    }
    
    :deep(.el-pager li) {
      min-width: 28px;
      height: 28px;
      line-height: 26px;
      font-size: 12px;
    }
    
    :deep(.btn-prev),
    :deep(.btn-next) {
      width: 28px;
      height: 28px;
      font-size: 12px;
    }
  }
}
</style>