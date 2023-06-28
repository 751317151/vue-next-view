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
