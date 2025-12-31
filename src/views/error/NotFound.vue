<template>
  <div class="not-found-page">
    <!-- 背景动画 -->
    <div class="bg-animation">
      <div class="stars"></div>
      <div class="stars2"></div>
      <div class="stars3"></div>
    </div>

    <!-- 主内容 -->
    <div class="content">
      <!-- 404 数字 -->
      <div class="error-code">
        <span class="digit">4</span>
        <span class="digit zero">
          <div class="astronaut">
            <div class="head">
              <div class="face"></div>
            </div>
            <div class="body"></div>
          </div>
        </span>
        <span class="digit">4</span>
      </div>

      <!-- 错误信息 -->
      <h1 class="error-title">页面走丢了</h1>
      <p class="error-desc">
        抱歉，您访问的页面不存在或已被移除
        <br />
        也许是宇航员把它带到太空去了 🚀
      </p>

      <!-- 操作按钮 -->
      <div class="actions">
        <button class="btn primary" @click="goHome">
          <el-icon><HomeFilled /></el-icon>
          返回首页
        </button>
        <button class="btn secondary" @click="goBack">
          <el-icon><Back /></el-icon>
          返回上页
        </button>
      </div>

      <!-- 搜索建议 -->
      <div class="search-section">
        <p>或者试试搜索：</p>
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="搜索文章..."
            @keyup.enter="handleSearch"
          />
          <button @click="handleSearch">
            <el-icon><Search /></el-icon>
          </button>
        </div>
      </div>

      <!-- 推荐链接 -->
      <div class="quick-links">
        <span class="link-label">快速访问：</span>
        <router-link to="/">首页</router-link>
        <router-link to="/archive">归档</router-link>
        <router-link to="/categories">分类</router-link>
        <router-link to="/tags">标签</router-link>
        <router-link to="/about">关于</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { HomeFilled, Back, Search } from '@element-plus/icons-vue';

const router = useRouter();
const searchQuery = ref('');

const goHome = () => {
  router.push('/');
};

const goBack = () => {
  router.back();
};

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    // 跳转到搜索页面或首页带搜索参数
    router.push({ path: '/', query: { search: searchQuery.value } });
  }
};
</script>

<style lang="scss" scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

// 星空背景动画
.bg-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.stars, .stars2, .stars3 {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  animation: animStar 50s linear infinite;
  background: transparent;
}

.stars {
  background-image: 
    radial-gradient(2px 2px at 20px 30px, #fff, transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 90px 40px, #fff, transparent),
    radial-gradient(2px 2px at 160px 120px, rgba(255,255,255,0.9), transparent),
    radial-gradient(1px 1px at 230px 80px, #fff, transparent),
    radial-gradient(2px 2px at 300px 150px, rgba(255,255,255,0.7), transparent);
  background-size: 350px 350px;
}

.stars2 {
  background-image: 
    radial-gradient(1px 1px at 50px 100px, #fff, transparent),
    radial-gradient(2px 2px at 100px 50px, rgba(255,255,255,0.6), transparent),
    radial-gradient(1px 1px at 180px 180px, #fff, transparent);
  background-size: 250px 250px;
  animation-duration: 100s;
}

.stars3 {
  background-image: 
    radial-gradient(1px 1px at 80px 60px, rgba(255,255,255,0.5), transparent),
    radial-gradient(1px 1px at 150px 120px, rgba(255,255,255,0.4), transparent);
  background-size: 200px 200px;
  animation-duration: 150s;
}

@keyframes animStar {
  from { transform: translateY(0); }
  to { transform: translateY(-1000px); }
}

// 主内容
.content {
  position: relative;
  z-index: 10;
  text-align: center;
  max-width: 600px;
}

// 404 数字
.error-code {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
}

.digit {
  font-size: 120px;
  font-weight: 900;
  color: transparent;
  -webkit-text-stroke: 3px rgba(255, 255, 255, 0.3);
  text-shadow: 0 0 50px rgba(255, 255, 255, 0.1);
  
  &.zero {
    position: relative;
    width: 120px;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

// 宇航员
.astronaut {
  position: absolute;
  animation: float 3s ease-in-out infinite;
  
  .head {
    width: 50px;
    height: 50px;
    background: #fff;
    border-radius: 50%;
    position: relative;
    margin: 0 auto;
    
    .face {
      width: 35px;
      height: 25px;
      background: linear-gradient(135deg, #87ceeb, #4a90d9);
      border-radius: 10px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      
      &::before {
        content: '';
        position: absolute;
        top: 5px;
        left: 5px;
        width: 8px;
        height: 8px;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 50%;
      }
    }
  }
  
  .body {
    width: 40px;
    height: 50px;
    background: #fff;
    border-radius: 15px 15px 20px 20px;
    margin: -5px auto 0;
    position: relative;
    
    &::before, &::after {
      content: '';
      position: absolute;
      width: 12px;
      height: 30px;
      background: #fff;
      border-radius: 10px;
      top: 10px;
    }
    
    &::before {
      left: -15px;
      transform: rotate(20deg);
    }
    
    &::after {
      right: -15px;
      transform: rotate(-20deg);
    }
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(-5deg); }
  50% { transform: translateY(-15px) rotate(5deg); }
}

// 文字
.error-title {
  font-size: 32px;
  color: #fff;
  margin: 0 0 15px;
  font-weight: 600;
}

.error-desc {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.8;
  margin: 0 0 35px;
}

// 按钮
.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 40px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 30px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  
  .el-icon {
    font-size: 18px;
  }
  
  &.primary {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
    }
  }
  
  &.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-3px);
    }
  }
}

// 搜索
.search-section {
  margin-bottom: 30px;
  
  p {
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    margin: 0 0 12px;
  }
}

.search-box {
  display: flex;
  max-width: 350px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  input {
    flex: 1;
    padding: 12px 20px;
    border: none;
    background: transparent;
    color: #fff;
    font-size: 14px;
    outline: none;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
  }
  
  button {
    padding: 12px 20px;
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

// 快速链接
.quick-links {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px 15px;
  
  .link-label {
    color: rgba(255, 255, 255, 0.5);
    font-size: 13px;
  }
  
  a {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    font-size: 13px;
    padding: 4px 12px;
    border-radius: 15px;
    background: rgba(255, 255, 255, 0.05);
    transition: all 0.3s ease;
    
    &:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.15);
    }
  }
}

// 移动端适配
@media screen and (max-width: 768px) {
  .digit {
    font-size: 80px;
    
    &.zero {
      width: 80px;
      height: 100px;
    }
  }
  
  .astronaut {
    transform: scale(0.7);
  }
  
  .error-title {
    font-size: 24px;
  }
  
  .error-desc {
    font-size: 14px;
  }
  
  .actions {
    flex-direction: column;
    
    .btn {
      width: 100%;
      justify-content: center;
    }
  }
}
</style>
