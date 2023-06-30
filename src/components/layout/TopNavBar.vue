<template>
  <!-- 导航栏 -->
  <div
    v-show="toolbar.visible"
    @mouseenter="state.hoverEnter = true"
    @mouseleave="state.hoverEnter = false"
    :class="[
      { enter: toolbar.enter },
      {
        hoverEnter:
          (state.hoverEnter || route.path === '/favorite') && !toolbar.enter,
      },
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
      <el-icon><Operation /></el-icon>
    </div>
    <!-- 导航列表 -->
    <div v-else>
      <ul class="scroll-menu">
        <li @click="router.push({ path: '/' })">
          <div class="my-menu">🏡 <span>首页</span></div>
        </li>

        <!--            <li v-for="(menu, index) in $store.getters.navigationBar"-->
        <!--                @click="router.push({path: '/sort', query: {sortId: menu.id, labelId: menu.labels[0].id}})"-->
        <!--                :key="index">-->
        <!--              <div class="my-menu">-->
        <!--                📒 <span>{{ menu.sortName }}</span>-->
        <!--              </div>-->
        <!--            </li>-->

        <!-- 爱情买卖 -->
        <li @click="router.push({ path: '/love' })">
          <div class="my-menu">💋 <span>爱情买卖</span></div>
        </li>

        <!-- 百宝箱 -->
        <li @click="router.push({ path: '/favorite' })">
          <div class="my-menu">🧰 <span>百宝箱</span></div>
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
        <!-- <li>
          <el-dropdown placement="bottom">
            <el-avatar
              class="user-avatar"
              :size="36"
              style="margin-top: 12px"
              :src="webInfo.avatar"
            >
            </el-avatar>

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
          </el-dropdown>
        </li> -->
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useConfig } from "@/stores/config";
import common from "@/utils/common";

const router = useRouter();
const route = useRoute();
const storesConfig = useConfig();
const { toolbar, webInfo, sideNavBarShow, isMobile } =
  storeToRefs(storesConfig);

const state = reactive({
  hoverEnter: false,
});
</script>

<style lang="scss" scoped>
.toolbar-content {
  width: 100%;
  height: 60px;
  color: var(--white);
  /* 固定位置，不随滚动条滚动 */
  position: fixed;
  z-index: 100;
  /* 禁止选中文字 */
  user-select: none;
  transition: all 0.3s ease-in-out;
}

.toolbar-content.enter {
  background: var(--toolbarBackground);
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

.toolbar-mobile-menu {
  font-size: 30px;
  margin-right: 15px;
  cursor: pointer;
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

.el-dropdown-menu__item {
  font-size: unset;
}

.el-dropdown-menu__item:hover {
  background-color: var(--white);
  color: var(--themeBackground);
}
</style>
