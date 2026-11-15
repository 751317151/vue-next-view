import { mockArticles, mockArticleContent } from '../../src/api/mock/article';
import { toSlug } from '../../src/utils/slug';
import { renderMarkdown } from './markdown';

export interface PublicArticleRecord {
  id: number;
  slug: string;
  articleTitle: string;
  articleContent: string;
  articleCover: string;
  createTime: string;
  category?: string;
  tags?: string[];
  content?: string;
  contentHtml?: string;
  updateTime?: string;
}

export const publicArticles = (): PublicArticleRecord[] => mockArticles.map((article) => ({
  ...article,
  slug: toSlug(article.articleTitle, `article-${article.id}`),
}));

export const findPublicArticle = (slug: string) => publicArticles().find((article) => article.slug === slug);

export const findPublicArticleBySlugOrId = (value: string) => publicArticles().find(
  (article) => article.slug === value || String(article.id) === value,
);

export const articleContent = mockArticleContent;
export const articleContentHtml = renderMarkdown(mockArticleContent);
