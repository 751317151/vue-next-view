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
  :deep(.el-pagination__total) {
    color: var(--text-color);
  }
  
  :deep(.el-pagination__sizes) {
    .el-select .el-input {
      .el-input__inner {
        color: var(--text-color);
        background-color: var(--background);
        border-color: var(--border-color);
      }
    }
  }
  
  :deep(.el-pager li) {
    background-color: var(--background);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    margin: 0 2px;
    border-radius: 4px;
    
    &:hover {
      color: var(--themeBackground);
      border-color: var(--themeBackground);
    }
    
    &.is-active {
      background-color: var(--themeBackground);
      color: var(--white);
      border-color: var(--themeBackground);
    }
  }
  
  :deep(.btn-prev),
  :deep(.btn-next) {
    background-color: var(--background);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    
    &:hover {
      color: var(--themeBackground);
      border-color: var(--themeBackground);
    }
    
    &:disabled {
      color: var(--disabled-color);
      border-color: var(--disabled-border-color);
    }
  }
  
  :deep(.el-pagination__jump) {
    color: var(--text-color);
    
    .el-input {
      .el-input__inner {
        color: var(--text-color);
        background-color: var(--background);
        border-color: var(--border-color);
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .custom-pagination {
    :deep(.el-pagination__sizes),
    :deep(.el-pagination__jump) {
      display: none;
    }
  }
}
</style>