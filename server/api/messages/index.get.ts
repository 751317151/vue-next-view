import { readMessages } from '../../utils/message-store';

/**
 * 留言列表。前端在挂载后调用，这样 /message 页面本身还能预渲染，
 * 留言内容永远是最新的，也不会把某个时刻的留言墙烤进静态 HTML。
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const limit = Number(query.limit ?? 60);
  const result = await readMessages(event, Number.isFinite(limit) ? limit : 60);

  setHeader(event, 'Cache-Control', 'no-store');
  return result;
});