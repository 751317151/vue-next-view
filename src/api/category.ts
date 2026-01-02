import type { Category, Tag } from '@/types';
import { mockCategories, mockTags } from './mock/category';

const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 获取分类列表
 */
export async function getCategoryList(): Promise<Category[]> {
  await delay();
  return mockCategories;
}

/**
 * 获取分类详情
 */
export async function getCategoryDetail(id: number): Promise<Category | undefined> {
  await delay(200);
  return mockCategories.find(item => item.id === id);
}

/**
 * 获取标签列表
 */
export async function getTagList(): Promise<Tag[]> {
  await delay();
  return mockTags;
}

/**
 * 获取标签详情
 */
export async function getTagDetail(id: number): Promise<Tag | undefined> {
  await delay(200);
  return mockTags.find(item => item.id === id);
}

/**
 * 搜索分类
 */
export async function searchCategories(keyword: string): Promise<Category[]> {
  await delay(200);
  if (!keyword.trim()) return [];
  const lowerKeyword = keyword.toLowerCase();
  return mockCategories.filter(item =>
    item.categoryName.toLowerCase().includes(lowerKeyword) ||
    (item.description && item.description.toLowerCase().includes(lowerKeyword))
  );
}

/**
 * 搜索标签
 */
export async function searchTags(keyword: string): Promise<Tag[]> {
  await delay(200);
  if (!keyword.trim()) return [];
  const lowerKeyword = keyword.toLowerCase();
  return mockTags.filter(item =>
    item.tagName.toLowerCase().includes(lowerKeyword)
  );
}
