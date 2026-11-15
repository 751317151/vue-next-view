import { mockCategories, mockTags } from '../../src/api/mock/category';

export const publicCategories = () => mockCategories.map((category) => ({
  ...category,
  slug: String(category.id),
}));

export const publicTags = () => mockTags.map((tag) => ({
  ...tag,
  slug: String(tag.id),
}));

export const findPublicCategory = (id: string) => publicCategories().find((category) => category.slug === id || String(category.id) === id);

export const findPublicTag = (id: string) => publicTags().find((tag) => tag.slug === id || String(tag.id) === id);
