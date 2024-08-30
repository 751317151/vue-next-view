<template>
  <div class="main-index">
    <!-- el过渡动画 -->
    <!-- <transition name="el-fade-in-linear"> -->
    <!-- 导航栏 -->
    <TopNavBar></TopNavBar>
    <!-- </transition> -->

    <div id="main-container">
      <div class="web-bg"></div>
      <canvas id="universe"></canvas>
      <router-view></router-view>
    </div>

    <!-- 回到顶部按钮 -->
    <div href="#" class="cd-top" v-show="!isMobile" @click="toTop()"></div>

    <div class="toolButton">
      <div
        class="backTop"
        v-show="isMobile && state.showToolButton"
        @click="toTop()"
      >
        <!-- 回到顶部按钮 -->
        <i class="fa fa-arrow-up"></i>
      </div>

      <div
        v-show="route.path === '/article' && isMobile"
        @click="changeTocStatus()"
      >
        <!-- 文章目录按钮 -->
        <el-icon><Operation /></el-icon>
      </div>

      <!-- 设置 -->
      <el-popover placement="left" :close-delay="500" trigger="hover">
        <template #reference>
          <div>
            <i class="fa fa-cog" aria-hidden="true"></i>
          </div>
        </template>
        <div class="my-setting">
          <div>
            <!-- 太阳按钮 -->
            <el-icon
              class="iconRotate"
              v-if="state.isDark"
              @click="changeColor()"
              ><Sunny
            /></el-icon>
            <!-- 月亮按钮 -->
            <el-icon v-else aria-hidden="true" @click="changeColor()"
              ><Moon
            /></el-icon>
          </div>
          <div>
            <el-icon @click="changeMouseAnimation()"><SwitchFilled /></el-icon>
          </div>
        </div>
      </el-popover>

      <!-- 点击动画 -->
      <canvas
        v-if="state.mouseAnimation"
        id="mousedown"
        style="
          position: fixed;
          left: 0;
          top: 0;
          pointer-events: none;
          z-index: 1000;
        "
      >
      </canvas>
    </div>

    <SideNavBar></SideNavBar>

    <Footer2></Footer2>
  </div>
</template>

<script setup lang="ts">
import TopNavBar from "@/components/layout/TopNavBar.vue";
import SideNavBar from "@/components/layout/SideNavBar.vue";
import Footer2 from "@/components/layout/Footer2.vue";
import { useConfig } from "@/stores/config";
import { storeToRefs } from "pinia";
import { onMounted, onBeforeUnmount, watch, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import mousedown from "@/utils/mousedown";
import blackstar from "@/utils/blackstar";

const router = useRouter();
const route = useRoute();
const storesConfig = useConfig();
const { isMobile } = storeToRefs(storesConfig);

const state = reactive({
  mouseAnimation: false,
  isDark: true,
  toolButton: false,
  showToolButton: false,
});

// methods
const changeColor = () => {
  state.isDark = !state.isDark;
  if (state.isDark) {
    document.documentElement.setAttribute("theme", "dark");
  } else {
    document.documentElement.setAttribute("theme", "light");
  }
};

const toTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
const changeTocStatus = () => {
  storesConfig.changeTocStatus();
};
const isDaylight = () => {
  let currDate = new Date();
  if (currDate.getHours() > 22 || currDate.getHours() < 7) {
    return false;
  } else {
    return true;
  }
};
const changeMouseAnimation = () => {
  state.mouseAnimation = !state.mouseAnimation;
  if (state.mouseAnimation) {
    nextTick(() => {
      mousedown();
    });
  }
};
const getCategories = () => {
  let Categories: Array<Category> = [
    {
      id: 1,
      categoryName: "生活倒影",
    },
    {
      id: 2,
      categoryName: "java",
    },
    {
      id: 3,
      categoryName: "python",
    },
    {
      id: 4,
      categoryName: "javascript",
    },
    {
      id: 5,
      categoryName: "c++",
    },
    {
      id: 6,
      categoryName: "php",
    },
    {
      id: 7,
      categoryName: "大数据",
    },
    {
      id: 8,
      categoryName: "spring boot",
    },
    {
      id: 9,
      categoryName: "redis",
    },
    {
      id: 10,
      categoryName: "MySQL",
    },
    {
      id: 11,
      categoryName: "nginx",
    },
    {
      id: 12,
      categoryName: "vue",
    },
  ];
  storesConfig.getCategories(Categories);
};
const getTags = () => {
  let Tags: Array<Tag> = [
    {
      id: 1,
      tagName: "生活倒影",
    },
    {
      id: 2,
      tagName: "java",
    },
    {
      id: 3,
      tagName: "python",
    },
    {
      id: 4,
      tagName: "javascript",
    },
    {
      id: 5,
      tagName: "c++",
    },
    {
      id: 6,
      tagName: "php",
    },
    {
      id: 7,
      tagName: "大数据",
    },
    {
      id: 8,
      tagName: "spring boot",
    },
    {
      id: 9,
      tagName: "redis",
    },
    {
      id: 10,
      tagName: "MySQL",
    },
    {
      id: 11,
      tagName: "nginx",
    },
    {
      id: 12,
      tagName: "vue",
    },
    {
      id: 13,
      tagName: "gpt",
    },
  ];
  storesConfig.getTags(Tags);
};

const createdMethod = () => {
  let toolbarStatus = {
    enter: false,
    visible: true,
  };
  storesConfig.changeToolbarStatus(toolbarStatus);

  isMobile.value = document.body.clientWidth <= 1000;

  window.addEventListener("resize", () => {
    let docWidth = document.body.clientWidth;
    isMobile.value = docWidth <= 1000;
  });

  getCategories();
  getTags();
};
createdMethod();
onMounted(() => {
  if (state.mouseAnimation) {
    mousedown();
  }
  window.addEventListener("scroll", storesConfig.onScrollPage);
  if (isDaylight()) {
    state.isDark = true;
  }
  if (state.isDark) {
    document.documentElement.setAttribute("theme", "dark");
  } else {
    document.documentElement.setAttribute("theme", "light");
  }
  blackstar.dark();
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", storesConfig.onScrollPage);
});
watch(
  () => storesConfig.scrollTop,
  (scrollTop, oldScrollTop) => {
    if (scrollTop < 30) {
      // root.style.setProperty("--translucent", "rgba(0, 0, 0, 0)");
    }
    //如果滑动距离超过屏幕高度三分之一视为进入页面，背景改为白色
    let enter = scrollTop > window.innerHeight / 2;
    const top = scrollTop - oldScrollTop < 0;
    let isShow = scrollTop - window.innerHeight > 30;
    state.toolButton = isShow;
    if (isShow && !isMobile.value) {
      if (window.innerHeight > 950) {
        $(".cd-top").css("top", "0");
      } else {
        $(".cd-top").css("top", window.innerHeight - 950 + "px");
      }
    } else if (!isShow && !isMobile.value) {
      $(".cd-top").css("top", "-900px");
    }
    if (isShow && isMobile.value) {
      state.showToolButton = true;
    }
    if (!isShow || !isMobile.value) {
      state.showToolButton = false;
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

<style lang="scss" scoped>
.web-bg {
  background: var(--backgroundImage);
  position: fixed;
  width: 100%;
  height: 100%;
  background-attachment: local;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}
#universe {
  position: fixed;
  margin: 0;
  padding: 0;
  border: 0;
  outline: 0;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.main-index {
  min-height: 100vh;
  background-color: var(--background);
  display: flex;
  flex-direction: column;
}
#main-container {
  -webkit-flex: 1 auto;
}
.my-setting {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  cursor: pointer;
  font-size: 20px;
  align-items: center;
}

.my-setting div {
  height: 20px;
}

.my-setting i:hover {
  color: var(--themeBackground);
}
.el-popper[x-placement^="bottom"] {
  margin-top: -8px;
}

.toolButton {
  width: 50px;
  position: fixed;
  right: 3vh;
  bottom: 3vh;
  animation: slide-bottom 0.5s ease-in-out both;
  z-index: 100;
  cursor: pointer;
  font-size: 25px;
}

.cd-top {
  background: var(--toTop) no-repeat center;
  position: fixed;
  right: 5vh;
  top: -900px;
  z-index: 99;
  width: 70px;
  height: 900px;
  background-size: contain;
  transition: all 0.5s ease-in-out;
  cursor: pointer;
}

.backTop {
  transition: all 0.3s ease-in;
  position: relative;
  top: 0;
  left: -1px;
}

.backTop:hover {
  top: -10px;
}

@media screen and (max-width: 400px) {
  .toolButton {
    right: 0.5vh;
  }
}
</style>
