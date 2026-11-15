const chinesePunctuation = /[，。！？、；：”“‘’（）【】《》]/g;

export const toSlug = (value: string, fallback = 'article') => {
  const slug = value
    .toLowerCase()
    .replace(chinesePunctuation, ' ')
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

  return slug || fallback;
};
