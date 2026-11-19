import { createDeleteToken, getMessageDb, sha256Hex, type D1Database } from './d1';

/** 对外暴露的留言形状：永远不含 delete_hash / ip_hash。 */
export interface PublicMessage {
  id: string;
  name: string;
  text: string;
  emoji: string;
  createdAt: string;
}

/** 列表接口的返回，附带"后端是否可用"的信息供前端降级。 */
export interface MessageListResult {
  messages: PublicMessage[];
  /** false 表示这次没读到共享存储（未配置 D1 或查询失败）。 */
  shared: boolean;
}

export interface CreateMessageInput {
  name?: unknown;
  text?: unknown;
}

export interface CreatedMessage {
  message: PublicMessage;
  /** 只返回给发布者一次，之后仅存哈希。 */
  deleteToken: string;
}

const MAX_NAME_LENGTH = 20;
const MAX_TEXT_LENGTH = 500;
const MAX_PAGE_SIZE = 100;
const RATE_LIMIT_PER_HOUR = 8;
const EMOJIS = ['🌸', '🌙', '🍵', '✨', '🫧', '🌷', '⭐', '🧁', '🌿', '🎐', '☁️', '🍓'];

const ANONYMOUS_NAME = '匿名旅人';

export class MessageValidationError extends Error {}
export class MessageRateLimitError extends Error {}

const pickEmoji = () => EMOJIS[Math.floor(Math.random() * EMOJIS.length)]!;

/**
 * 清洗用户输入：去掉控制字符（含零宽字符、双向覆盖符），压掉连续空行。
 * 不做 HTML 转义——留言始终以文本节点渲染，转义应该在输出层做；
 * 这里只保证存进去的是"一段可读的纯文本"。
 */
const clean = (value: string, maxLength: number): string => value
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
  .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, '')
  .replace(/\r\n/g, '\n')
  .replace(/\n{3,}/g, '\n\n')
  .trim()
  .slice(0, maxLength);

const normalizeName = (value: unknown): string => {
  if (typeof value !== 'string') return ANONYMOUS_NAME;
  const name = clean(value, MAX_NAME_LENGTH);
  return name || ANONYMOUS_NAME;
};

const normalizeText = (value: unknown): string => {
  if (typeof value !== 'string') throw new MessageValidationError('留言内容不能为空');
  const text = clean(value, MAX_TEXT_LENGTH);
  if (!text) throw new MessageValidationError('留言内容不能为空');
  return text;
};

const rowToPublic = (row: Record<string, unknown>): PublicMessage => ({
  id: String(row.id ?? ''),
  name: String(row.name ?? ANONYMOUS_NAME),
  text: String(row.text ?? ''),
  emoji: String(row.emoji ?? '✦'),
  createdAt: String(row.created_at ?? new Date().toISOString()),
});

/** 请求来源哈希，用于限流。拿不到 IP 时返回 null，此时只做全局约束。 */
export const clientFingerprint = async (event: {
  node?: { req?: { headers?: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } } };
  context?: Record<string, unknown>;
}): Promise<string | null> => {
  const headers = event.node?.req?.headers ?? {};
  const forwarded = headers['cf-connecting-ip'] ?? headers['x-forwarded-for'];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const ip = (raw ? String(raw).split(',')[0]?.trim() : '') || event.node?.req?.socket?.remoteAddress || '';
  if (!ip) return null;
  // 加盐，避免库里的哈希被拿去反查常见 IP。
  return sha256Hex(`message-board:${ip}`);
};

const listMessages = async (db: D1Database, limit: number): Promise<PublicMessage[]> => {
  const statement = db
    .prepare(
      `SELECT id, name, text, emoji, created_at
         FROM messages
        WHERE status = 'visible'
        ORDER BY created_at DESC
        LIMIT ?`,
    )
    .bind(limit);
  const result = await statement.all<Record<string, unknown>>();
  return (result.results ?? []).map(rowToPublic);
};

/**
 * 读留言。没有 D1 或查询失败时返回 `shared: false` 和空列表，
 * 由前端决定退回本地缓存还是显示空状态——绝不让整页报错。
 */
export const readMessages = async (
  event: Parameters<typeof getMessageDb>[0],
  limit = 60,
): Promise<MessageListResult> => {
  const db = getMessageDb(event);
  if (!db) return { messages: [], shared: false };
  const safeLimit = Math.min(Math.max(1, Math.trunc(limit) || 60), MAX_PAGE_SIZE);
  try {
    return { messages: await listMessages(db, safeLimit), shared: true };
  } catch (error) {
    console.error('[message-board] 读取留言失败', error);
    return { messages: [], shared: false };
  }
};

/** 同一来源一小时内最多写几条。没有 IP 时跳过这条检查。 */
const assertWithinRateLimit = async (db: D1Database, ipHash: string | null) => {
  if (!ipHash) return;
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const row = await db
    .prepare('SELECT COUNT(*) AS count FROM messages WHERE ip_hash = ? AND created_at >= ?')
    .bind(ipHash, since)
    .first<{ count?: number }>();
  const used = Number(row?.count ?? 0);
  if (used >= RATE_LIMIT_PER_HOUR) {
    throw new MessageRateLimitError('留言太频繁啦，歇一会儿再来吧 ✧');
  }
};

/**
 * 写留言。返回一次性删除令牌。
 * 未配置 D1 时抛错，由 API 层转成 503，让前端明确降级到本地模式。
 */
export const createMessage = async (
  event: Parameters<typeof getMessageDb>[0] & Parameters<typeof clientFingerprint>[0],
  input: CreateMessageInput,
): Promise<CreatedMessage> => {
  const db = getMessageDb(event);
  if (!db) throw new Error('MESSAGE_DB_NOT_CONFIGURED');

  const name = normalizeName(input.name);
  const text = normalizeText(input.text);
  const ipHash = await clientFingerprint(event);
  await assertWithinRateLimit(db, ipHash);

  const deleteToken = createDeleteToken();
  const deleteHash = await sha256Hex(deleteToken);
  const message: PublicMessage = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    text,
    emoji: pickEmoji(),
    createdAt: new Date().toISOString(),
  };

  await db
    .prepare(
      `INSERT INTO messages (id, name, text, emoji, created_at, delete_hash, ip_hash, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'visible')`,
    )
    .bind(message.id, message.name, message.text, message.emoji, message.createdAt, deleteHash, ipHash)
    .run();

  return { message, deleteToken };
};

/**
 * 删除留言：必须同时提供留言 id 和发布时拿到的令牌。
 * 令牌比对用哈希等值查询，避免在应用层做字符串比较。
 */
export const deleteMessage = async (
  event: Parameters<typeof getMessageDb>[0],
  id: unknown,
  token: unknown,
): Promise<boolean> => {
  const db = getMessageDb(event);
  if (!db) throw new Error('MESSAGE_DB_NOT_CONFIGURED');
  if (typeof id !== 'string' || !id.trim()) throw new MessageValidationError('缺少留言 id');
  if (typeof token !== 'string' || token.length < 16) throw new MessageValidationError('缺少删除令牌');

  const deleteHash = await sha256Hex(token);
  const result = await db
    .prepare('DELETE FROM messages WHERE id = ? AND delete_hash = ?')
    .bind(id.trim(), deleteHash)
    .run();
  return Number(result.meta?.changes ?? 0) > 0;
};
