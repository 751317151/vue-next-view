import type { Friend, Message, WebInfo } from '@/types';
import { mockWebInfo, mockFriends, mockMessages } from './mock/other';

const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 获取网站信息
 */
export async function getWebInfo(): Promise<WebInfo> {
  await delay(200);
  return mockWebInfo;
}

/**
 * 获取友链列表
 */
export async function getFriendList(): Promise<Friend[]> {
  await delay();
  return mockFriends;
}

/**
 * 获取留言列表
 */
export async function getMessageList(): Promise<Message[]> {
  await delay();
  return mockMessages;
}

/**
 * 添加留言
 */
export async function addMessage(data: Omit<Message, 'id' | 'createTime'>): Promise<Message> {
  await delay();

  const newMessage: Message = {
    id: Date.now(),
    ...data,
    createTime: new Date().toLocaleString(),
  };

  mockMessages.unshift(newMessage);
  return newMessage;
}
