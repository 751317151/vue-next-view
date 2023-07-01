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
      <ul class="small-menu">
        <li @click="smallMenu({ path: '/' })">
          <div>🏡 <span>首页</span></div>
        </li>

        <!--          <li v-for="(menu, index) in $store.getters.navigationBar"-->
        <!--              @click="smallMenu({path: '/sort', query: {sortId: menu.id, labelId: menu.labels[0].id}})"-->
        <!--              :key="index">-->
        <!--            <div>-->
        <!--              📒 <span>{{ menu.sortName }}</span>-->
        <!--            </div>-->
        <!--          </li>-->

        <!-- 爱情买卖 -->
        <li @click="smallMenu({ path: '/love' })">
          <div>💋 <span>爱情买卖</span></div>
        </li>

        <!-- 百宝箱 -->
        <li @click="smallMenu({ path: '/favorite' })">
          <div>🧰 <span>百宝箱</span></div>
        </li>

        <!-- 聊天室 -->
        <li @click="goIm()">
          <div>💬 <span>非礼勿言</span></div>
        </li>
        <!-- 音乐 -->
        <li @click="smallMenu({ path: '/funny' })">
          <div>🎺 <span>曲乐</span></div>
        </li>
        <!-- 留言 -->
        <li @click="smallMenu({ path: '/message' })">
          <div>📪 <span>留言</span></div>
        </li>
        <!-- 友人帐 -->
        <li @click="smallMenu({ path: '/friend' })">
          <div>💃 <span>友人帐</span></div>
        </li>

        <!-- 关于 -->
        <li @click="smallMenu({ path: '/about' })">
          <div>🐟 <span>关于</span></div>
        </li>

        <template v-if="common.isEmpty()">
          <li @click="smallMenu({ path: '/user' })">
            <div>
              <i class="fa fa-sign-in" aria-hidden="true"></i>
              <span>&nbsp;登录</span>
            </div>
          </li>
        </template>
        <template v-else>
          <li @click="smallMenu({ path: '/user' })">
            <div>
              <i class="fa fa-user-circle" aria-hidden="true"></i>
              <span>&nbsp;个人中心</span>
            </div>
          </li>
          <li @click="smallMenuLogout()">
            <div>
              <i class="fa fa-sign-out" aria-hidden="true"></i>
              <span>&nbsp;退出</span>
            </div>
          </li>
        </template>
      </ul>
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
  //   router.push(path);
  sideNavBarShow.value = false;
};
const smallMenuLogout = () => {
  sideNavBarShow.value = false;
};
</script>

<style scoped>
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
