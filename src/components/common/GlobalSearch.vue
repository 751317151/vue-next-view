<template>
  <div class="search-container">
    <div class="search-wrapper" :class="{ active: isSearchActive }">
      <el-input
        ref="searchInput"
        v-model="searchQuery"
        placeholder="搜索文章、标签..."
        @input="handleSearch"
        @focus="handleFocus"
        @blur="handleBlur"
        class="search-input"
        clearable
      >
        <template #prefix>
          <el-icon class="search-icon"><Search /></el-icon>
        </template>
      </el-input>
      
      <!-- 搜索建议 -->
      <div v-if="showSuggestions" class="search-suggestions">
        <!-- 搜索历史 -->
        <div v-if="searchHistory.length" class="suggestion-section">
          <div class="section-header">
            <h4>搜索历史</h4>
            <span class="clear-btn" @click="clearHistory">清空</span>
          </div>
          <div class="suggestion-tags">
            <span
              v-for="keyword in searchHistory"
              :key="keyword"
              class="suggestion-tag history-tag"
              @click="selectSuggestion(keyword)"
            >
              {{ keyword }}
            </span>
          </div>
        </div>
        <!-- 热门搜索 -->
        <div class="suggestion-section">
          <h4>热门搜索</h4>
          <div class="suggestion-tags">
            <span
              v-for="tag in hotTags"
              :key="tag"
              class="suggestion-tag"
              @click="selectSuggestion(tag)"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- 搜索结果 -->
      <div v-if="showResults && searchResults.length" class="search-results">
        <div class="result-header">
          <span>找到 {{ searchResults.length }} 个结果</span>
        </div>
        <div class="result-list">
          <div 
            v-for="result in searchResults" 
            :key="result.id"
            class="result-item"
            @click="goToResult(result)"
          >
            <div class="result-icon">
              <el-icon v-if="result.type === 'article'"><Document /></el-icon>
              <el-icon v-else-if="result.type === 'tag'"><Tag /></el-icon>
              <el-icon v-else><Folder /></el-icon>
            </div>
            <div class="result-content">
              <h5>{{ result.title }}</h5>
              <p>{{ result.description }}</p>
              <div class="result-meta">
                <span class="result-type">{{ getTypeLabel(result.type) }}</span>
                <span v-if="result.date" class="result-date">{{ result.date }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 无结果 -->
      <div v-if="showResults && !searchResults.length && searchQuery" class="no-results">
        <el-icon class="no-results-icon"><Search /></el-icon>
        <p>没有找到相关内容</p>
        <p class="no-results-tip">试试其他关键词吧</p>
      </div>
    </div>
    
    <!-- 遮罩层 -->
    <div 
      v-if="isSearchActive" 
      class="search-overlay"
      @click="closeSearch"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { searchArticles } from '@/api';
import type { Article } from '@/types';

interface SearchResult {
  id: number;
  type: 'article' | 'tag' | 'category';
  title: string;
  description: string;
  date?: string;
}

const router = useRouter();
const searchInput = ref();
const searchQuery = ref('');
const isSearchActive = ref(false);
const searchResults = ref<SearchResult[]>([]);
const searchHistory = ref<string[]>(JSON.parse(localStorage.getItem('searchHistory') || '[]'));

const hotTags = ['Vue3', 'TypeScript', 'JavaScript', 'CSS', 'Node.js', '前端开发'];

const showSuggestions = computed(() =>
  isSearchActive.value && !searchQuery.value
);

const showResults = computed(() =>
  isSearchActive.value && searchQuery.value
);

// 防抖搜索
let searchTimer: number;
const handleSearch = () => {
  clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    performSearch();
  }, 300);
};

const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }

  const articles = await searchArticles(searchQuery.value);
  searchResults.value = articles.map((article: Article) => ({
    id: article.id,
    type: 'article' as const,
    title: article.articleTitle,
    description: article.articleContent.slice(0, 100) + '...',
    date: article.createTime
  }));
};

const handleFocus = () => {
  isSearchActive.value = true;
};

const handleBlur = () => {
  setTimeout(() => {
    if (!document.activeElement?.closest('.search-container')) {
      isSearchActive.value = false;
    }
  }, 200);
};

const closeSearch = () => {
  isSearchActive.value = false;
  searchQuery.value = '';
  searchResults.value = [];
};

const selectSuggestion = (tag: string) => {
  searchQuery.value = tag;
  performSearch();
  saveHistory(tag);
  searchInput.value?.focus();
};

const saveHistory = (keyword: string) => {
  if (!keyword.trim()) return;
  searchHistory.value = [keyword, ...searchHistory.value.filter(h => h !== keyword)].slice(0, 10);
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value));
};

const clearHistory = () => {
  searchHistory.value = [];
  localStorage.removeItem('searchHistory');
};

const goToResult = (result: SearchResult) => {
  saveHistory(searchQuery.value);
  if (result.type === 'article') {
    router.push(`/article/${result.id}`);
  } else if (result.type === 'tag') {
    router.push(`/tags/${result.id}`);
  } else if (result.type === 'category') {
    router.push(`/categories/${result.id}`);
  }
  closeSearch();
};

const getTypeLabel = (type: SearchResult['type']) => {
  const labels: Record<SearchResult['type'], string> = {
    article: '文章',
    tag: '标签',
    category: '分类'
  };
  return labels[type] || type;
};

// 键盘快捷键
const handleKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    searchInput.value?.focus();
  }
  if (e.key === 'Escape') {
    closeSearch();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style lang="scss" scoped>
.search-container {
  position: relative;
  width: 100%;
  max-width: 500px;
}

.search-wrapper {
  position: relative;
  z-index: 1001;
  
  &.active {
    .search-input {
      :deep(.el-input__wrapper) {
        box-shadow: 0 0 0 2px var(--themeBackground);
      }
    }
  }
}

.search-input {
  :deep(.el-input__wrapper) {
    border-radius: 25px;
    padding: 0 20px;
    height: 45px;
    background: var(--card-background);
    border: 1px solid var(--border-color);
    transition: all 0.3s ease;
    
    &:hover {
      border-color: var(--themeBackground);
    }
  }
  
  :deep(.el-input__inner) {
    color: var(--text-color);
    font-size: 14px;
    
    &::placeholder {
      color: var(--text-color-secondary);
    }
  }
}

.search-icon {
  color: var(--text-color-secondary);
  font-size: 16px;
}

.search-suggestions,
.search-results,
.no-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-top: 8px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1002;
}

.search-suggestions {
  padding: 20px;

  .suggestion-section {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      h4 {
        margin: 0;
        color: var(--text-color);
        font-size: 14px;
        font-weight: 600;
      }

      .clear-btn {
        font-size: 12px;
        color: var(--text-color-secondary);
        cursor: pointer;

        &:hover {
          color: var(--themeBackground);
        }
      }
    }

    h4 {
      margin: 0 0 15px 0;
      color: var(--text-color);
      font-size: 14px;
      font-weight: 600;
    }

    .suggestion-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .suggestion-tag {
      padding: 6px 12px;
      background: var(--background);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      font-size: 12px;
      color: var(--text-color);
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: var(--themeBackground);
        color: var(--white);
        border-color: var(--themeBackground);
      }

      &.history-tag {
        background: var(--card-background);
      }
    }
  }
}

.search-results {
  .result-header {
    padding: 15px 20px 10px;
    border-bottom: 1px solid var(--border-color);
    
    span {
      font-size: 12px;
      color: var(--text-color-secondary);
    }
  }
  
  .result-list {
    padding: 10px 0;
  }
  
  .result-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 20px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    
    &:hover {
      background: var(--background);
    }
    
    .result-icon {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--themeBackground);
      color: var(--white);
      border-radius: 8px;
      font-size: 14px;
    }
    
    .result-content {
      flex: 1;
      min-width: 0;
      
      h5 {
        margin: 0 0 4px 0;
        color: var(--text-color);
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      p {
        margin: 0 0 8px 0;
        color: var(--text-color-secondary);
        font-size: 12px;
        line-height: 1.4;
        display: -webkit-box;
        line-clamp: 2;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .result-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .result-type {
          padding: 2px 8px;
          background: var(--themeBackground);
          color: var(--white);
          border-radius: 10px;
          font-size: 10px;
        }
        
        .result-date {
          color: var(--text-color-secondary);
          font-size: 10px;
        }
      }
    }
  }
}

.no-results {
  padding: 40px 20px;
  text-align: center;
  
  .no-results-icon {
    font-size: 48px;
    color: var(--text-color-secondary);
    margin-bottom: 16px;
  }
  
  p {
    margin: 0 0 8px 0;
    color: var(--text-color);
    
    &.no-results-tip {
      color: var(--text-color-secondary);
      font-size: 12px;
    }
  }
}

.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1000;
  backdrop-filter: blur(4px);
}

@media screen and (max-width: 768px) {
  .search-container {
    max-width: 100%;
  }
  
  .search-suggestions,
  .search-results,
  .no-results {
    left: -10px;
    right: -10px;
  }
}
</style>