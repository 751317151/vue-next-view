export interface PublicArticle {
  id: number;
  slug: string;
  articleTitle: string;
  articleContent: string;
  articleCover: string;
  content?: string;
  contentHtml?: string;
  recommendations?: Array<Pick<PublicArticle, 'id' | 'slug' | 'articleTitle' | 'articleCover' | 'createTime' | 'category'>>;
  /** 相邻文章，用于文章页的上一篇 / 下一篇。 */
  neighbours?: {
    previous?: Pick<PublicArticle, 'id' | 'slug' | 'articleTitle' | 'articleCover' | 'createTime' | 'category'> | null;
    next?: Pick<PublicArticle, 'id' | 'slug' | 'articleTitle' | 'articleCover' | 'createTime' | 'category'> | null;
  };
  createTime: string;
  updateTime?: string;
  category?: string;
  tags?: string[];
  /** 一句话摘要，来自 frontmatter 的 summary/description，缺省时由正文首段提取。 */
  summary?: string;
}

export interface PublicCategory {
  id: number;
  slug: string;
  categoryName: string;
  articleCount?: number;
  description?: string;
}

export interface PublicTag {
  id: number;
  slug: string;
  tagName: string;
  articleCount?: number;
}

export interface PublicSearchResult {
  id: number;
  slug: string;
  articleTitle: string;
  articleContent: string;
  category?: string;
  createTime: string;
}

/** 微光：比文章更轻的日常记录，必须能一眼读完。 */
export interface PublicGlint {
  id: number;
  slug: string;
  title: string;
  body: string;
  summary: string;
  text: string;
  html: string;
  date: string;
  emoji: string;
}
