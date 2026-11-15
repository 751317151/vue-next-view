export interface SeoArticleInput {
  title: string;
  description?: string;
  url: string;
  image?: string;
  publishedAt?: string;
  updatedAt?: string;
  category?: string;
  tags?: string[];
  author?: string;
}

export interface SeoDocument {
  title: string;
  description: string;
  canonical: string;
  meta: Array<{ key: string; value: string; attribute: 'name' | 'property' }>;
  jsonLd: Record<string, unknown>;
}

const cleanText = (value: string) => value
  .replace(/```[\s\S]*?```/g, ' ')
  .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
  .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/[\#>*_`~-]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

export const summarizeForSeo = (value: string, maxLength = 170) => {
  const text = cleanText(value);
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
};

export const buildArticleSeo = (input: SeoArticleInput, siteName = '生活倒影'): SeoDocument => {
  const title = `${input.title} | ${siteName}`;
  const description = summarizeForSeo(input.description || input.title);
  const author = input.author || 'BlackStar';
  const article = {
    '@type': 'BlogPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
    headline: input.title,
    description,
    image: input.image ? [input.image] : undefined,
    datePublished: input.publishedAt,
    dateModified: input.updatedAt || input.publishedAt,
    articleSection: input.category,
    keywords: input.tags,
    author: { '@type': 'Person', name: author },
    publisher: { '@type': 'Person', name: author },
  };
  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首页', item: new URL('/', input.url).toString() },
      ...(input.category ? [{ '@type': 'ListItem', position: 2, name: input.category }] : []),
      { '@type': 'ListItem', position: input.category ? 3 : 2, name: input.title, item: input.url },
    ],
  };

  return {
    title,
    description,
    canonical: input.url,
    meta: [
      { key: 'description', value: description, attribute: 'name' },
      { key: 'og:type', value: 'article', attribute: 'property' },
      { key: 'og:title', value: title, attribute: 'property' },
      { key: 'og:description', value: description, attribute: 'property' },
      { key: 'og:url', value: input.url, attribute: 'property' },
      ...(input.image ? [{ key: 'og:image', value: input.image, attribute: 'property' as const }] : []),
      { key: 'twitter:card', value: 'summary_large_image', attribute: 'name' },
      { key: 'twitter:title', value: title, attribute: 'name' },
      { key: 'twitter:description', value: description, attribute: 'name' },
      ...(input.image ? [{ key: 'twitter:image', value: input.image, attribute: 'name' as const }] : []),
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [article, breadcrumb],
    },
  };
};
