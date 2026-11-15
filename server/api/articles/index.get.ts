import { articleRepository } from '../../repositories/article-repository';
import type { PublicArticleRecord } from '../../utils/public-articles';

export default defineEventHandler(async (): Promise<Omit<PublicArticleRecord, 'content'>[]> => (await articleRepository.list()).map((article) => ({
  id: article.id,
  slug: article.slug,
  articleTitle: article.articleTitle,
  articleContent: article.articleContent,
  articleCover: article.articleCover,
  createTime: article.createTime,
  updateTime: article.createTime,
  category: article.category,
  tags: article.tags,
})))
