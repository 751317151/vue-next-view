import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("@/views/index.vue"),
    redirect: "/home",
    children: [
      {
        path: "/home",
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
        path: "/category",
        name: "category",
        component: () => import("@/views/category/Category.vue"),
        meta: { title: "分类" },
      },
      {
        path: "/article",
        name: "Article",
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
