import { publicCategories } from '../../utils/public-taxonomy';

export default defineEventHandler(async () => publicCategories());
