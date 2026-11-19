import { listContentArticles } from '../utils/content-articles';
import { publicArticles, type PublicArticleRecord } from '../utils/public-articles';
import { renderMarkdown } from '../utils/markdown';
import { articleSummary } from '../utils/article-summary';

export interface ArticleRepository {
  list(): Promise<PublicArticleRecord[]>;
  findBySlugOrId(value: string): Promise<PublicArticleRecord | undefined>;
}

/**
 * Reads markdown articles from `content/articles/` (bundled via Nitro
 * serverAssets). Falls back to the seeded mock list when the content folder is
 * empty, so fresh clones still render a complete site.
 *
 * `summary` 在这里统一补上：frontmatter 写了就用写的，没写就从正文首段提取。
 * 放在仓库层是为了让列表、详情、RSS、llms.txt 读到同一份摘要，
 * 避免每个出口各截一次、截出来的口径还不一样。
 */
export const articleRepository: ArticleRepository = {
  async list() {
    const contentArticles = await listContentArticles();
    const source = contentArticles.length > 0
      ? contentArticles
      : publicArticles().map((article) => ({
        ...article,
        content: article.articleContent,
        contentHtml: renderMarkdown(article.articleContent),
      }));
    return source.map((article) => ({ ...article, summary: articleSummary(article) }));
  },
  async findBySlugOrId(value) {
    const articles = await this.list();
    return articles.find((article) => article.slug === value || String(article.id) === value);
  },
};
