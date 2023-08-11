<template>
  <div class="main-index">
    <!-- el过渡动画 -->
    <transition name="el-fade-in-linear">
      <!-- 导航栏 -->
      <TopNavBar></TopNavBar>
    </transition>

    <div id="main-container">
      <router-view></router-view>
    </div>

    <!-- 回到顶部按钮 -->
    <div href="#" class="cd-top" v-if="!isMobile" @click="toTop()"></div>

    <div class="toolButton">
      <div class="backTop" v-if="isMobile && state.toolButton" @click="toTop()">
        <!-- 回到顶部按钮 -->
        <i class="fa fa-arrow-up"></i>
      </div>

      <!-- 设置 -->
      <el-popover placement="left" :close-delay="500" trigger="hover">
        <template #reference>
          <div>
            <i class="fa fa-cog iconRotate" aria-hidden="true"></i>
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

    <Footer></Footer>
  </div>
</template>

<script setup lang="ts">
import TopNavBar from "@/components/layout/TopNavBar.vue";
import SideNavBar from "@/components/layout/SideNavBar.vue";
import Footer from "@/components/layout/Footer.vue";
import { useConfig } from "@/stores/config";
import { storeToRefs } from "pinia";
import { onMounted, onBeforeUnmount, watch, reactive } from "vue";
import mousedown from "@/utils/mousedown";

const storesConfig = useConfig();
const { isMobile } = storeToRefs(storesConfig);

const state = reactive({
  mouseAnimation: false,
  isDark: false,
  toolButton: false,
});

// methods
const changeColor = () => {
  state.isDark = !state.isDark;
  let root = document.querySelector(":root");

  if (state.isDark) {
    root.style.setProperty("--background", "#272727");
    root.style.setProperty("--fontColor", "white");
    root.style.setProperty("--borderColor", "#4F4F4F");
    root.style.setProperty("--borderHoverColor", "black");
    root.style.setProperty("--articleFontColor", "#E4E4E4");
    root.style.setProperty("--articleGreyFontColor", "#D4D4D4");
    root.style.setProperty("--commentContent", "#D4D4D4");
    root.style.setProperty("--favoriteBg", "#1e1e1e");
  } else {
    root.style.setProperty("--background", "white");
    root.style.setProperty("--fontColor", "black");
    root.style.setProperty("--borderColor", "rgba(0, 0, 0, 0.5)");
    root.style.setProperty("--borderHoverColor", "rgba(110, 110, 110, 0.4)");
    root.style.setProperty("--articleFontColor", "#1F1F1F");
    root.style.setProperty("--articleGreyFontColor", "#616161");
    root.style.setProperty("--commentContent", "#F7F9FE");
    root.style.setProperty("--favoriteBg", "#f7f9fe");
  }
};

const toTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
const isDaylight = () => {
  let currDate = new Date();
  if (currDate.getHours() > 22 || currDate.getHours() < 7) {
    return true;
  } else {
    return false;
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
const getSortInfo = () => {
  let sortInfo = [
    {
      id: 2,
      sortName: "生活倒影",
      sortDescription: "记录美好生活",
      sortType: 0,
      priority: 1,
      countOfSort: 3,
      labels: [
        {
          id: 6,
          sortId: 2,
          labelName: "被偷走的那几年",
          labelDescription: "被偷走的那几年",
          countOfLabel: 3,
        },
      ],
    },
    {
      id: 3,
      sortName: "学习人生",
      sortDescription: "学到老，活到老",
      sortType: 1,
      priority: 4,
      countOfSort: 5,
      labels: [
        {
          id: 5,
          sortId: 3,
          labelName: "工作经验",
          labelDescription: "工作经验",
          countOfLabel: 0,
        },
        {
          id: 8,
          sortId: 3,
          labelName: "Java基础",
          labelDescription: "Java基础",
          countOfLabel: 3,
        },
        {
          id: 15,
          sortId: 3,
          labelName: "大数据",
          labelDescription: "大数据",
          countOfLabel: 2,
        },
      ],
    },
    {
      id: 4,
      sortName: "寻国记",
      sortDescription: "你看这世界多奇妙",
      sortType: 1,
      priority: 3,
      countOfSort: 3,
      labels: [
        {
          id: 11,
          sortId: 4,
          labelName: "俄罗斯与乌克兰",
          labelDescription: "俄罗斯与乌克兰",
          countOfLabel: 3,
        },
      ],
    },
    {
      id: 5,
      sortName: "视听盛宴",
      sortDescription: "听音乐，看书，看电影",
      sortType: 1,
      priority: 2,
      countOfSort: 3,
      labels: [
        {
          id: 12,
          sortId: 5,
          labelName: "电影最TOP",
          labelDescription: "电影最TOP",
          countOfLabel: 0,
        },
        {
          id: 13,
          sortId: 5,
          labelName: "动漫最TOP",
          labelDescription: "动漫最TOP",
          countOfLabel: 2,
        },
        {
          id: 14,
          sortId: 5,
          labelName: "万卷书",
          labelDescription: "万卷书",
          countOfLabel: 1,
        },
      ],
    },
  ];
  storesConfig.loadSortInfo(sortInfo);
};

const createdMethod = () => {
  let toolbarStatus = {
    enter: false,
    visible: true,
  };
  storesConfig.changeToolbarStatus(toolbarStatus);

  isMobile.value = document.body.clientWidth < 1100;

  window.addEventListener("resize", () => {
    let docWidth = document.body.clientWidth;
    isMobile.value = docWidth < 1100;
  });
  getSortInfo();
};
createdMethod();
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
    if (isShow && !isMobile.value) {
      if (window.innerHeight > 950) {
        $(".cd-top").css("top", "0");
      } else {
        $(".cd-top").css("top", window.innerHeight - 950 + "px");
      }
    } else if (!isShow && !isMobile.value) {
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

<style lang="scss" scoped>
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
