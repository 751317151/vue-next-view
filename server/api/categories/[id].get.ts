import { findPublicCategory } from '../../utils/public-taxonomy';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const category = id ? await findPublicCategory(id) : undefined;
  if (!category) throw createError({ statusCode: 404, statusMessage: '分类不存在' });
  return category;
});
