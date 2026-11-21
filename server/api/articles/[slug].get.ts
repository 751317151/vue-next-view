import { articleRepository } from '../../repositories/article-repository';
import type { PublicArticleRecord } from '../../utils/public-articles';

export default defineEventHandler(async (event): Promise<PublicArticleRecord> => {
  const slug = getRouterParam(event, 'slug');
  const articles = await articleRepository.list();
  const article = slug ? articles.find((candidate) => candidate.slug === slug || String(candidate.id) === slug) : undefined;
  if (!article) {
    throw createError({ statusCode: 404, statusMessage: '文章不存在' });
  }

  const recommendations = articles
    .filter((candidate) => candidate.id !== article.id)
    .map((candidate) => ({
      id: candidate.id,
      slug: candidate.slug,
      articleTitle: candidate.articleTitle,
      articleCover: candidate.articleCover,
      createTime: candidate.createTime,
      category: candidate.category,
      score: candidate.category && candidate.category === article.category ? 2 : 1,
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 4)
    .map(({ score: _score, ...candidate }) => candidate);

  // 上一篇 / 下一篇按发布时间从新到旧排，跟归档页看到的顺序一致。
  // 放在接口里算，客户端就不必为了两条链接再拉一遍全部文章。
  const pick = (candidate: PublicArticleRecord | undefined) => candidate
    ? {
      id: candidate.id,
      slug: candidate.slug,
      articleTitle: candidate.articleTitle,
      articleCover: candidate.articleCover,
      createTime: candidate.createTime,
      category: candidate.category,
    }
    : null;
  const index = articles.findIndex((candidate) => candidate.id === article.id);

  return {
    ...article,
    recommendations,
    neighbours: {
      previous: pick(articles[index + 1]),
      next: pick(articles[index - 1]),
    },
    updateTime: article.updateTime || article.createTime,
  };
});
