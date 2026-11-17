---
title: 从 Options API 到 Composition API：我把项目重构成这样
category: 前端开发
tags: [Vue3, TypeScript, 组合式函数]
date: 2024-03-12
updatedAt: 2024-04-02
---

把一个跑了三年的 Options API 项目迁移到 Composition API，最难的不是语法，而是决定"状态放哪里"。这篇记录我最终沉淀下来的三条原则。

## 一、按业务域拆分组合式函数

不要一上来就建一个 `useEverything.js`。状态应该跟着业务域走：

```ts
// stores/article.ts
export const useArticleStore = defineStore('article', () => {
  const article = ref<Article | null>(null);
  const loading = ref(false);

  const load = async (slug: string) => {
    loading.value = true;
    try {
      article.value = await fetchArticle(slug);
    } finally {
      loading.value = false;
    }
  };

  return { article, loading, load };
});
```

## 二、副作用的清理比创建更重要

迁移之后最容易遗漏的是 `watchEffect`、事件监听和定时器的清理。组合式函数里养成的习惯是：谁创建，谁返回清理函数，组件卸载时统一回收。

- `useSwipe` 里移除 `touchmove` 监听
- `useTypewriter` 里清掉 `setTimeout`
- 全局键盘事件统一走一个 composable

## 三、类型从返回值推导，而不是反过来

组合式函数返回一个大对象时，让 TypeScript 自己推导，调用方就能拿到完整的类型。只有对外发布的函数才需要显式标注返回类型。

> 重构的终点不是"语法变新了"，而是每个状态都有了明确的归属。这个项目迁完之后，新增一个页面的心智负担明显变小了。

如果你也在做类似迁移，建议一次迁一个模块，跑通再迁下一个。
