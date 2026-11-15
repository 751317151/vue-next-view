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
