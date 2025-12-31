<template>
  <transition name="el-fade-in-linear">
    <!-- 导航栏 -->
    <div
      @mouseenter="state.hoverEnter = true"
      @mouseleave="state.hoverEnter = false"
      :class="[
        { enter: toolbar.enter },
        { visible: toolbar.visible },
        { hoverEnter: state.hoverEnter && !toolbar.enter },
      ]"
      class="toolbar-content myBetween"
    >
      <!-- 网站名称 -->
      <div class="toolbar-title">
        <h2 @click="router.push({ path: '/' })">
          {{ webInfo.webName || "生活倒影" }}
        </h2>
      </div>

      <!-- 手机导航按钮 -->
      <div
        v-if="isMobile"
        class="toolbar-mobile-menu"
        @click="sideNavBarShow = !sideNavBarShow"
        :class="{ enter: toolbar.enter }"
      >
        <div class="menu-icon" :class="{ open: sideNavBarShow }">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <!-- 导航列表 -->
      <div v-else class="nav-content">
        <!-- 搜索框 -->
        <div class="search-section">
          <GlobalSearch />
        </div>
        
        <ul class="scroll-menu">
          <li @click="router.push({ path: '/' })">
            <div class="my-menu">🏡 <span>首页</span></div>
          </li>

          <!-- 文章 -->
          <li>
            <el-dropdown placement="bottom">
              <div class="my-menu">
                🏡 <span>文章</span>
                <i class="fa fa-chevron-down"></i>
              </div>
              <template #dropdown>
                <el-dropdown-menu style="font-size: 20px">
                  <el-dropdown-item @click="router.push({ path: '/archive' })">
                    <i class="fa fa-user-circle" aria-hidden="true"></i>
                    <span>归档</span>
                  </el-dropdown-item>
                  <el-dropdown-item
                    @click="router.push({ path: '/categories' })"
                  >
                    <i class="fa fa-sign-out" aria-hidden="true"></i>
                    <span>分类</span>
                  </el-dropdown-item>
                  <el-dropdown-item @click="router.push({ path: '/tags' })">
                    <i class="fa fa-sign-in" aria-hidden="true"></i>
                    <span>标签</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </li>

          <!-- 百宝箱 -->
          <li @click="router.push({ path: '/favorite' })">
            <div class="my-menu">🧰 <span>百宝箱</span></div>
          </li>
          <li @click="router.push({ path: '/travel' })">
            <div class="my-menu">🧰 <span>旅途</span></div>
          </li>

          <!-- 聊天室 -->
          <li @click="goIm()">
            <div class="my-menu">💬 <span>非礼勿言</span></div>
          </li>
          <!-- 音乐 -->
          <li @click="router.push({ path: '/funny' })">
            <div class="my-menu">🎺 <span>曲乐</span></div>
          </li>
          <!-- 留言 -->
          <li @click="router.push({ path: '/message' })">
            <div class="my-menu">📪 <span>留言</span></div>
          </li>
          <!-- 友人帐 -->
          <li @click="router.push({ path: '/friend' })">
            <div class="my-menu">💃 <span>友人帐</span></div>
          </li>

          <!-- 关于 -->
          <li @click="router.push({ path: '/about' })">
            <div class="my-menu">🐟 <span>关于</span></div>
          </li>
          <!-- 个人中心 -->
          <li>
            <el-dropdown placement="bottom">
              <el-avatar
                class="user-avatar"
                :size="36"
                style="margin-top: 12px"
                :src="webInfo.avatar"
              >
              </el-avatar>

              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    @click="router.push({ path: '/user' })"
                    v-if="true"
                  >
                    <i class="fa fa-user-circle" aria-hidden="true"></i>
                    <span>个人中心</span>
                  </el-dropdown-item>
                  <el-dropdown-item @click="logout()" v-if="true">
                    <i class="fa fa-sign-out" aria-hidden="true"></i>
                    <span>退出</span>
                  </el-dropdown-item>
                  <el-dropdown-item
                    @click="router.push({ path: '/user' })"
                    v-if="true"
                  >
                    <i class="fa fa-sign-in" aria-hidden="true"></i>
                    <span>登陆</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </li>
          

        </ul>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useConfig } from "@/stores/config";
import GlobalSearch from "@/components/common/GlobalSearch.vue";

const router = useRouter();
const storesConfig = useConfig();
const { toolbar, webInfo, sideNavBarShow, isMobile } =
  storeToRefs(storesConfig);

const state = reactive({
  hoverEnter: false,
  toolbar: { visible: true, enter: false },
});

// 跳转聊天室
const goIm = () => {
  // 这里可以添加跳转到聊天室的逻辑
  console.log('跳转到聊天室');
};

// 退出登录
const logout = () => {
  // 这里可以添加退出登录的逻辑
  console.log('退出登录');
};
</script>

<style lang="scss" scoped>
.toolbar-content {
  // background: var(--translucent);
  width: 100%;
  height: 60px;
  color: var(--toolbarFont);
  /* 固定位置，不随滚动条滚动 */
  position: fixed;
  z-index: 100;
  /* 禁止选中文字 */
  user-select: none;

  top: -60px;
  transition: transform 0.2s ease-in-out, opacity 0.2s ease-in-out;
}

.toolbar-content.visible {
  transform: translate3d(0, 100%, 0);
}
.toolbar-content.enter {
  background: var(--translucent);
  color: var(--toolbarFont);
  box-shadow: 0 1px 3px 0 rgba(0, 34, 77, 0.05);
}

.toolbar-content.hoverEnter {
  background: var(--translucent);
  box-shadow: 0 1px 3px 0 rgba(0, 34, 77, 0.05);
}

.toolbar-title {
  margin-left: 30px;
  cursor: pointer;
}

.nav-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-section {
  max-width: 300px;
  min-width: 200px;
}

.toolbar-mobile-menu {
  margin-right: 15px;
  cursor: pointer;
  padding: 8px;
  
  .menu-icon {
    width: 24px;
    height: 18px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    span {
      display: block;
      width: 100%;
      height: 2px;
      background: var(--toolbarFont);
      border-radius: 2px;
      transition: all 0.3s ease;
      transform-origin: center;
    }
    
    &.open {
      span:nth-child(1) {
        transform: translateY(8px) rotate(45deg);
      }
      span:nth-child(2) {
        opacity: 0;
        transform: scaleX(0);
      }
      span:nth-child(3) {
        transform: translateY(-8px) rotate(-45deg);
      }
    }
  }
}

.scroll-menu {
  margin: 0 25px 0 0;
  display: flex;
  justify-content: flex-end;
  padding: 0;
}

.scroll-menu > li {
  list-style: none;
  margin: 0 12px;
  font-size: 17px;
  height: 60px;
  line-height: 60px;
  position: relative;
  cursor: pointer;
}
.scroll-menu > li > div {
  list-style: none;
  font-size: 17px;
  height: 60px;
  line-height: 60px;
  position: relative;
  cursor: pointer;
}
.my-menu {
  outline: 0;
  i {
    padding: 4px;
  }
}

:global(.el-dropdown-menu__item) {
  font-size: 20px;
}
.scroll-menu > li:hover .my-menu span {
  color: var(--themeBackground);
}

.scroll-menu > li:hover .my-menu i {
  color: var(--themeBackground);
  animation: scale 1.5s ease-in-out infinite;
}

.scroll-menu > li .my-menu:after {
  content: "";
  display: block;
  position: absolute;
  bottom: 0;
  height: 6px;
  background-color: var(--themeBackground);
  width: 100%;
  max-width: 0;
  transition: max-width 0.25s ease-in-out;
}

.scroll-menu > li:hover .my-menu:after {
  max-width: 100%;
}
.el-dropdown {
  font-size: unset;
  color: unset;
}

.el-dropdown-menu {
  padding: 5px 0;
}

.el-dropdown_menu .el-dropdown-menu__item {
  font-size: 20px;
}
.el-scrollbar {
  .el-dropdown-menu__item {
    font-size: 20px;
  }
}

.el-dropdown-menu__item {
  font-size: unset;
}

.el-dropdown-menu__item:hover {
  background-color: var(--white);
  color: var(--themeBackground);
}
</style>
