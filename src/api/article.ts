import type { Article, PageParams, PageResult, Archive } from '@/types';
import { mockArticles, mockArticleContent, mockArchives } from './mock/article';

// 模拟延迟
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 获取文章列表
 */
export async function getArticleList(params: PageParams & { categoryId?: number; tagId?: number }): Promise<PageResult<Article>> {
  await delay();

  let list = [...mockArticles];

  // 按分类筛选
  if (params.categoryId) {
    list = list.filter(item => item.categoryId === params.categoryId);
  }

  // 按标签筛选
  if (params.tagId) {
    // 简单模拟，实际应该根据标签ID筛选
    list = list.filter(item => item.tags && item.tags.length > 0);
  }

  const start = (params.page - 1) * params.size;
  const end = start + params.size;

  return {
    list: list.slice(start, end),
    total: list.length,
  };
}

/**
 * 获取文章详情
 */
export async function getArticleDetail(id: number): Promise<Article & { content: string }> {
  await delay();

  const article = mockArticles.find(item => item.id === id) || mockArticles[0];

  return {
    ...article,
    content: mockArticleContent,
    commentStatus: true,
  };
}

/**
 * 获取推荐文章
 */
export async function getRecommendArticles(limit: number = 6): Promise<Article[]> {
  await delay(200);
  return mockArticles.slice(0, limit);
}

/**
 * 获取文章归档
 */
export async function getArticleArchive(): Promise<Archive[]> {
  await delay();
  return mockArchives;
}

/**
 * 搜索文章
 */
export async function searchArticles(keyword: string): Promise<Article[]> {
  await delay(200);

  if (!keyword.trim()) return [];

  const lowerKeyword = keyword.toLowerCase();
  return mockArticles.filter(
    item =>
      item.articleTitle.toLowerCase().includes(lowerKeyword) ||
      item.articleContent.toLowerCase().includes(lowerKeyword)
  );
}
