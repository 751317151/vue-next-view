import { storage } from '../../src/utils/storage';

export interface GuestMessage {
  id: string;
  name: string;
  text: string;
  /** Deterministic emoji chosen at post time so a message keeps its face. */
  emoji: string;
  createdAt: string;
}

const STORAGE_KEY = 'message-board-v1';
const MAX_MESSAGES = 120;

const EMOJIS = ['🌸', '🌙', '🍵', '✨', '🫧', '🌷', '⭐', '🧁', '🌿', '🎐', '☁️', '🍓'];

export const randomEmoji = () => EMOJIS[Math.floor(Math.random() * EMOJIS.length)]!;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const normalize = (value: unknown): GuestMessage[] => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item)) return [];
    const { id, name, text, emoji, createdAt } = item;
    if (typeof id !== 'string' || typeof text !== 'string' || !text.trim()) return [];
    return [{
      id,
      name: typeof name === 'string' && name.trim() ? name.trim().slice(0, 20) : '匿名旅人',
      text: text.trim().slice(0, 500),
      emoji: typeof emoji === 'string' && emoji ? emoji : randomEmoji(),
      createdAt: typeof createdAt === 'string' ? createdAt : new Date().toISOString(),
    }];
  });
};

/**
 * Local-only message board: the public page stays static/SSR friendly, and the
 * board itself lives in the visitor's browser until a backend is wired up.
 */
export const useMessageBoard = () => {
  const messages = ref<GuestMessage[]>([]);
  const ready = ref(false);

  const persist = () => {
    storage.set(STORAGE_KEY, JSON.stringify(messages.value.slice(0, MAX_MESSAGES)));
  };

  const load = () => {
    const raw = storage.get(STORAGE_KEY);
    if (raw) {
      try {
        messages.value = normalize(JSON.parse(raw));
      } catch {
        messages.value = [];
      }
    }
    ready.value = true;
  };

  const add = (name: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return null;
    const message: GuestMessage = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim() || '匿名旅人',
      text: trimmed.slice(0, 500),
      emoji: randomEmoji(),
      createdAt: new Date().toISOString(),
    };
    messages.value = [message, ...messages.value].slice(0, MAX_MESSAGES);
    persist();
    return message;
  };

  const remove = (id: string) => {
    messages.value = messages.value.filter((message) => message.id !== id);
    persist();
  };

  /** Seed a few warm starter notes so the wall never looks empty. */
  const seed = () => {
    if (messages.value.length) return;
    const now = Date.now();
    const starters: Array<Omit<GuestMessage, 'id'>> = [
      { name: '小星星', text: '路过这里，被满屏的温柔击中了。祝你今天也顺利 ✧', emoji: '🌙', createdAt: new Date(now - 1000 * 60 * 60 * 26).toISOString() },
      { name: '夜行者', text: '深夜读完了那篇讲 SSR 的文章，写得很清楚，谢谢分享！', emoji: '🍵', createdAt: new Date(now - 1000 * 60 * 60 * 5).toISOString() },
    ];
    messages.value = starters.map((item, index) => ({ ...item, id: `seed-${index}` }));
    persist();
  };

  return { messages, ready, load, add, remove, seed };
};
