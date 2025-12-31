<template>
  <div>
    <div>
      <el-image
        style="animation: header-effect 2s"
        class="background-image"
        v-once
        lazy
        :src="
          constant.random_image + new Date() + Math.floor(Math.random() * 10)
        "
        fit="cover"
      >
        <div slot="error" class="image-slot background-image-error"></div>
      </el-image>
      <!-- 输入框 -->
      <div class="message-in" style="text-align: center">
        <h2 class="message-title">树洞</h2>
        <div>
          <input
            class="message-input"
            type="text"
            style="outline: none; width: 70%"
            placeholder="留下点什么啦~"
            v-model="state.messageContent"
            @click="state.show = true"
            maxlength="60"
          />
          <button
            v-show="state.show"
            style="margin-left: 12px; cursor: pointer; width: 20%"
            @click="submitMessage()"
            class="message-input"
          >
            发射
          </button>
        </div>
      </div>
      <!-- 弹幕 -->
      <div class="barrage-container">
        <vue-danmaku
          ref="danmakuRef"
          :danmus="state.danmus"
          loop
          useSlot
          randomChannel
          isSuspend
          speeds="100"
          style="height: 100%; width: 100%"
        >
          <template v-slot:dm="{ danmu }">
            <div class="danmu-slot">
              <div class="danmu-item">
                <el-avatar :size="30" :src="danmu.avatar"></el-avatar>
                <div class="danmu-text">
                  {{ danmu.text }}
                </div>
              </div>
            </div>
          </template>
        </vue-danmaku>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, reactive, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useConfig } from "@/stores/config";
import { ElMessage } from 'element-plus';
import common from "@/utils/common";
import constant from "@/utils/constant";
import vueDanmaku from "vue3-danmaku";

const danmakuRef = ref(null);
const state = reactive({
  show: false,
  messageContent: "",
  // background: {"background": "url(" + this.$store.state.webInfo.backgroundImage + ") center center / cover no-repeat"},
  danmus: [],
});

const getTreeHole = () => {
  let data = [
    {
      id: 215,
      avatar: "https://haiyong.site/img/favicon.png",
      message: "牛",
      createTime: "2022-12-06T12:11:40",
    },
    {
      id: 218,
      avatar: "https://haiyong.site/img/favicon.png",
      message: "真不错",
      createTime: "2022-12-06T14:49:11",
    },
    {
      id: 219,
      avatar: "https://haiyong.site/img/favicon.png",
      message: "加油",
      createTime: "2022-12-06T15:41:58",
    },
    {
      id: 220,
      avatar: "https://haiyong.site/img/favicon.png",
      message: "牛蛙",
      createTime: "2022-12-06T16:35:57",
    },
    {
      id: 222,
      avatar: "https://haiyong.site/img/favicon.png",
      message: "太帅了",
      createTime: "2022-12-06T17:00:18",
    },
    {
      id: 225,
      avatar: "https://haiyong.site/img/favicon.png",
      message: "我擦 确实不错",
      createTime: "2022-12-06T21:06:21",
    },
    {
      id: 227,
      avatar: "https://haiyong.site/img/favicon.png",
      message: "nice啊",
      createTime: "2022-12-07T00:07:59",
    },
    {
      id: 228,
      avatar: "https://haiyong.site/img/favicon.png",
      message: "站长，太棒啦！",
      createTime: "2022-12-07T11:22:55",
    },
    {
      id: 229,
      avatar: "https://haiyong.site/img/favicon.png",
      message: "滴滴滴",
      createTime: "2022-12-07T14:32:25",
    },
    {
      id: 238,
      avatar: "https://haiyong.site/img/favicon.png",
      message: "牛逼plus",
      createTime: "2022-12-07T21:52:07",
    },
    {
      id: 239,
      avatar: "https://haiyong.site/img/favicon.png",
      message: "牛牛牛",
      createTime: "2022-12-08T03:30:41",
    },
    {
      id: 240,
      avatar: "https://haiyong.site/img/favicon.png",
      message:
        "UP主，非常喜欢你的博客，但是希望有些地方能优化一下，有些动画有点卡顿",
      createTime: "2022-12-08T08:27:48",
    },
  ];
  data.forEach((m) => {
    state.danmus.push({
      name: m.id,
      avatar: m.avatar,
      text: m.message,
      time: Math.floor(Math.random() * 10 + 5),
    });
    // state.danmus.push(m.message);
  });
};
const submitMessage = () => {
  if (state.messageContent.trim() === "") {
    ElMessage.error("你还没写呢~");
    return;
  }
  
  // 添加新消息到弹幕列表
  const newDanmu = {
    name: Date.now(),
    avatar: "https://haiyong.site/img/favicon.png",
    text: state.messageContent.trim(),
    time: Math.floor(Math.random() * 10 + 5),
  };
  
  state.danmus.push(newDanmu);
  state.messageContent = "";
  state.show = false;
  
  ElMessage.success("消息发送成功！");
};

getTreeHole();

// 使用组合式API的生命周期钩子
let resizeHandler;

onMounted(() => {
  // 等待DOM完全渲染后再添加事件监听器
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
  // 清理事件监听器
  if (resizeHandler) {
    window.removeEventListener("resize", resizeHandler);
  }
});
</script>

<style lang="scss" scoped>
.danmu-slot {
  display: flex;
  justify-content: space-between;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 1rem;
  height: 36px;
  width: calc(100% + 5px);
}
.danmu-item {
  display: flex;
  align-items: center;
  margin: 0 5px;
}
.danmu-text {
  font-size: 16px;
  overflow: hidden;
  margin-left: 5px;
}

.background-image {
  z-index: 0;
}
.message-in {
  position: absolute;
  left: 50%;
  top: 40%;
  transform: translate(-50%, -50%);
  color: var(--white);
  animation: hideToShow 2.5s;
  width: 360px;
  z-index: 10;
}
.message-title {
  user-select: none;
  text-align: center;
}

.message-input {
  border-radius: 1.2rem;
  border: var(--white) 1px solid;
  color: var(--white);
  background: var(--transparent);
  padding: 10px 10px;
}

.message-input::-webkit-input-placeholder {
  color: var(--white);
}

.barrage-container {
  position: absolute;
  top: 50px;
  left: 0;
  right: 0;
  bottom: 0;
  height: calc(100% - 50px);
  width: 100%;
  user-select: none;
  overflow: hidden;
}

.comment-wrap {
  background: var(--background);
  position: absolute;
  top: 100vh;
  width: 100%;
}

.comment-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}
</style>
