import { listGlints } from '../../repositories/glint-repository';
import { glintPath, type PublicGlintWithPath } from '../../utils/glint-records';

export default defineEventHandler(async (): Promise<PublicGlintWithPath[]> => (await listGlints()).map((glint) => ({
  ...glint,
  path: glintPath(glint.slug),
})));
