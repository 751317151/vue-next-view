// 文章
export interface Article {
  id: number;
  articleTitle: string;
  articleContent: string;
  articleCover: string;
  createTime: string;
  updateTime?: string;
  viewCount: number;
  commentCount: number;
  likeCount: number;
  category?: string;
  categoryId?: number;
  tags?: string[];
  commentStatus?: boolean;
  userId?: number;
  isTop?: boolean;
}

// 分类
export interface Category {
  id: number;
  categoryName: string;
  articleCount?: number;
  description?: string;
}

// 标签
export interface Tag {
  id: number;
  tagName: string;
  articleCount?: number;
}

// 友链
export interface Friend {
  id: number;
  name: string;
  avatar: string;
  url: string;
  description: string;
}

// 网站信息
export interface WebInfo {
  webName: string;
  webTitle: string[];
  notices: string[];
  footer: string;
  backgroundImage: string;
  avatar: string;
}

// 留言
export interface Message {
  id: number;
  content: string;
  nickname: string;
  avatar: string;
  createTime: string;
}

// 归档
export interface Archive {
  year: string;
  list: Article[];
}

// 分页参数
export interface PageParams {
  page: number;
  size: number;
}

// 分页结果
export interface PageResult<T> {
  list: T[];
  total: number;
}

// 文章详情（包含上下篇和相关文章）
export interface ArticleDetail extends Article {
  content: string;
  wordCount: number;
  readingTime: number;
  prevArticle?: ArticleNav;
  nextArticle?: ArticleNav;
  recommendList: Article[];
}

// 文章导航（上一篇/下一篇）
export interface ArticleNav {
  id: number;
  articleTitle: string;
  articleCover: string;
}

// 评论
export interface Comment {
  id: number;
  content: string;
  nickname: string;
  email?: string;
  website?: string;
  avatar: string;
  createTime: string;
  likeCount: number;
  isLiked?: boolean;
  parentId?: number;
  replyTo?: string;
  children?: Comment[];
}

// API 响应
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
