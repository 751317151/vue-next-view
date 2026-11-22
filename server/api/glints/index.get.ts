import { listGlints } from '../../repositories/glint-repository';

export default defineEventHandler(async () => listGlints());
