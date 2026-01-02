import { watch } from 'vue';
import { useRoute } from 'vue-router';

interface SeoOptions {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export function useSeo(options: SeoOptions = {}) {
  const route = useRoute();
  const siteName = '生活倒影';
  const defaultDesc = '一个优雅的个人博客，记录技术成长，分享编程心得';

  const updateMeta = (opts: SeoOptions) => {
    const title = opts.title ? `${opts.title} | ${siteName}` : siteName;
    const description = opts.description || defaultDesc;
    const url = opts.url || window.location.href;
    const image = opts.image || '';

    // 更新标题
    document.title = title;

    // 更新或创建 meta 标签
    const setMeta = (name: string, content: string, isProperty = false) => {
      if (!content) return;
      const attr = isProperty ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 基础 Meta
    setMeta('description', description);
    if (opts.keywords) setMeta('keywords', opts.keywords);

    // Open Graph
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:url', url, true);
    setMeta('og:type', 'website', true);
    setMeta('og:site_name', siteName, true);
    if (image) setMeta('og:image', image, true);

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    if (image) setMeta('twitter:image', image);
  };

  // 监听路由变化
  watch(() => route.path, () => {
    updateMeta(options);
  }, { immediate: true });

  return { updateMeta };
}
