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
        path: "/article",
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
