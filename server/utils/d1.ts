/**
 * Cloudflare D1 访问层。
 *
 * Nitro 的 cloudflare_pages 预设会把平台绑定挂到两个位置：
 * 生产环境走 `event.context.cloudflare.env`，本地 `nuxt dev` 走
 * wrangler 的平台代理（同样写入 `event.context.cloudflare.env`），
 * 另外入口还会兜底设置 `globalThis.__env__`。这里两条路都读，
 * 保证本地和线上行为一致。
 *
 * 没有绑定（比如纯 node 预设、没配 D1 的部署）时返回 null，
 * 由上层决定如何降级，而不是让整页 500。
 */

/** D1 的最小接口，只声明本文件用到的成员，避免引入 workers-types 依赖。 */
interface D1Result<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown>;
}

type CloudflareEnv = Record<string, unknown>;

const BINDING_NAME = 'MESSAGE_DB';

const readEnv = (event?: { context?: Record<string, unknown> }): CloudflareEnv | undefined => {
  const fromContext = event?.context?.cloudflare as { env?: CloudflareEnv } | undefined;
  if (fromContext?.env) return fromContext.env;
  const globalEnv = (globalThis as { __env__?: CloudflareEnv }).__env__;
  return globalEnv;
};

/** 取 D1 绑定；未配置时返回 null，调用方据此降级。 */
export const getMessageDb = (event?: { context?: Record<string, unknown> }): D1Database | null => {
  const env = readEnv(event);
  const db = env?.[BINDING_NAME];
  if (db && typeof (db as D1Database).prepare === 'function') return db as D1Database;
  return null;
};

/** 环境里是否声明了 D1（用于区分"没配置"和"配置了但坏了"）。 */
export const hasMessageDb = (event?: { context?: Record<string, unknown> }) => Boolean(getMessageDb(event));

/**
 * 会话相关的散列：删除令牌与来源 IP 都只存哈希。
 * 令牌哈希用于校验"这条留言是不是你发的"，IP 哈希用于限流，
 * 两者都不落明文。
 */
export const sha256Hex = async (value: string): Promise<string> => {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

/** 生成一个不可猜测的删除令牌（16 字节随机数的十六进制）。 */
export const createDeleteToken = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
};
