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
  /** 一句话摘要。frontmatter 里写 `description` 或 `summary` 时填入，缺省则按正文自动提取。 */
  summary?: string;
  recommendations?: PublicArticleSummary[];
}

export type PublicArticleSummary = Omit<PublicArticleRecord, 'articleContent' | 'recommendations'>;

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
