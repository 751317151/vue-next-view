<template>
  <div class="message-page">
    <!-- 背景 -->
    <div class="message-background">
      <el-image
        style="animation: header-effect 2s"
        class="background-image"
        v-once
        lazy
        :src="constant.random_image + new Date() + Math.floor(Math.random() * 10)"
        fit="cover"
      />
      <div class="background-overlay"></div>
    </div>

    <!-- 主内容区 -->
    <div class="message-content">
      <!-- 标题区 -->
      <div class="message-header my-animation-slide-top">
        <h1 class="title">
          <span class="title-icon">🌟</span>
          树洞
          <span class="title-icon">🌟</span>
        </h1>
        <p class="subtitle">在这里留下你的足迹，让文字随风飘散</p>
      </div>

      <!-- 输入区 -->
      <div class="input-section my-animation-slide-bottom">
        <div class="input-card">
          <div class="input-wrapper">
            <div class="emoji-picker" @click="toggleEmojiPicker">
              <span>{{ selectedEmoji }}</span>
            </div>
            <input
              class="message-input"
              type="text"
              placeholder="说点什么吧..."
              v-model="state.messageContent"
              @keyup.enter="submitMessage"
              @focus="state.inputFocused = true"
              @blur="state.inputFocused = false"
              maxlength="100"
            />
            <button 
              class="send-btn"
              :class="{ active: state.messageContent.trim() }"
              @click="submitMessage"
            >
              <el-icon><Promotion /></el-icon>
              发送
            </button>
          </div>
          <div class="input-tips">
            <span class="char-count">{{ state.messageContent.length }}/100</span>
            <span class="tip-text">按 Enter 发送</span>
          </div>
        </div>
        
        <!-- 表情选择器 -->
        <transition name="fade">
          <div v-if="state.showEmoji" class="emoji-panel">
            <span 
              v-for="emoji in emojis" 
              :key="emoji" 
              class="emoji-item"
              @click="selectEmoji(emoji)"
            >
              {{ emoji }}
            </span>
          </div>
        </transition>
      </div>

      <!-- 统计信息 -->
      <div class="stats-bar my-animation-slide-bottom">
        <div class="stat-item">
          <el-icon><ChatDotRound /></el-icon>
          <span>{{ state.danmus.length }} 条留言</span>
        </div>
        <div class="stat-item">
          <el-icon><User /></el-icon>
          <span>{{ uniqueUsers }} 位访客</span>
        </div>
      </div>
    </div>

    <!-- 弹幕区 -->
    <div class="barrage-container">
      <vue-danmaku
        ref="danmakuRef"
        :danmus="state.danmus"
        loop
        useSlot
        randomChannel
        isSuspend
        :speeds="80"
        style="height: 100%; width: 100%"
      >
        <template v-slot:dm="{ danmu }">
          <div class="danmu-slot" :style="{ background: getRandomColor() }">
            <div class="danmu-item">
              <el-avatar :size="28" :src="danmu.avatar">
                <span>{{ danmu.text.charAt(0) }}</span>
              </el-avatar>
              <div class="danmu-text">{{ danmu.text }}</div>
            </div>
          </div>
        </template>
      </vue-danmaku>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, reactive, nextTick, computed } from "vue";
import { ElMessage } from 'element-plus';
import { Promotion, ChatDotRound, User } from "@element-plus/icons-vue";
import constant from "@/utils/constant";
import vueDanmaku from "vue3-danmaku";

const danmakuRef = ref<any>(null);
const selectedEmoji = ref('😊');

const emojis = ['😊', '😂', '🥰', '😎', '🤔', '👍', '❤️', '🎉', '🔥', '✨', '🌟', '💪', '🙏', '👏', '😍', '🤗'];

const state = reactive({
  messageContent: "",
  inputFocused: false,
  showEmoji: false,
  danmus: [] as any[],
});

// 计算独立用户数
const uniqueUsers = computed(() => {
  const users = new Set(state.danmus.map(d => d.avatar));
  return users.size;
});

// 随机颜色
const colors = [
  'rgba(255, 107, 107, 0.85)',
  'rgba(78, 205, 196, 0.85)',
  'rgba(255, 159, 67, 0.85)',
  'rgba(99, 102, 241, 0.85)',
  'rgba(236, 72, 153, 0.85)',
  'rgba(34, 197, 94, 0.85)',
  'rgba(168, 85, 247, 0.85)',
  'rgba(59, 130, 246, 0.85)',
];

const getRandomColor = () => {
  return colors[Math.floor(Math.random() * colors.length)];
};

const toggleEmojiPicker = () => {
  state.showEmoji = !state.showEmoji;
};

const selectEmoji = (emoji: string) => {
  selectedEmoji.value = emoji;
  state.messageContent += emoji;
  state.showEmoji = false;
};

const getTreeHole = () => {
  const data = [
    { id: 215, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1", message: "这个博客太棒了！🎉" },
    { id: 218, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2", message: "真不错，学到了很多" },
    { id: 219, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3", message: "加油！继续更新 💪" },
    { id: 220, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=4", message: "设计很漂亮 ✨" },
    { id: 222, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=5", message: "太帅了，收藏了！" },
    { id: 225, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=6", message: "确实不错，推荐给朋友了" },
    { id: 227, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=7", message: "nice啊，期待更多内容" },
    { id: 228, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=8", message: "站长太棒啦！❤️" },
    { id: 229, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=9", message: "每天都来逛逛~" },
    { id: 238, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=10", message: "技术文章写得很好" },
    { id: 239, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=11", message: "学习了，感谢分享 🙏" },
    { id: 240, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=12", message: "界面很清爽，体验很好" },
  ];
  
  data.forEach((m) => {
    state.danmus.push({
      name: m.id,
      avatar: m.avatar,
      text: m.message,
      time: Math.floor(Math.random() * 10 + 5),
    });
  });
};

const submitMessage = () => {
  if (state.messageContent.trim() === "") {
    ElMessage.warning("请输入留言内容~");
    return;
  }
  
  const newDanmu = {
    name: Date.now(),
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
    text: state.messageContent.trim(),
    time: Math.floor(Math.random() * 10 + 5),
  };
  
  state.danmus.push(newDanmu);
  state.messageContent = "";
  
  ElMessage.success("留言发送成功！🎉");
};

getTreeHole();

let resizeHandler: (() => void) | null = null;

onMounted(() => {
  nextTick(() => {
    resizeHandler = () => {
      if (danmakuRef.value && typeof danmakuRef.value.resize === 'function') {
        danmakuRef.value.resize();
      }
    };
    window.addEventListener("resize", resizeHandler);
  });
});

onBeforeUnmount(() => {
  if (resizeHandler) {
    window.removeEventListener("resize", resizeHandler);
  }
});
</script>


<style lang="scss" scoped>
.message-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.message-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  
  .background-image {
    width: 100%;
    height: 100%;
  }
  
  .background-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.3) 0%,
      rgba(0, 0, 0, 0.5) 100%
    );
  }
}

.message-content {
  position: relative;
  z-index: 10;
  padding: 100px 20px 40px;
  max-width: 600px;
  margin: 0 auto;
}

.message-header {
  text-align: center;
  margin-bottom: 40px;
  
  .title {
    font-size: 48px;
    color: #fff;
    margin: 0 0 15px;
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    
    .title-icon {
      animation: twinkle 2s ease-in-out infinite;
    }
  }
  
  .subtitle {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
}

@keyframes twinkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.9); }
}

.input-section {
  position: relative;
}

.input-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.emoji-picker {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
}

.message-input {
  flex: 1;
  height: 44px;
  border: none;
  border-radius: 12px;
  padding: 0 16px;
  font-size: 15px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  outline: none;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  &:focus {
    background: rgba(255, 255, 255, 0.3);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
  }
}

.send-btn {
  height: 44px;
  padding: 0 20px;
  border: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  flex-shrink: 0;
  
  &.active {
    background: var(--themeBackground);
    color: #fff;
  }
  
  &:hover {
    transform: translateY(-2px);
  }
  
  .el-icon {
    font-size: 16px;
  }
}

.input-tips {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  padding: 0 5px;
  
  .char-count, .tip-text {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }
}

.emoji-panel {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 10px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 15px;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  z-index: 100;
  
  .emoji-item {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(0, 0, 0, 0.1);
      transform: scale(1.2);
    }
  }
}

.stats-bar {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 25px;
  
  .stat-item {
    display: flex;
    align-items: center;
    gap: 6px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    
    .el-icon {
      font-size: 16px;
    }
  }
}

.barrage-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  pointer-events: none;
}

.danmu-slot {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px 6px 6px;
  border-radius: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  pointer-events: auto;
  cursor: default;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
}

.danmu-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.danmu-text {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media screen and (max-width: 768px) {
  .message-content {
    padding: 80px 15px 30px;
  }
  
  .message-header .title {
    font-size: 36px;
  }
  
  .input-wrapper {
    flex-wrap: wrap;
  }
  
  .message-input {
    order: 1;
    width: 100%;
    flex: none;
  }
  
  .emoji-picker {
    order: 2;
  }
  
  .send-btn {
    order: 3;
    flex: 1;
  }
  
  .emoji-panel {
    grid-template-columns: repeat(6, 1fr);
    left: 50%;
    transform: translateX(-50%);
  }
  
  .danmu-text {
    max-width: 200px;
    font-size: 13px;
  }
}
</style>
