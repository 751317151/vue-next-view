import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { siteConfig } from '../../src/config/site';

interface CollectionItem {
  articleTitle: string;
  slug: string;
}

interface CollectionSeoInput {
  path: MaybeRefOrGetter<string>;
  title: MaybeRefOrGetter<string>;
  description: MaybeRefOrGetter<string>;
  /** 该列表页包含的文章。传 getter 就能跟着数据一起更新。 */
  items: MaybeRefOrGetter<CollectionItem[] | undefined>;
}

/**
 * 列表页（归档 / 分类 / 标签 / 搜索）的 SEO + 结构化数据。
 *
 * 单篇文章靠 BlogPosting 说明"这是什么"，列表页则要说明"这里有哪些"。
 * CollectionPage + ItemList 正好表达这层关系，生成式引擎在回答
 * "这个站里关于 X 的文章有哪些"时能直接读到清单，不必先爬一遍站内链接。
 */
export const useCollectionSeo = (input: CollectionSeoInput) => {
  const runtimeConfig = useRuntimeConfig();
  const requestUrl = useRequestURL();
  const origin = String(runtimeConfig.public.siteUrl || '').replace(/\/$/, '') || requestUrl.origin;

  const absolute = (route: string) => {
    try {
      return new URL(route, origin).toString();
    } catch {
      return route;
    }
  };

  const jsonLd = computed(() => {
    const list = toValue(input.items) || [];
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: toValue(input.title),
      description: toValue(input.description),
      url: absolute(toValue(input.path)),
      inLanguage: siteConfig.locale,
      isPartOf: { '@type': 'WebSite', name: siteConfig.name, url: absolute('/') },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: list.length,
        itemListElement: list.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.articleTitle,
          url: absolute(`/article/${encodeURIComponent(item.slug)}`),
        })),
      },
    };
  });

  return usePageSeo({
    path: input.path,
    title: input.title,
    description: input.description,
    jsonLd,
  });
};
