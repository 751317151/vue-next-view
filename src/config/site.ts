export const siteConfig = {
  name: '生活倒影',
  description: '一个优雅而有趣的个人博客，记录技术成长，分享编程心得与生活灵感。',
  author: 'BlackStar',
  locale: 'zh-CN',
};

export const getSiteUrl = () => {
  if (typeof window !== 'undefined') {
    return import.meta.env.VITE_SITE_URL || window.location.origin;
  }
  return import.meta.env.VITE_SITE_URL || import.meta.env.VITE_WEB_URL || '';
};
