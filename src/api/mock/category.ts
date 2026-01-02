import type { Category, Tag } from '@/types';

// 模拟分类数据
export const mockCategories: Category[] = [
  { id: 1, categoryName: "生活倒影", articleCount: 5 },
  { id: 2, categoryName: "Java", articleCount: 12 },
  { id: 3, categoryName: "Python", articleCount: 8 },
  { id: 4, categoryName: "JavaScript", articleCount: 15 },
  { id: 5, categoryName: "前端开发", articleCount: 20 },
  { id: 6, categoryName: "后端开发", articleCount: 10 },
  { id: 7, categoryName: "大数据", articleCount: 6 },
  { id: 8, categoryName: "Spring Boot", articleCount: 9 },
  { id: 9, categoryName: "Redis", articleCount: 4 },
  { id: 10, categoryName: "MySQL", articleCount: 7 },
  { id: 11, categoryName: "Nginx", articleCount: 3 },
  { id: 12, categoryName: "Vue", articleCount: 11 },
];

// 模拟标签数据
export const mockTags: Tag[] = [
  { id: 1, tagName: "Vue3", articleCount: 8 },
  { id: 2, tagName: "TypeScript", articleCount: 6 },
  { id: 3, tagName: "JavaScript", articleCount: 12 },
  { id: 4, tagName: "CSS", articleCount: 5 },
  { id: 5, tagName: "Node.js", articleCount: 4 },
  { id: 6, tagName: "Spring Boot", articleCount: 7 },
  { id: 7, tagName: "Redis", articleCount: 3 },
  { id: 8, tagName: "MySQL", articleCount: 5 },
  { id: 9, tagName: "Docker", articleCount: 2 },
  { id: 10, tagName: "微服务", articleCount: 4 },
  { id: 11, tagName: "设计模式", articleCount: 3 },
  { id: 12, tagName: "性能优化", articleCount: 6 },
  { id: 13, tagName: "GPT", articleCount: 2 },
];
