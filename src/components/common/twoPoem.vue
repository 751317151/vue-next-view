<template>
  <div
    class="poem-container myCenter my-animation-hideToShow"
    v-if="
      !common.isEmpty(state.guShi.origin) ||
      !common.isEmpty(state.hitokoto.hitokoto)
    "
  >
    <!-- 背景图片 -->
    <el-image
      class="my-el-image poem-image"
      style="position: absolute; margin-top: -50px"
      v-once
      lazy
      :src="
        constant.two_poem_image[
          Math.floor(Math.random() * constant.two_poem_image.length)
        ]
      "
      fit="cover"
    >
      <!-- <div slot="error" class="image-slot"></div> -->
      <template #error>
        <div class="image-slot">
          <el-icon><icon-picture /></el-icon>
        </div>
      </template>
    </el-image>
    <div class="poem-wrap">
      <div v-if="isShehui"><span>鬼畜全明星</span></div>
      <div v-else>
        <span>{{ isHitokoto ? state.hitokoto.from : state.guShi.origin }}</span>
      </div>
      <p class="poem">
        {{ isHitokoto ? state.hitokoto.hitokoto : state.guShi.content }}
      </p>
      <p
        class="info"
        v-if="
          !isShehui &&
          (!isHitokoto ||
            (isHitokoto && !common.isEmpty(state.hitokoto.from_who)))
        "
      >
        {{ isHitokoto ? state.hitokoto.from_who : state.guShi.author }}
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive } from "vue";
import constant from "@/utils/constant";
import common from "@/utils/common";

const props = defineProps({
  isHitokoto: {
    type: Boolean,
    default: true,
  },
  isShehui: {
    type: Boolean,
    default: false,
  },
});
const state = reactive({
  guShi: {
    content: "",
    origin: "",
    author: "",
    category: "",
  },
  hitokoto: {
    hitokoto: "...",
    from: "...",
    from_who: "...",
  },
});

const getGuShi = () => {
  let xhr = new XMLHttpRequest();
  xhr.open("get", constant.jinrishici);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      state.guShi = JSON.parse(xhr.responseText);
    }
  };
  xhr.send();
};

const sendShehui = () => {
  let xhr = new XMLHttpRequest();
  xhr.open("get", constant.shehui);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      let shehui = xhr.responseText;
      state.hitokoto.hitokoto = shehui.substring(1, shehui.length - 1);
    }
  };
  xhr.send();
};
const getHitokoto = () => {
  let xhr = new XMLHttpRequest();
  xhr.open("get", constant.hitokoto);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      state.hitokoto = JSON.parse(xhr.responseText);
    }
  };
  xhr.send();
};
onMounted(() => {
  if (!props.isShehui) {
    if (props.isHitokoto) {
      getHitokoto();
    } else {
      getGuShi();
    }
  } else {
    state.hitokoto.from = "";
    state.hitokoto.from_who = "";
    sendShehui();
  }
});
</script>
<style scoped>
.poem-container {
  padding: 90px 0 40px;
  position: relative;
}

.poem-wrap {
  border-radius: 10px;
  z-index: 10;
  text-align: center;
  letter-spacing: 4px;
  font-weight: 300;
  width: 100%;
  max-width: 800px;
}

.poem-wrap div span {
  padding: 5px 10px;
  color: var(--white);
  font-size: 2em;
  border-radius: 5px;
}

.poem-wrap p {
  width: 100%;
  max-width: 800px;
  color: var(--white);
}

.poem-wrap p.poem {
  margin: 40px auto;
  font-size: 1.5em;
}

.poem-wrap p.info {
  margin: 20px auto 40px;
  font-size: 1.1em;
}
</style>
