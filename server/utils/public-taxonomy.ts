import { publicArticles } from './public-articles';

/**
 * Categories and tags are derived from the articles themselves so counts and
 * detail pages can never drift away from the article list (the previous mock
 * taxonomy advertised five 生活倒影 posts while zero articles carried it).
 */
export const publicCategories = () => {
  const counts = new Map<string, number>();
  for (const article of publicArticles()) {
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

export const publicTags = () => {
  const counts = new Map<string, number>();
  for (const article of publicArticles()) {
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

export const findPublicCategory = (id: string) => publicCategories().find(
  (category) => category.slug === id || String(category.id) === id,
);

export const findPublicTag = (id: string) => publicTags().find(
  (tag) => tag.slug === id || String(tag.id) === id,
);
