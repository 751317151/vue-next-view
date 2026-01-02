import type { Article, ArticleDetail, PageParams, PageResult, Archive, Comment } from '@/types';
import { mockArticles, mockArticleContent, mockArchives } from './mock/article';

// 模拟延迟
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 计算文章字数
 */
const calculateWordCount = (content: string): number => {
  // 移除 Markdown 语法标记
  const text = content
    .replace(/```[\s\S]*?```/g, '') // 代码块
    .replace(/`[^`]+`/g, '') // 行内代码
    .replace(/!\[.*?\]\(.*?\)/g, '') // 图片
    .replace(/\[.*?\]\(.*?\)/g, '') // 链接
    .replace(/[#*_~>`-]/g, '') // Markdown 符号
    .replace(/\s+/g, ''); // 空白字符

  return text.length;
};

/**
 * 计算阅读时间（分钟）
 */
const calculateReadingTime = (wordCount: number): number => {
  // 假设每分钟阅读 300 字
  const minutes = Math.ceil(wordCount / 300);
  return Math.max(1, minutes);
};

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
export async function getArticleDetail(id: number): Promise<ArticleDetail> {
  await delay();

  const articleIndex = mockArticles.findIndex(item => item.id === id);
  const article = articleIndex !== -1 ? mockArticles[articleIndex] : mockArticles[0];

  // 获取上一篇和下一篇
  const prevArticle = articleIndex > 0
    ? {
      id: mockArticles[articleIndex - 1].id,
      articleTitle: mockArticles[articleIndex - 1].articleTitle,
      articleCover: mockArticles[articleIndex - 1].articleCover,
    }
    : undefined;

  const nextArticle = articleIndex < mockArticles.length - 1
    ? {
      id: mockArticles[articleIndex + 1].id,
      articleTitle: mockArticles[articleIndex + 1].articleTitle,
      articleCover: mockArticles[articleIndex + 1].articleCover,
    }
    : undefined;

  // 获取推荐文章（排除当前文章，取最多6篇）
  const recommendList = mockArticles
    .filter(item => item.id !== id)
    .slice(0, 6);

  // 计算字数和阅读时间
  const wordCount = calculateWordCount(mockArticleContent);
  const readingTime = calculateReadingTime(wordCount);

  return {
    ...article,
    content: mockArticleContent,
    wordCount,
    readingTime,
    commentStatus: true,
    updateTime: article.createTime, // 模拟更新时间
    prevArticle,
    nextArticle,
    recommendList,
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

// ============ 评论相关 API ============

// Mock 评论数据
const mockComments: Comment[] = [
  {
    id: 1,
    content: '这篇文章写得非常详细，对我帮助很大！感谢分享 🎉',
    nickname: '技术爱好者',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    createTime: '2024-12-28 10:30:00',
    likeCount: 15,
    isLiked: false,
    children: [
      {
        id: 2,
        content: '同感！作者写得很用心',
        nickname: '前端小白',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
        createTime: '2024-12-28 11:20:00',
        likeCount: 3,
        isLiked: false,
        parentId: 1,
        replyTo: '技术爱好者',
      },
    ],
  },
  {
    id: 3,
    content: '请问 TypeScript 的类型推导有什么技巧吗？',
    nickname: 'JS开发者',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    createTime: '2024-12-27 15:45:00',
    likeCount: 8,
    isLiked: false,
    children: [],
  },
  {
    id: 4,
    content: '代码示例很清晰，收藏了 👍',
    nickname: '学习者',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
    createTime: '2024-12-26 09:10:00',
    likeCount: 12,
    isLiked: false,
    children: [],
  },
];

/**
 * 获取文章评论
 */
export async function getArticleComments(articleId: number): Promise<Comment[]> {
  await delay(300);
  return mockComments;
}

/**
 * 提交评论
 */
export async function submitComment(data: {
  articleId: number;
  content: string;
  nickname: string;
  email?: string;
  website?: string;
  parentId?: number;
  replyTo?: string;
}): Promise<Comment> {
  await delay(500);

  const newComment: Comment = {
    id: Date.now(),
    content: data.content,
    nickname: data.nickname,
    email: data.email,
    website: data.website,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
    createTime: new Date().toLocaleString(),
    likeCount: 0,
    isLiked: false,
    parentId: data.parentId,
    replyTo: data.replyTo,
    children: [],
  };

  return newComment;
}

/**
 * 点赞评论
 */
export async function likeComment(commentId: number): Promise<{ success: boolean; likeCount: number }> {
  await delay(200);
  return { success: true, likeCount: Math.floor(Math.random() * 20) + 1 };
}

/**
 * 文章点赞
 */
export async function likeArticle(articleId: number): Promise<{ success: boolean; likeCount: number }> {
  await delay(200);
  const article = mockArticles.find(a => a.id === articleId);
  const newCount = (article?.likeCount || 0) + 1;
  return { success: true, likeCount: newCount };
}
