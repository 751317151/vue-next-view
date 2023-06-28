<template>
  <div>
    <!-- el过渡动画 -->
    <transition name="el-fade-in-linear">
      <!-- 导航栏 -->
      <nav-bar></nav-bar>
    </transition>

    <div id="main-container">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import NavBar from "@/components/layout/NavBar.vue";
import { useConfig } from "@/stores/config";
import { storeToRefs } from "pinia";
import { onMounted, onBeforeUnmount, watch, reactive } from "vue";
import mousedown from "@/utils/mousedown";

const storesConfig = useConfig();

const state = reactive({
  mouseAnimation: false,
  isDark: false,
  toolButton: false,
  mobile: false,
});

const isDaylight = () => {
  let currDate = new Date();
  if (currDate.getHours() > 22 || currDate.getHours() < 7) {
    return true;
  } else {
    return false;
  }
};

onMounted(() => {
  if (state.mouseAnimation) {
    mousedown();
  }
  window.addEventListener("scroll", storesConfig.onScrollPage);
  if (isDaylight()) {
    state.isDark = true;
    let root = document.querySelector(":root");
    root.style.setProperty("--background", "#272727");
    root.style.setProperty("--fontColor", "white");
    root.style.setProperty("--borderColor", "#4F4F4F");
    root.style.setProperty("--borderHoverColor", "black");
    root.style.setProperty("--articleFontColor", "#E4E4E4");
    root.style.setProperty("--articleGreyFontColor", "#D4D4D4");
    root.style.setProperty("--commentContent", "#D4D4D4");
    root.style.setProperty("--favoriteBg", "#1e1e1e");
  }
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", storesConfig.onScrollPage);
});
watch(
  () => storesConfig.scrollTop,
  (scrollTop, oldScrollTop) => {
    //如果滑动距离超过屏幕高度三分之一视为进入页面，背景改为白色
    let enter = scrollTop > window.innerHeight / 2;
    const top = scrollTop - oldScrollTop < 0;
    let isShow = scrollTop - window.innerHeight > 30;
    state.toolButton = isShow;
    if (isShow && !state.mobile) {
      if (window.innerHeight > 950) {
        $(".cd-top").css("top", "0");
      } else {
        $(".cd-top").css("top", window.innerHeight - 950 + "px");
      }
    } else if (!isShow && !state.mobile) {
      $(".cd-top").css("top", "-900px");
    }

    //导航栏显示与颜色
    let toolbarStatus = {
      enter: enter,
      visible: top,
    };
    storesConfig.changeToolbarStatus(toolbarStatus);
  }
);
</script>

<style></style>

function mounted(arg0: () => void) { throw new Error("Function not
implemented."); }
