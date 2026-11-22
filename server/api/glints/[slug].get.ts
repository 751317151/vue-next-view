import { findGlintBySlug } from '../../repositories/glint-repository';
import { glintPath } from '../../utils/glint-records';

export default defineEventHandler(async (event) => {
  const slug = decodeURIComponent(getRouterParam(event, 'slug') || '');
  const glint = await findGlintBySlug(slug);
  if (!glint) {
    throw createError({ statusCode: 404, statusMessage: '微光不存在' });
  }
  return {
    ...glint,
    path: glintPath(glint.slug),
  };
});
