import { articleRepository } from '../repositories/article-repository';

export default defineEventHandler(async (event) => {
  const query = String(getQuery(event).q || '').trim().toLowerCase();
  if (!query) return [];

  return (await articleRepository.list())
    .filter((article) => {
      const haystack = [article.articleTitle, article.articleContent, article.category, ...(article.tags || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    })
    .map((article) => ({
      id: article.id,
      slug: article.slug,
      articleTitle: article.articleTitle,
      articleContent: article.articleContent,
      category: article.category,
      createTime: article.createTime,
    }));
});
