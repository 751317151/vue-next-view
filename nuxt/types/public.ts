export interface PublicArticle {
  id: number;
  slug: string;
  articleTitle: string;
  articleContent: string;
  articleCover: string;
  content?: string;
  contentHtml?: string;
  recommendations?: Array<Pick<PublicArticle, 'id' | 'slug' | 'articleTitle' | 'articleCover' | 'createTime' | 'category'>>;
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
