import { articleRepository } from '../repositories/article-repository';

/**
 * Categories and tags are derived from the article list so counts and detail
 * pages can never drift away from the content (the previous mock taxonomy
 * advertised five 生活倒影 posts while zero articles carried it).
 */
export const publicCategories = async () => {
  const articles = await articleRepository.list();
  const counts = new Map<string, number>();
  for (const article of articles) {
    const name = article.category || '随笔';
    counts.set(name, (counts.get(name) || 0) + 1);
  }
  return [...counts.entries()].map(([categoryName, articleCount], index) => ({
    id: index + 1,
    slug: String(index + 1),
    categoryName,
    articleCount,
    description: '',
  }));
};

export const publicTags = async () => {
  const articles = await articleRepository.list();
  const counts = new Map<string, number>();
  for (const article of articles) {
    for (const tag of article.tags || []) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }
  return [...counts.entries()].map(([tagName, articleCount], index) => ({
    id: index + 1,
    slug: String(index + 1),
    tagName,
    articleCount,
  }));
};

export const findPublicCategory = async (id: string) => {
  const categories = await publicCategories();
  return categories.find((category) => category.slug === id || String(category.id) === id);
};

export const findPublicTag = async (id: string) => {
  const tags = await publicTags();
  return tags.find((tag) => tag.slug === id || String(tag.id) === id);
};
