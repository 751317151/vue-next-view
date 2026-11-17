import { listContentArticles } from '../utils/content-articles';
import { publicArticles, type PublicArticleRecord } from '../utils/public-articles';
import { renderMarkdown } from '../utils/markdown';

export interface ArticleRepository {
  list(): Promise<PublicArticleRecord[]>;
  findBySlugOrId(value: string): Promise<PublicArticleRecord | undefined>;
}

/**
 * Reads markdown articles from `content/articles/` (bundled via Nitro
 * serverAssets). Falls back to the seeded mock list when the content folder is
 * empty, so fresh clones still render a complete site.
 */
export const articleRepository: ArticleRepository = {
  async list() {
    const contentArticles = await listContentArticles();
    if (contentArticles.length > 0) return contentArticles;
    return publicArticles().map((article) => ({
      ...article,
      content: article.articleContent,
      contentHtml: renderMarkdown(article.articleContent),
    }));
  },
  async findBySlugOrId(value) {
    const articles = await this.list();
    return articles.find((article) => article.slug === value || String(article.id) === value);
  },
};
