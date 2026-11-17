import { findPublicTag } from '../../utils/public-taxonomy';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const tag = id ? await findPublicTag(id) : undefined;
  if (!tag) throw createError({ statusCode: 404, statusMessage: '标签不存在' });
  return tag;
});
