<template>
  <el-drawer
    v-model="sideNavBarShow"
    :show-close="false"
    size="65%"
    custom-class="toolbarDrawer"
    :with-header="false"
    direction="ltr"
  >
    <div class="nav-info">
      <el-avatar
        class="user-avatar"
        :size="120"
        src="https://haiyong.site/img/favicon.png"
      ></el-avatar>
      <!-- <div class="web-name">hush</div> -->
      <div class="web-info">
        <div class="blog-info-box">
          <div>文章</div>
          <div class="blog-info-num">22</div>
        </div>
        <div class="blog-info-box">
          <div>分类</div>
          <div class="blog-info-num">22</div>
        </div>
        <div class="blog-info-box">
          <div>标签</div>
          <div class="blog-info-num">22</div>
        </div>
      </div>
    </div>
    <hr />
    <div>
      <el-row class="tac">
        <el-col>
          <el-menu
            active-text-color="#ffd04b"
            background-color="transparent"
            class="el-menu-vertical-demo"
            text-color="#fff"
          >
            <el-menu-item index="/" @click="smallMenu({ path: '/' })">
              <div>🏡 <span>首页</span></div>
            </el-menu-item>
            <el-sub-menu index="/article">
              <template #title>
                <div>🏡 <span>文章</span></div>
              </template>
              <el-menu-item
                index="/archive"
                @click="smallMenu({ path: '/archive' })"
              >
                <div>🧰 <span>归档</span></div>
              </el-menu-item>
              <el-menu-item
                index="/category"
                @click="smallMenu({ path: '/category' })"
              >
                <div>🧰 <span>分类</span></div>
              </el-menu-item>
              <el-menu-item index="/tag">
                <div>🧰 <span>标签</span></div>
              </el-menu-item>
            </el-sub-menu>

            <el-menu-item
              index="/favorite"
              @click="smallMenu({ path: '/favorite' })"
            >
              <div>🧰 <span>百宝箱</span></div>
            </el-menu-item>
            <el-menu-item index="3">
              <div>💬 <span>非礼勿言</span></div>
            </el-menu-item>
            <el-menu-item index="/funny">
              <div>🎺 <span>曲乐</span></div>
            </el-menu-item>
            <el-menu-item index="/message">
              <div>📪 <span>留言</span></div>
            </el-menu-item>
            <el-menu-item index="/friend">
              <div>💃 <span>友人帐</span></div>
            </el-menu-item>
            <el-menu-item index="/about">
              <div>🐟 <span>关于</span></div>
            </el-menu-item>
          </el-menu>
        </el-col>
      </el-row>
    </div>
  </el-drawer>
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
const { sideNavBarShow } = storeToRefs(storesConfig);

const state = reactive({});

const smallMenu = (path) => {
  router.push(path);
  sideNavBarShow.value = false;
};
const smallMenuLogout = () => {
  sideNavBarShow.value = false;
};
</script>

<style lang="scss" scoped>
.el-menu-item,
.el-sub-menu__title {
  font-size: 20px;
}
:global(.el-sub-menu__title) {
  font-size: 20px;
}
.el-menu {
  border-right: 0;
  background-color: transparent;
}

.nav-info {
  text-align: center;
  color: var(--lightYellow);
}
.web-info {
  display: table;
  width: 100%;
  table-layout: fixed;
}
.web-info > div {
  display: table-cell;
}
hr {
  border: 2px dashed var(--high-trans-color) !important;
}
hr:before {
  color: var(--theme-color) !important;
}
hr::before {
  position: absolute;
  top: -10px;
  left: 5%;
  z-index: 1;
  color: var(--hr-before-color);
  content: "\f2dc";
  font-size: 20px;
  line-height: 1;
  -webkit-transition: all 1s ease-in-out;
  -moz-transition: all 1s ease-in-out;
  -o-transition: all 1s ease-in-out;
  -ms-transition: all 1s ease-in-out;
  transition: all 1s ease-in-out;
  font-family: "Font Awesome 6 Free";
}
</style>
