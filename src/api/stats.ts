import { mockArticles } from './mock/article';
import { mockCategories, mockTags } from './mock/category';

// 模拟延迟
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Mock 赞赏数据
const mockAdmires = [
    { id: 1, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', username: '技术爱好者', admire: 66 },
    { id: 2, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', username: '前端小白', admire: 18.88 },
    { id: 3, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', username: 'Java开发者', admire: 50 },
    { id: 4, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4', username: '匿名用户', admire: 10 },
    { id: 5, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5', username: '全栈工程师', admire: 88 },
];

/**
 * 博客统计信息
 */
export interface BlogStats {
    articleCount: number;
    categoryCount: number;
    tagCount: number;
    viewCount: number;
    commentCount: number;
}

/**
 * 获取博客统计信息
 */
export async function getBlogStats(): Promise<BlogStats> {
    await delay(200);

    return {
        articleCount: mockArticles.length,
        categoryCount: mockCategories.length,
        tagCount: mockTags.length,
        viewCount: mockArticles.reduce((sum, a) => sum + a.viewCount, 0),
        commentCount: mockArticles.reduce((sum, a) => sum + a.commentCount, 0),
    };
}

/**
 * 获取赞赏名单
 */
export async function getAdmireList(): Promise<typeof mockAdmires> {
    await delay(200);
    return mockAdmires;
}

/**
 * 获取最新公告
 */
export async function getLatestNotice(): Promise<{ title: string; content: string }> {
    await delay(100);
    return {
        title: '网站更新公告',
        content: '欢迎来到 BlackStar 的技术博客！本站持续更新中...',
    };
}
