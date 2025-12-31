/*
 * @Author: 华豪 huah@sunwayworld.com
 * @Date: 2024-07-18 10:28:47
 * @LastEditors: 华豪 huah@sunwayworld.com
 * @LastEditTime: 2024-09-29 15:05:12
 * @FilePath: \vue-next-view\src\router\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("@/views/index.vue"),
    redirect: "/",
    children: [
      {
        path: "/",
        name: "home",
        component: () => import("@/views/home/Home.vue"),
        meta: { title: "首页" },
      },
      {
        path: "/archive",
        name: "archive",
        component: () => import("@/views/archive/Archive.vue"),
        meta: { title: "归档" },
      },
      {
        path: "/categories",
        name: "categories",
        component: () => import("@/views/category/Categories.vue"),
        meta: { title: "分类" },
      },
      {
        path: "/categories/:id",
        name: "category",
        component: () => import("@/views/category/Category.vue"),
        meta: { title: "详细分类" },
      },
      {
        path: "/tags",
        name: "tags",
        component: () => import("@/views/tag/Tags.vue"),
        meta: { title: "标签" },
      },
      {
        path: "/tags/:id",
        name: "tag",
        component: () => import("@/views/tag/Tag.vue"),
        meta: { title: "详细标签" },
      },
      {
        path: "/article/:id",
        name: "article",
        component: () => import("@/views/article/Article.vue"),
        meta: { title: "文章详情" },
      },
      {
        path: "/favorite",
        name: "favorite",
        component: () => import("@/views/favorite/Favorite.vue"),
        meta: { title: "收藏" },
      },
      {
        path: "/travel",
        name: "travel",
        component: () => import("@/views/favorite/Travel.vue"),
        meta: { title: "旅途" },
      },
      {
        path: "/message",
        name: "message",
        component: () => import("@/views/message/Message.vue"),
        meta: { title: "留言" },
      },
      {
        path: "/about",
        name: "about",
        component: () => import("@/views/about/About.vue"),
        meta: { title: "关于" },
      },
      {
        path: "/friend",
        name: "friend",
        component: () => import("@/views/friend/Friend.vue"),
        meta: { title: "友人帐" },
      },
    ],
  },
];

const router = createRouter({
  // hash模式
  // history: createWebHashHistory(),
  history: createWebHistory(),
  routes: routes,
});

//挂载路由守卫
router.beforeEach((to, from, next) => {
  next();
});

export default router;
