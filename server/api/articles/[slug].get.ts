import { articleContent, articleContentHtml, publicArticles, type PublicArticleRecord } from '../../utils/public-articles';
import { articleRepository } from '../../repositories/article-repository';

export default defineEventHandler(async (event): Promise<PublicArticleRecord> => {
  const slug = getRouterParam(event, 'slug');
  const article = slug ? await articleRepository.findBySlugOrId(slug) : undefined;
  if (!article) {
    throw createError({ statusCode: 404, statusMessage: '文章不存在' });
  }

  const recommendations = publicArticles()
    .filter((candidate) => candidate.id !== article.id)
    .map((candidate) => ({
      ...candidate,
      score: candidate.category && candidate.category === article.category ? 2 : 1,
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 4)
    .map(({ score: _score, articleContent: _content, ...candidate }) => candidate);

  return {
    ...article,
    content: articleContent,
    contentHtml: articleContentHtml,
    recommendations,
    updateTime: article.createTime,
  };
});
