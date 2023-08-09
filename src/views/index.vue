<template>
  <div>
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
        <svg viewBox="0 0 1024 1024" width="50" height="50">
          <path
            d="M696.741825 447.714002c2.717387-214.485615-173.757803-312.227566-187.33574-320.371729-10.857551 5.430775-190.050127 103.168727-187.33274 320.371729-35.297037 24.435488-73.306463 65.1623-67.875688 135.752376 5.430775 70.589076 76.018851 119.460051 103.168726 116.745664 27.152875-2.716387 19.004713-21.7221 19.004713-21.7221l8.148162-38.011425s40.721814 59.732525 51.583363 59.732525h146.609927c13.574938 0 51.585363-59.732525 51.585363-59.732525l8.147162 38.011425s-8.147162 19.005713 19.004713 21.7221c27.148876 2.714388 97.738951-46.156588 103.168727-116.745664s-32.57965-111.316888-67.876688-135.752376z m-187.33574-2.713388c-5.426776 0-70.589076-2.717387-78.733239-78.737238 2.713388-73.306463 73.306463-78.733239 78.733239-81.450626 5.430775 0 76.02385 8.144163 78.736238 81.450626-8.143163 76.019851-73.305463 78.737238-78.736238 78.737238z m0 0"
            fill="#000000"
          ></path>
          <path
            d="M423.602441 746.060699c6.47054-6.297579 12.823107-7.017417 21.629121-2.784372 34.520213 16.582259 70.232157 19.645568 107.031855 9.116944 8.118169-2.323476 15.974396-5.475765 23.598677-9.22392 13.712907-6.73648 26.003134 0.8878 26.080116 16.13936 0.109975 22.574907-0.024994 45.142816 0.080982 67.709725 0.031993 7.464316-2.277486 13.322995-9.44387 16.608254-7.277358 3.333248-13.765895 1.961558-19.526595-3.264264-3.653176-3.313253-7.063407-6.897444-10.634601-10.304675-6.563519-6.259588-6.676494-6.25259-10.625603 1.603638-8.437097 16.80121-16.821205 33.623415-25.257302 50.423625-2.489438 4.953882-5.706713 9.196925-11.411426 10.775569-8.355115 2.315478-15.772442-1.070758-20.272427-9.867774-8.774021-17.15313-17.269104-34.453228-25.918153-51.669344-3.750154-7.469315-3.9891-7.479313-10.141712-1.514658-3.715162 3.602187-7.31435 7.326347-11.142486 10.800563-5.571743 5.060858-11.934308 6.269586-18.936728 3.207277-6.82746-2.984327-9.869774-8.483086-9.892769-15.685462-0.070984-23.506697-0.041991-47.018393-0.020995-70.532089 0.007998-4.679944 1.46467-8.785018 4.803916-11.538397z"
            fill="#000000"
          ></path>
        </svg>
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
  // element-plus 控制主题切换
  // if (!state.isDark) {
  //   document.documentElement.setAttribute("theme", "light");
  //   document.querySelector("html")?.classList.remove("dark");
  //   document.querySelector("html")?.classList.add("light");
  // } else {
  //   document.documentElement.setAttribute("theme", "dark");
  //   document.querySelector("html")?.classList.remove("light");
  //   document.querySelector("html")?.classList.add("dark");
  // }
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
  left: -13px;
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
