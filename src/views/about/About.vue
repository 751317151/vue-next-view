<template>
  <div class="about-container">
    <!-- 头部介绍 -->
    <div class="about-header my-animation-slide-top">
      <div class="header-content">
        <div class="avatar-section">
          <el-avatar :size="120" :src="webInfo.avatar" class="main-avatar">
            <template #error>
              <div class="avatar-fallback">
                <el-icon><User /></el-icon>
              </div>
            </template>
          </el-avatar>
          <h1>BlackStar</h1>
          <p class="subtitle">全栈开发者 | 技术分享者 | 终身学习者</p>
        </div>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="about-content my-animation-slide-bottom">
      <div class="content-wrapper">
        <!-- 个人介绍 -->
        <div class="section intro-section">
          <h2>👋 关于我</h2>
          <div class="intro-text">
            <p>
              你好！我是 BlackStar，一名热爱技术的全栈开发者。我专注于前端技术栈，
              包括 Vue.js、React、TypeScript 等现代前端技术，同时也涉猎后端开发、
              数据库设计和云服务部署。
            </p>
            <p>
              我相信技术的力量能够改变世界，也相信分享知识能够让技术社区变得更好。
              通过这个博客，我希望能够记录自己的学习历程，分享技术心得，
              与更多志同道合的朋友交流学习。
            </p>
          </div>
        </div>

        <!-- 技能栈 -->
        <div class="section skills-section">
          <h2>🛠️ 技能栈</h2>
          <div class="skills-grid">
            <div class="skill-category">
              <h3>前端开发</h3>
              <div class="skill-tags">
                <span class="skill-tag">Vue.js</span>
                <span class="skill-tag">React</span>
                <span class="skill-tag">TypeScript</span>
                <span class="skill-tag">JavaScript</span>
                <span class="skill-tag">HTML5</span>
                <span class="skill-tag">CSS3</span>
                <span class="skill-tag">Sass</span>
                <span class="skill-tag">Webpack</span>
                <span class="skill-tag">Vite</span>
              </div>
            </div>
            <div class="skill-category">
              <h3>后端开发</h3>
              <div class="skill-tags">
                <span class="skill-tag">Node.js</span>
                <span class="skill-tag">Express</span>
                <span class="skill-tag">Koa</span>
                <span class="skill-tag">Python</span>
                <span class="skill-tag">Java</span>
                <span class="skill-tag">Spring Boot</span>
              </div>
            </div>
            <div class="skill-category">
              <h3>数据库</h3>
              <div class="skill-tags">
                <span class="skill-tag">MySQL</span>
                <span class="skill-tag">PostgreSQL</span>
                <span class="skill-tag">MongoDB</span>
                <span class="skill-tag">Redis</span>
              </div>
            </div>
            <div class="skill-category">
              <h3>工具 & 其他</h3>
              <div class="skill-tags">
                <span class="skill-tag">Git</span>
                <span class="skill-tag">Docker</span>
                <span class="skill-tag">AWS</span>
                <span class="skill-tag">Linux</span>
                <span class="skill-tag">Nginx</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 联系方式 -->
        <div class="section contact-section">
          <h2>📫 联系我</h2>
          <div class="contact-grid">
            <div class="contact-item">
              <el-icon class="contact-icon"><Message /></el-icon>
              <div class="contact-info">
                <h4>邮箱</h4>
                <p>blackstar@example.com</p>
              </div>
            </div>
            <div class="contact-item">
              <el-icon class="contact-icon"><Link /></el-icon>
              <div class="contact-info">
                <h4>GitHub</h4>
                <p>github.com/blackstar</p>
              </div>
            </div>
            <div class="contact-item">
              <el-icon class="contact-icon"><ChatDotRound /></el-icon>
              <div class="contact-info">
                <h4>微信</h4>
                <p>blackstar_dev</p>
              </div>
            </div>
            <div class="contact-item">
              <el-icon class="contact-icon"><Location /></el-icon>
              <div class="contact-info">
                <h4>位置</h4>
                <p>中国 · 北京</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 博客统计 -->
        <div class="section stats-section">
          <h2>📊 博客统计</h2>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">50+</div>
              <div class="stat-label">文章总数</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">10K+</div>
              <div class="stat-label">总访问量</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">500+</div>
              <div class="stat-label">获得点赞</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">2+</div>
              <div class="stat-label">运行年数</div>
            </div>
          </div>
        </div>

        <!-- 时间线 -->
        <div class="section timeline-section">
          <h2>🚀 成长历程</h2>
          <div class="timeline">
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <h4>2024</h4>
                <p>开始专注于全栈开发，深入学习云原生技术</p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <h4>2023</h4>
                <p>创建个人技术博客，开始技术分享之路</p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <h4>2022</h4>
                <p>转向前端开发，深入学习 Vue.js 和现代前端技术栈</p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <h4>2021</h4>
                <p>开始编程学习之路，接触 Web 开发</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useConfig } from "@/stores/config";

const storesConfig = useConfig();
const { webInfo } = storeToRefs(storesConfig);
</script>

<style lang="scss" scoped>
.about-container {
  min-height: 100vh;
  background: var(--background);
}

.about-header {
  background: linear-gradient(135deg, var(--themeBackground), #667eea);
  color: var(--white);
  padding: 80px 20px 60px;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
  }
}

.header-content {
  position: relative;
  z-index: 1;
}

.avatar-section {
  .main-avatar {
    margin-bottom: 20px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }
  
  h1 {
    font-size: 2.5rem;
    margin: 0 0 10px 0;
    font-weight: 700;
  }
  
  .subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
    margin: 0;
  }
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--themeBackground);
  color: var(--white);
  font-size: 48px;
}

.about-content {
  padding: 60px 20px;
}

.content-wrapper {
  max-width: 1000px;
  margin: 0 auto;
}

.section {
  margin-bottom: 60px;
  
  h2 {
    font-size: 1.8rem;
    margin-bottom: 30px;
    color: var(--text-color);
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

.intro-section {
  .intro-text {
    background: var(--card-background);
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--border-color);
    
    p {
      line-height: 1.8;
      margin-bottom: 20px;
      color: var(--text-color);
      font-size: 1rem;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.skills-section {
  .skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
  }
  
  .skill-category {
    background: var(--card-background);
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--border-color);
    
    h3 {
      margin: 0 0 20px 0;
      color: var(--themeBackground);
      font-size: 1.2rem;
    }
    
    .skill-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .skill-tag {
      background: var(--themeBackground);
      color: var(--white);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }
    }
  }
}

.contact-section {
  .contact-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }
  
  .contact-item {
    display: flex;
    align-items: center;
    gap: 15px;
    background: var(--card-background);
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--border-color);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    }
    
    .contact-icon {
      font-size: 24px;
      color: var(--themeBackground);
    }
    
    .contact-info {
      h4 {
        margin: 0 0 5px 0;
        color: var(--text-color);
        font-size: 1rem;
      }
      
      p {
        margin: 0;
        color: var(--text-color-secondary);
        font-size: 0.9rem;
      }
    }
  }
}

.stats-section {
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }
  
  .stat-item {
    text-align: center;
    background: var(--card-background);
    padding: 30px 20px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--border-color);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    }
    
    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--themeBackground);
      margin-bottom: 10px;
    }
    
    .stat-label {
      color: var(--text-color-secondary);
      font-size: 0.9rem;
    }
  }
}

.timeline-section {
  .timeline {
    position: relative;
    padding-left: 30px;
    
    &::before {
      content: '';
      position: absolute;
      left: 15px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--themeBackground);
    }
  }
  
  .timeline-item {
    position: relative;
    margin-bottom: 30px;
    
    .timeline-dot {
      position: absolute;
      left: -37px;
      top: 5px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--themeBackground);
      border: 3px solid var(--background);
      box-shadow: 0 0 0 3px var(--themeBackground);
    }
    
    .timeline-content {
      background: var(--card-background);
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--border-color);
      
      h4 {
        margin: 0 0 10px 0;
        color: var(--themeBackground);
        font-size: 1.1rem;
        font-weight: 600;
      }
      
      p {
        margin: 0;
        color: var(--text-color);
        line-height: 1.6;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .about-header {
    padding: 60px 20px 40px;
    
    .avatar-section {
      h1 {
        font-size: 2rem;
      }
      
      .subtitle {
        font-size: 1rem;
      }
    }
  }
  
  .about-content {
    padding: 40px 15px;
  }
  
  .section {
    margin-bottom: 40px;
    
    h2 {
      font-size: 1.5rem;
    }
  }
  
  .skills-grid,
  .contact-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .timeline {
    padding-left: 20px;
    
    .timeline-item .timeline-dot {
      left: -27px;
    }
  }
}
</style>