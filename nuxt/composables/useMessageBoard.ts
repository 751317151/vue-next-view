import { storage } from '../../src/utils/storage';

export interface GuestMessage {
  id: string;
  name: string;
  text: string;
  /** 发布时选定的 emoji，让每条留言有自己的一张脸。 */
  emoji: string;
  createdAt: string;
  /** 只有本人发布、且由共享留言墙返回的留言才有：能否删除。 */
  mine?: boolean;
}

/** 共享墙不可用时的本地兜底，和以前一样只存在这台浏览器。 */
const LOCAL_KEY = 'message-board-v1';
/** 删除令牌按留言 id 存，用来删自己发在共享墙上的留言。 */
const TOKEN_KEY = 'message-board-tokens-v1';
const MAX_MESSAGES = 120;
const EMOJIS = ['🌸', '🌙', '🍵', '✨', '🫧', '🌷', '⭐', '🧁', '🌿', '🎐', '☁️', '🍓'];

type Mode = 'loading' | 'shared' | 'local';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const pickEmoji = () => EMOJIS[Math.floor(Math.random() * EMOJIS.length)]!;

const normalizeLocal = (value: unknown): GuestMessage[] => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item)) return [];
    const { id, name, text, emoji, createdAt } = item;
    if (typeof id !== 'string' || typeof text !== 'string' || !text.trim()) return [];
    return [{
      id,
      name: typeof name === 'string' && name.trim() ? name.trim().slice(0, 20) : '匿名旅人',
      text: text.trim().slice(0, 500),
      emoji: typeof emoji === 'string' && emoji ? emoji : pickEmoji(),
      createdAt: typeof createdAt === 'string' ? createdAt : new Date().toISOString(),
    }];
  });
};

const readTokens = (): Record<string, string> => {
  try {
    const parsed: unknown = JSON.parse(storage.get(TOKEN_KEY) || '{}');
    if (!isRecord(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
    );
  } catch {
    return {};
  }
};

const writeTokens = (tokens: Record<string, string>) => {
  storage.set(TOKEN_KEY, JSON.stringify(tokens));
};

const rememberToken = (id: string, token: string) => {
  const tokens = readTokens();
  tokens[id] = token;
  // 只保留最近 50 个，避免本地存储无限增长。
  const trimmed = Object.fromEntries(Object.entries(tokens).slice(-50));
  writeTokens(trimmed);
};

const forgetToken = (id: string) => {
  const tokens = readTokens();
  delete tokens[id];
  writeTokens(tokens);
};

/**
 * 留言板：优先读写 Cloudflare D1 上的共享墙，读不到再退回本地存储。
 *
 * 为什么要降级：仓库可能在没配 D1 的环境里被克隆和构建，
 * 这时页面不该整体崩掉，而应该明确告诉用户"现在是本地模式"。
 */
export const useMessageBoard = () => {
  const messages = ref<GuestMessage[]>([]);
  const mode = ref<Mode>('loading');
  const pending = ref(false);
  const errorMessage = ref('');

  const ready = computed(() => mode.value !== 'loading');
  const shared = computed(() => mode.value === 'shared');

  const persistLocal = () => {
    storage.set(LOCAL_KEY, JSON.stringify(messages.value.slice(0, MAX_MESSAGES)));
  };

  const loadLocal = () => {
    try {
      messages.value = normalizeLocal(JSON.parse(storage.get(LOCAL_KEY) || '[]'));
    } catch {
      messages.value = [];
    }
    mode.value = 'local';
  };

  /** 拉取共享留言；失败时退回本地，不抛错。 */
  const load = async () => {
    errorMessage.value = '';
    try {
      const result = await $fetch<{ messages: GuestMessage[]; shared: boolean }>('/api/messages');
      if (!result.shared) {
        loadLocal();
        return;
      }
      const tokens = readTokens();
      messages.value = result.messages.map((message) => ({
        ...message,
        mine: Boolean(tokens[message.id]),
      }));
      mode.value = 'shared';
    } catch {
      loadLocal();
    }
  };

  /** 发布。共享墙可用时写服务端，否则写本地。 */
  const add = async (name: string, text: string): Promise<GuestMessage | null> => {
    const trimmed = text.trim();
    if (!trimmed || pending.value) return null;
    pending.value = true;
    errorMessage.value = '';

    try {
      if (mode.value === 'shared') {
        const created = await $fetch<{ message: GuestMessage; deleteToken: string }>('/api/messages', {
          method: 'POST',
          body: { name, text: trimmed },
        });
        rememberToken(created.message.id, created.deleteToken);
        const message: GuestMessage = { ...created.message, mine: true };
        messages.value = [message, ...messages.value].slice(0, MAX_MESSAGES);
        return message;
      }

      // 本地模式：保持和以前一样的行为。
      const message: GuestMessage = {
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        name: name.trim() || '匿名旅人',
        text: trimmed.slice(0, 500),
        emoji: pickEmoji(),
        createdAt: new Date().toISOString(),
        mine: true,
      };
      messages.value = [message, ...messages.value].slice(0, MAX_MESSAGES);
      persistLocal();
      return message;
    } catch (error) {
      errorMessage.value = getErrorMessage(error, '留言没能贴上去，请稍后再试');
      return null;
    } finally {
      pending.value = false;
    }
  };

  /** 删除自己的留言：共享模式要带令牌，本地模式直接删。 */
  const remove = async (id: string): Promise<boolean> => {
    errorMessage.value = '';
    if (mode.value === 'shared') {
      const token = readTokens()[id];
      if (!token) {
        errorMessage.value = '这条留言不是在这台设备上发布的，删不掉哦';
        return false;
      }
      try {
        await $fetch('/api/messages', { method: 'DELETE', body: { id, token } });
        forgetToken(id);
        messages.value = messages.value.filter((message) => message.id !== id);
        return true;
      } catch (error) {
        errorMessage.value = getErrorMessage(error, '删除失败，请稍后再试');
        return false;
      }
    }

    messages.value = messages.value.filter((message) => message.id !== id);
    persistLocal();
    return true;
  };

  return { messages, mode, ready, shared, pending, errorMessage, load, add, remove };
};

/** 从 $fetch 的错误里取服务端 statusMessage，拿不到就用兜底文案。 */
const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isRecord(error)) {
    const data = error.data as Record<string, unknown> | undefined;
    if (data && typeof data.statusMessage === 'string' && data.statusMessage) return data.statusMessage;
    if (typeof error.statusMessage === 'string' && error.statusMessage) return error.statusMessage;
  }
  return fallback;
};
