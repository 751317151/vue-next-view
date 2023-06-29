<template>
  <el-drawer
    v-model="sideNavBarShow"
    :show-close="false"
    size="65%"
    custom-class="toolbarDrawer"
    :with-header="false"
    direction="ltr"
  >
    <div>
      <el-avatar
        style="margin-top: 20px"
        class="user-avatar"
        :size="120"
        src="https://file.poetize.cn/webAvatar/Sara116383637867956"
      ></el-avatar>
      <div class="web-name">hush</div>
      <div class="web-info">
        <div class="blog-info-box">
          <span>文章</span>
          <span class="blog-info-num">22</span>
        </div>
        <div class="blog-info-box">
          <span>分类</span>
          <span class="blog-info-num">22</span>
        </div>
      </div>
      <a class="collection-btn" @click="showTip()">
        <i class="el-icon-star-off" style="margin-right: 2px"></i>朋友圈
      </a>
    </div>
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

<style></style>
