import { deleteMessage, MessageValidationError } from '../../utils/message-store';

/**
 * 删除留言。必须带发布时拿到的删除令牌，服务端比对哈希后才会删。
 * 令牌走请求体而不是 URL，避免出现在访问日志和 Referer 里。
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ id?: unknown; token?: unknown }>(event).catch(() => null);
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: '请求格式不正确' });
  }

  try {
    const removed = await deleteMessage(event, body.id, body.token);
    if (!removed) {
      // 令牌不对和留言不存在返回同一个结果，不泄露"这条留言存在但不是你的"。
      throw createError({ statusCode: 403, statusMessage: '没有权限删除这条留言' });
    }
    setHeader(event, 'Cache-Control', 'no-store');
    return { ok: true };
  } catch (error) {
    if (error instanceof MessageValidationError) {
      throw createError({ statusCode: 422, statusMessage: error.message });
    }
    if (error instanceof Error && error.message === 'MESSAGE_DB_NOT_CONFIGURED') {
      throw createError({ statusCode: 503, statusMessage: '共享留言墙还没有启用' });
    }
    throw error;
  }
});
