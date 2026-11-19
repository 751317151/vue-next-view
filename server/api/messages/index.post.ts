import {
  createMessage,
  MessageRateLimitError,
  MessageValidationError,
} from '../../utils/message-store';

/**
 * 发布留言。
 *
 * 返回里带一个 `deleteToken`，只在此刻返回一次：前端存进 localStorage，
 * 之后要删自己的留言就靠它。服务端只保留哈希，丢了就删不掉——
 * 这是"不引入账号系统也能防乱删"的代价，界面上要跟用户讲清楚。
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ name?: unknown; text?: unknown }>(event).catch(() => null);
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: '请求格式不正确' });
  }

  try {
    const created = await createMessage(event, { name: body.name, text: body.text });
    setHeader(event, 'Cache-Control', 'no-store');
    return created;
  } catch (error) {
    if (error instanceof MessageValidationError) {
      throw createError({ statusCode: 422, statusMessage: error.message });
    }
    if (error instanceof MessageRateLimitError) {
      throw createError({ statusCode: 429, statusMessage: error.message });
    }
    if (error instanceof Error && error.message === 'MESSAGE_DB_NOT_CONFIGURED') {
      // 让前端明确知道"共享留言墙没开"，好退回本地模式并提示用户。
      throw createError({ statusCode: 503, statusMessage: '共享留言墙还没有启用' });
    }
    console.error('[message-board] 写入留言失败', error);
    throw createError({ statusCode: 500, statusMessage: '留言没能贴上去，请稍后再试' });
  }
});
