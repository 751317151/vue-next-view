<template>
  <div class="friend-container">
    <!-- 头部 -->
    <div class="friend-header my-animation-slide-top">
      <CommonHead :typeName="'友人帐'"></CommonHead>
    </div>

    <!-- 内容 -->
    <div class="friend-content my-animation-slide-bottom">
      <div class="content-wrapper">
        <!-- 申请友链 -->
        <div class="apply-section">
          <div class="apply-card">
            <h2>🤝 申请友链</h2>
            <p>欢迎志同道合的朋友申请友链！请确保您的网站内容积极向上，技术相关优先。</p>
            
            <div class="apply-form">
              <div class="form-row">
                <el-input
                  v-model="applyForm.name"
                  placeholder="网站名称"
                  class="form-input"
                />
                <el-input
                  v-model="applyForm.url"
                  placeholder="网站链接"
                  class="form-input"
                />
              </div>
              <div class="form-row">
                <el-input
                  v-model="applyForm.avatar"
                  placeholder="头像链接"
                  class="form-input"
                />
                <el-input
                  v-model="applyForm.description"
                  placeholder="网站描述"
                  class="form-input"
                />
              </div>
              <el-button 
                type="primary" 
                @click="submitApply"
                :loading="applying"
                class="apply-btn"
              >
                提交申请
              </el-button>
            </div>
          </div>
        </div>

        <!-- 友链列表 -->
        <div class="friends-section">
          <h2>👥 友情链接</h2>
          <div class="friends-grid">
            <div
              v-for="(friend, index) in friendList"
              :key="index"
              class="friend-card"
              @click="visitFriend(friend.url)"
            >
              <div class="friend-avatar">
                <el-avatar :size="60" :src="friend.avatar">
                  <template #error>
                    <div class="avatar-fallback">
                      <el-icon><User /></el-icon>
                    </div>
                  </template>
                </el-avatar>
              </div>
              <div class="friend-info">
                <h3>{{ friend.name }}</h3>
                <p>{{ friend.description }}</p>
                <div class="friend-meta">
                  <span class="friend-url">{{ formatUrl(friend.url) }}</span>
                  <el-icon class="external-link"><Link /></el-icon>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 友链说明 -->
        <div class="rules-section">
          <h2>📋 友链要求</h2>
          <div class="rules-card">
            <ul class="rules-list">
              <li>网站内容积极向上，无违法违规内容</li>
              <li>网站能够正常访问，加载速度合理</li>
              <li>优先考虑技术博客、个人网站</li>
              <li>网站有一定的原创内容</li>
              <li>请先添加本站友链，格式如下：</li>
            </ul>
            
            <div class="site-info">
              <div class="info-item">
                <strong>网站名称：</strong>BlackStar's Blog
              </div>
              <div class="info-item">
                <strong>网站链接：</strong>https://blackstar.blog
              </div>
              <div class="info-item">
                <strong>网站描述：</strong>记录技术成长，分享编程心得
              </div>
              <div class="info-item">
                <strong>头像链接：</strong>{{ webInfo.avatar }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { storeToRefs } from "pinia";
import { useConfig } from "@/stores/config";

const storesConfig = useConfig();
const { webInfo } = storeToRefs(storesConfig);

const applying = ref(false);

const applyForm = reactive({
  name: '',
  url: '',
  avatar: '',
  description: ''
});

const friendList = reactive([
  {
    name: "Vue.js 官方",
    url: "https://vuejs.org",
    avatar: "https://vuejs.org/logo.svg",
    description: "渐进式 JavaScript 框架"
  },
  {
    name: "TypeScript",
    url: "https://www.typescriptlang.org",
    avatar: "https://www.typescriptlang.org/icons/icon-512x512.png",
    description: "JavaScript 的超集，添加了静态类型定义"
  },
  {
    name: "Element Plus",
    url: "https://element-plus.org",
    avatar: "https://element-plus.org/images/element-plus-logo.svg",
    description: "基于 Vue 3 的组件库"
  },
  {
    name: "Vite",
    url: "https://vitejs.dev",
    avatar: "https://vitejs.dev/logo.svg",
    description: "下一代前端构建工具"
  },
  {
    name: "MDN Web Docs",
    url: "https://developer.mozilla.org",
    avatar: "https://developer.mozilla.org/mdn-social-share.cd6c4a5a.png",
    description: "Web 开发者资源"
  },
  {
    name: "GitHub",
    url: "https://github.com",
    avatar: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    description: "全球最大的代码托管平台"
  },
  {
    name: "Stack Overflow",
    url: "https://stackoverflow.com",
    avatar: "https://cdn.sstatic.net/Sites/stackoverflow/Img/apple-touch-icon.png",
    description: "程序员问答社区"
  },
  {
    name: "CSS-Tricks",
    url: "https://css-tricks.com",
    avatar: "https://css-tricks.com/wp-content/uploads/2019/06/akqcss.png",
    description: "CSS 技巧和前端开发资源"
  }
]);

const submitApply = () => {
  if (!applyForm.name || !applyForm.url || !applyForm.description) {
    ElMessage.warning('请填写完整信息');
    return;
  }

  if (!isValidUrl(applyForm.url)) {
    ElMessage.error('请输入有效的网站链接');
    return;
  }

  applying.value = true;
  
  // 模拟提交
  setTimeout(() => {
    ElMessage.success('友链申请已提交，请耐心等待审核！');
    
    // 重置表单
    Object.keys(applyForm).forEach(key => {
      applyForm[key] = '';
    });
    
    applying.value = false;
  }, 1500);
};

const visitFriend = (url: string) => {
  window.open(url, '_blank');
};

const formatUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
};

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
</script>

<style lang="scss" scoped>
.friend-container {
  min-height: 100vh;
  background: var(--background);
}

.friend-content {
  padding: 40px 20px 60px;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.apply-section {
  margin-bottom: 60px;
}

.apply-card {
  background: var(--card-background);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  
  h2 {
    margin: 0 0 15px 0;
    color: var(--text-color);
    font-size: 1.8rem;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  > p {
    color: var(--text-color-secondary);
    margin-bottom: 30px;
    line-height: 1.6;
  }
}

.apply-form {
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
    
    @media screen and (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
  
  .form-input {
    :deep(.el-input__inner) {
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--background);
      color: var(--text-color);
      
      &:focus {
        border-color: var(--themeBackground);
        box-shadow: 0 0 0 2px rgba(var(--themeBackground-rgb), 0.2);
      }
    }
  }
  
  .apply-btn {
    background: var(--themeBackground);
    border-color: var(--themeBackground);
    border-radius: 8px;
    padding: 12px 30px;
    font-size: 16px;
    
    &:hover {
      background: var(--themeBackground);
      border-color: var(--themeBackground);
      opacity: 0.9;
    }
  }
}

.friends-section {
  margin-bottom: 60px;
  
  h2 {
    margin: 0 0 30px 0;
    color: var(--text-color);
    font-size: 1.8rem;
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.friend-card {
  background: var(--card-background);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 15px;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    border-color: var(--themeBackground);
  }
}

.friend-avatar {
  flex-shrink: 0;
  
  .avatar-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--themeBackground);
    color: var(--white);
    font-size: 24px;
  }
}

.friend-info {
  flex: 1;
  min-width: 0;
  
  h3 {
    margin: 0 0 8px 0;
    color: var(--text-color);
    font-size: 1.1rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  p {
    margin: 0 0 10px 0;
    color: var(--text-color-secondary);
    font-size: 0.9rem;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.friend-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .friend-url {
    color: var(--themeBackground);
    font-size: 0.85rem;
    font-weight: 500;
  }
  
  .external-link {
    color: var(--text-color-secondary);
    font-size: 14px;
  }
}

.rules-section {
  h2 {
    margin: 0 0 30px 0;
    color: var(--text-color);
    font-size: 1.8rem;
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

.rules-card {
  background: var(--card-background);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
}

.rules-list {
  margin: 0 0 30px 0;
  padding-left: 20px;
  
  li {
    color: var(--text-color);
    line-height: 1.8;
    margin-bottom: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.site-info {
  background: var(--background);
  border-radius: 12px;
  padding: 25px;
  border: 1px solid var(--border-color);
  
  .info-item {
    margin-bottom: 12px;
    color: var(--text-color);
    line-height: 1.6;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    strong {
      color: var(--themeBackground);
      font-weight: 600;
    }
  }
}

@media screen and (max-width: 768px) {
  .friend-content {
    padding: 30px 15px 40px;
  }
  
  .apply-card,
  .rules-card {
    padding: 25px;
  }
  
  .friends-grid {
    grid-template-columns: 1fr;
  }
  
  .friend-card {
    flex-direction: column;
    text-align: center;
    
    .friend-info {
      text-align: center;
    }
    
    .friend-meta {
      justify-content: center;
      gap: 10px;
    }
  }
}
</style>