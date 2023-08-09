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
        path: "/category",
        name: "category",
        component: () => import("@/views/category/Category.vue"),
        meta: { title: "分类" },
      },
      {
        path: "/favorite",
        name: "favorite",
        component: () => import("@/views/favorite/Favorite.vue"),
        meta: { title: "分类" },
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
