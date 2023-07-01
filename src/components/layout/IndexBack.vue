<template>
  <header ref="header" style="height: 100vh; position: relative">
    <el-image
      v-show="isMobile"
      style="animation: header-effect 2s"
      class="background-image"
      src="https://bu.dusays.com/2022/05/03/627010707b598.webp"
      fit="cover"
    >
    </el-image>
    <div v-show="!isMobile" class="view">
      <div>
        <img
          ref="imgbg1"
          src="https://cdn.naccl.top/blog/img/bg1.jpg"
          style="display: none"
        />
        <div
          class="bg1"
          style="
            background-image: url('https://cdn.naccl.top/blog/img/bg1.jpg');
          "
        ></div>
        <div
          class="bg2"
          style="
            background-image: url('https://cdn.naccl.top/blog/img/bg2.jpg');
          "
        ></div>
        <div
          class="bg3"
          style="
            background-image: url('https://cdn.naccl.top/blog/img/bg3.jpg');
          "
          v-show="state.loaded"
        ></div>
      </div>
    </div>
    <!-- <div class="text-malfunction" data-word="Elden Ring">
      <div class="line"></div>
    </div> -->
    <!-- 首页文字 -->
    <div class="signature-wall myCenter my-animation-hideToShow">
      <h1 class="playful">
        <span>Elden Ring</span>
      </h1>
      <div class="printer" @click="getGuShi()">
        <printer :printerInfo="state.printerInfo">
          <template #paper="scope">
            <h3>{{ scope.content }}<span class="cursor">|</span></h3>
          </template>
        </printer>
      </div>
    </div>
    <div class="wrapper">
      <i
        class="ali-iconfont icon-down"
        @click="scrollToNavigation('.page-container-wrap')"
      ></i>
    </div>
    <div class="wave">
      <div class="wave1"></div>
      <div class="wave2"></div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { onMounted, watch, reactive, ref } from "vue";
import { storeToRefs } from "pinia";
import { useConfig } from "@/stores/config";
import printer from "@/components/common/printer.vue";
import constant from "@/utils/constant";

const storesConfig = useConfig();
const { clientSize, isMobile } = storeToRefs(storesConfig);

const state = reactive({
  loaded: false,
  printerInfo: "你看对面的青山多漂亮",
  guShi: {
    content: "",
    origin: "",
    author: "",
    category: "",
  },
});
const header = ref(null);
const imgbg1 = ref(null);

//平滑滚动至正文部分
const scrollToMain = () => {
  window.scrollTo({
    top: document.documentElement.clientHeight,
    behavior: "smooth",
  });
};
const scrollToNavigation = (selector) => {
  let pageId = document.querySelector(selector);
  window.scrollTo({
    top: pageId.offsetTop,
    behavior: "smooth",
  });
};

const getGuShi = () => {
  let xhr = new XMLHttpRequest();
  xhr.open("get", constant.jinrishici);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      state.guShi = JSON.parse(xhr.responseText);
      state.printerInfo = state.guShi.content;
    }
  };
  xhr.send();
};

onMounted(() => {
  /**
   * 因为bg3.jpg比较小，通常会比bg1.jpg先加载，显示出来会有一瞬间bg1显示一半，bg3显示一半，为了解决这个问题，增加这个判断，让bg1加载完毕后再显示bg3
   * HTML中使用img标签的原因：我个人想用div作为图片的载体，而只有img标签有图片加载完毕的onload回调，所以用一个display: none的img人柱力来加载图片
   * 当img中的src加载完毕后，会把图片缓存到浏览器，后续在div中用background url的形式将直接从浏览器中取出图片，不会下载两次图片
   */
  imgbg1.value.onload = () => {
    state.loaded = true;
  };

  let startingPoint = 0;
  header.value.addEventListener("mouseenter", (e) => {
    startingPoint = e.clientX;
  });
  header.value.addEventListener("mouseout", () => {
    header.value.classList.remove("moving");
    header.value.style.setProperty("--percentage", 0.5);
  });
  header.value.addEventListener("mousemove", (e) => {
    let percentage = (e.clientX - startingPoint) / window.outerWidth + 0.5;
    header.value.style.setProperty("--percentage", percentage);
    header.value.classList.add("moving");
  });
  getGuShi();
});
</script>

<style scoped>
header {
  --percentage: 0.5;
  user-select: none;
}

.view {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  transform: translatex(calc(var(--percentage) * 100px));
}

.view div {
  background-position: center center;
  background-size: cover;
  position: absolute;
  width: 110%;
  height: 100%;
}

.view .bg1 {
  z-index: 10;
  width: 100%;
  opacity: calc(1 - (var(--percentage) - 0.5) / 0.3);
}

.view .bg2 {
  z-index: 20;
  width: 110%;
  opacity: calc(1 - (var(--percentage) - 0.25) / 0.25);
}

.view .bg3 {
  width: 110%;
  left: -10%;
  opacity: calc(0.2+ (var(--percentage) - 0.3) / 0.3);
}

header .view,
header .bg1,
header .bg2,
header .bg3 {
  transition: 0.2s all ease-in;
}

header.moving .view,
header.moving .bg1,
header.moving .bg2,
header.moving .bg3 {
  transition: none;
}

.text-malfunction {
  position: absolute;
  top: 40%;
  left: 51.5%;
  transform: translate(-50%, -50%) scale(2.5);
  width: 220px;
  font-size: 34px;
  font-family: sans-serif;
  color: transparent;
}

.line {
  position: absolute;
  width: 200px;
  left: -1px;
  height: 1px;
  background: black;
  z-index: 50;
  animation: lineMove 5s ease-out infinite;
}

.text-malfunction:before,
.text-malfunction:after {
  content: attr(data-word);
  position: absolute;
  top: 0;
  line-height: 50px;
  overflow: hidden;
  filter: contrast(200%);
}

.text-malfunction:before {
  left: 0;
  color: red;
  text-shadow: 1px 0 0 red;
  z-index: 30;
  animation: malfunctionAni 0.95s infinite;
}

.text-malfunction:after {
  left: -1px;
  color: cyan;
  text-shadow: -1px 0 0 cyan;
  z-index: 40;
  mix-blend-mode: lighten;
  animation: malfunctionAni 1.1s infinite 0.2s;
}

.signature-wall {
  position: absolute;
  flex-direction: column;
  left: 0;
  right: 0;
  margin: auto;
  font-size: 26px;
  top: 30%;
  z-index: 150;
}

.playful {
  color: var(--blue);
  font-size: 40px;
}

.printer {
  cursor: pointer;
  color: var(--blue);
  background: var(--translucent);
  border-radius: 10px;
  padding-left: 10px;
  padding-right: 10px;
}

@keyframes lineMove {
  9% {
    top: 38px;
  }
  14% {
    top: 8px;
  }
  18% {
    top: 42px;
  }
  22% {
    top: 1px;
  }
  32% {
    top: 32px;
  }
  34% {
    top: 12px;
  }
  40% {
    top: 26px;
  }
  43% {
    top: 7px;
  }
  99% {
    top: 30px;
  }
}

@keyframes malfunctionAni {
  10% {
    top: -0.4px;
    left: -1.1px;
  }
  20% {
    top: 0.4px;
    left: -0.2px;
  }
  30% {
    left: 0.5px;
  }
  40% {
    top: -0.3px;
    left: -0.7px;
  }
  50% {
    left: 0.2px;
  }
  60% {
    top: 1.8px;
    left: -1.2px;
  }
  70% {
    top: -1px;
    left: 0.1px;
  }
  80% {
    top: -0.4px;
    left: -0.9px;
  }
  90% {
    left: 1.2px;
  }
  100% {
    left: -1.2px;
  }
}

.wrapper {
  position: absolute;
  width: 100px;
  bottom: 200px;
  left: 0;
  right: 0;
  margin: auto;
  font-size: 26px;
  z-index: 90;
}

.wrapper i {
  font-size: 60px;
  opacity: 0.5;
  cursor: pointer;
  position: absolute;
  top: 55px;
  left: 20px;
  animation: opener 0.5s ease-in-out alternate infinite;
  transition: opacity 0.2s ease-in-out, transform 0.5s ease-in-out 0.2s;
}

.wrapper i:hover {
  opacity: 1;
}

@keyframes opener {
  100% {
    top: 65px;
  }
}
.wave {
  position: absolute;
  bottom: 0;
  height: 90px;
  width: 100%;
}
.wave1,
.wave2 {
  position: absolute;
  bottom: 0;
  transition-duration: 0.4s, 0.4s;
  z-index: 80;
  animation: gradientBG 120s linear infinite;
}

.wave1 {
  height: 90px;
  width: 100%;
  background: url("https://cdn.naccl.top/blog/img/wave1.png") repeat-x;
}

.wave2 {
  height: 90px;
  width: 110%;
  left: -10%;
  background: url("https://cdn.naccl.top/blog/img/wave2.png") repeat-x;
}
</style>
