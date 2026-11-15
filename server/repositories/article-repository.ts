import { publicArticles, type PublicArticleRecord } from '../utils/public-articles';

export interface ArticleRepository {
  list(): Promise<PublicArticleRecord[]>;
  findBySlugOrId(value: string): Promise<PublicArticleRecord | undefined>;
}

/**
 * Temporary repository backed by the existing mock data.
 * Replace this implementation with a database or remote API adapter without
 * changing Nitro handlers or Nuxt pages.
 */
export const articleRepository: ArticleRepository = {
  async list() {
    return publicArticles();
  },
  async findBySlugOrId(value) {
    return publicArticles().find((article) => article.slug === value || String(article.id) === value);
  },
};
