import { articleRepository } from '../repositories/article-repository';
import { toSlug } from '../../src/utils/slug';

/**
 * Categories and tags are derived from the article list so counts and detail
 * pages can never drift away from the content (the previous mock taxonomy
 * advertised five 生活倒影 posts while zero articles carried it).
 *
 * Slugs come from the human-readable name and never from article ordering.
 * An index-based id renumbers every category the moment a newer article
 * introduces a new one, which silently rewrites canonical URLs, sitemap
 * entries and every inbound link. The name is the stable identity, so it is
 * what the URL is built from.
 */
const uniqueSlugs = (names: string[]): Map<string, string> => {
  const used = new Set<string>();
  const slugByName = new Map<string, string>();
  for (const name of names) {
    const base = toSlug(name, 'item');
    let slug = base;
    let counter = 2;
    while (used.has(slug)) slug = `${base}-${counter++}`;
    used.add(slug);
    slugByName.set(name, slug);
  }
  return slugByName;
};

/**
 * Deterministic order so slugs and ids never depend on article dates or on the
 * host's collation data. Plain UTF-16 code-unit sort is used instead of
 * `localeCompare`, which varies with the ICU build and would silently reorder
 * (and therefore re-slug) entries across environments.
 */
const stableOrder = (names: string[]) => [...names].sort();

export const publicCategories = async () => {
  const articles = await articleRepository.list();
  const counts = new Map<string, number>();
  for (const article of articles) {
    const name = article.category || '随笔';
    counts.set(name, (counts.get(name) || 0) + 1);
  }

  const names = stableOrder([...counts.keys()]);
  const slugByName = uniqueSlugs(names);

  return names.map((categoryName, index) => ({
    id: index + 1,
    slug: slugByName.get(categoryName)!,
    categoryName,
    articleCount: counts.get(categoryName) || 0,
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

  const names = stableOrder([...counts.keys()]);
  const slugByName = uniqueSlugs(names);

  return names.map((tagName, index) => ({
    id: index + 1,
    slug: slugByName.get(tagName)!,
    tagName,
    articleCount: counts.get(tagName) || 0,
  }));
};

/**
 * Numeric ids are still accepted so links minted before slugs existed keep
 * resolving; callers can compare the returned `slug` with the requested value
 * and issue a 301 to the canonical name-based URL.
 */
export const findPublicCategory = async (id: string) => {
  const categories = await publicCategories();
  return categories.find((category) => category.slug === id || String(category.id) === id);
};

export const findPublicTag = async (id: string) => {
  const tags = await publicTags();
  return tags.find((tag) => tag.slug === id || String(tag.id) === id);
};
