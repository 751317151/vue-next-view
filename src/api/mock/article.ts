import type { Article, Archive } from '@/types';

// 模拟文章数据
export const mockArticles: Article[] = [
  {
    id: 1,
    articleTitle: "Vue 3 + TypeScript 开发实战指南",
    articleContent: "Vue 3 带来了许多令人兴奋的新特性，包括 Composition API、更好的 TypeScript 支持、性能优化等。本文将详细介绍如何使用 Vue 3 和 TypeScript 构建现代化的前端应用，涵盖项目搭建、组件开发、状态管理等核心内容。",
    articleCover: "https://picsum.photos/800/400?random=1",
    createTime: "2024-12-28",
    viewCount: 1256,
    commentCount: 23,
    likeCount: 89,
    category: "前端开发",
    tags: ["Vue3", "TypeScript", "前端"],
  },
  {
    id: 2,
    articleTitle: "现代 CSS 布局技巧与最佳实践",
    articleContent: "CSS Grid 和 Flexbox 已经成为现代网页布局的标准工具。本文深入探讨了这两种布局方式的使用场景、技巧和最佳实践，帮助开发者创建更加灵活和响应式的网页布局。",
    articleCover: "https://picsum.photos/800/400?random=2",
    createTime: "2024-12-25",
    viewCount: 892,
    commentCount: 15,
    likeCount: 67,
    category: "前端开发",
    tags: ["CSS", "布局", "响应式"],
  },
  {
    id: 3,
    articleTitle: "JavaScript 异步编程深度解析",
    articleContent: "异步编程是 JavaScript 的核心概念之一。从回调函数到 Promise，再到 async/await，JavaScript 的异步处理方式不断演进。本文将系统性地介绍 JavaScript 异步编程的各种模式。",
    articleCover: "https://picsum.photos/800/400?random=3",
    createTime: "2024-12-22",
    viewCount: 1543,
    commentCount: 31,
    likeCount: 124,
    category: "JavaScript",
    tags: ["JavaScript", "异步编程", "Promise"],
  },
  {
    id: 4,
    articleTitle: "Node.js 性能优化实战经验分享",
    articleContent: "Node.js 在服务端开发中越来越受欢迎，但性能优化往往是开发者面临的挑战。本文基于实际项目经验，分享了 Node.js 应用的性能优化策略。",
    articleCover: "https://picsum.photos/800/400?random=4",
    createTime: "2024-12-20",
    viewCount: 756,
    commentCount: 18,
    likeCount: 52,
    category: "后端开发",
    tags: ["Node.js", "性能优化", "服务端"],
  },
  {
    id: 5,
    articleTitle: "设计模式在前端开发中的应用",
    articleContent: "设计模式是软件开发中的重要概念，在前端开发中同样有着广泛的应用。本文介绍了观察者模式、单例模式、工厂模式等常用设计模式在前端项目中的具体应用场景。",
    articleCover: "https://picsum.photos/800/400?random=5",
    createTime: "2024-12-18",
    viewCount: 634,
    commentCount: 12,
    likeCount: 43,
    category: "编程思想",
    tags: ["设计模式", "前端架构", "代码质量"],
  },
  {
    id: 6,
    articleTitle: "微前端架构设计与实践",
    articleContent: "随着前端应用规模的不断增长，微前端架构成为了解决大型前端项目复杂性的有效方案。本文详细介绍了微前端的核心概念、技术选型、架构设计以及在实际项目中的落地经验。",
    articleCover: "https://picsum.photos/800/400?random=6",
    createTime: "2024-12-15",
    viewCount: 987,
    commentCount: 25,
    likeCount: 78,
    category: "前端架构",
    tags: ["微前端", "架构设计", "团队协作"],
  },
  {
    id: 7,
    articleTitle: "Redis 缓存策略与实战",
    articleContent: "Redis 作为高性能的内存数据库，在缓存场景中有着广泛的应用。本文介绍了 Redis 的常用数据结构、缓存策略、以及在实际项目中的最佳实践。",
    articleCover: "https://picsum.photos/800/400?random=7",
    createTime: "2024-12-12",
    viewCount: 1123,
    commentCount: 19,
    likeCount: 95,
    category: "后端开发",
    tags: ["Redis", "缓存", "数据库"],
  },
  {
    id: 8,
    articleTitle: "Spring Boot 微服务实战",
    articleContent: "Spring Boot 是 Java 生态中最流行的微服务框架。本文从零开始，介绍如何使用 Spring Boot 构建微服务应用，包括服务注册、配置中心、网关等核心组件。",
    articleCover: "https://picsum.photos/800/400?random=8",
    createTime: "2024-12-10",
    viewCount: 2341,
    commentCount: 45,
    likeCount: 156,
    category: "Java",
    tags: ["Spring Boot", "微服务", "Java"],
  },
];

// 模拟文章详情内容
export const mockArticleContent = `# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite.

## 示例图片

![风景图片1](https://picsum.photos/800/600?random=1)

这是一张美丽的风景图片，展示了大自然的壮丽景色。

![风景图片2](https://picsum.photos/800/600?random=2)

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## Type Support For '.vue' Imports in TS

TypeScript cannot handle type information for '.vue' imports by default.

![代码示例](https://picsum.photos/800/400?random=3)

# 一级标题

这里是一些示例文本内容，用于展示文章的排版效果。

## 二级标题

更多的示例内容：

\`\`\`javascript
const greeting = 'Hello, World!';
console.log(greeting);
\`\`\`

### 三级标题

这是三级标题下的内容，展示了文章的层级结构。

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const user: User = {
  id: 1,
  name: 'BlackStar',
  email: 'test@example.com'
};
\`\`\`
`;

// 模拟归档数据
export const mockArchives: Archive[] = [
  {
    year: "2024",
    list: mockArticles.slice(0, 6),
  },
  {
    year: "2023",
    list: [
      {
        id: 9,
        articleTitle: "2023 年终总结",
        articleContent: "回顾 2023 年的技术成长与收获...",
        articleCover: "https://picsum.photos/800/400?random=9",
        createTime: "2023-12-31",
        viewCount: 567,
        commentCount: 12,
        likeCount: 45,
        category: "生活倒影",
        tags: ["年终总结"],
      },
    ],
  },
];
