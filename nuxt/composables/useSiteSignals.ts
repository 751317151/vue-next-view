/**
 * 站点内的匿名探索信号。
 *
 * 刻意不接任何第三方埋点：所有记录只写到 localStorage，供未来做
 * "最近去过 / 常看分类 / 罗盘使用情况" 这类本地化运营功能时复用。
 * 不采集输入内容或搜索词，避免把读者私下的查找变成可追踪数据。
 */
export type SiteSignalName =
  | 'compass:open'
  | 'compass:search'
  | 'compass:random'
  | 'compass:navigate'
  | 'drawer:open';

export interface SiteSignal {
  name: SiteSignalName;
  /** 只存低敏枚举，例如来源 'menu' / 'drawer'，绝不存搜索词。 */
  meta?: string;
  at: number;
}

const KEY = 'blackstar-site-signals';
const MAX_SIGNALS = 120;
const isBrowser = () => typeof window !== 'undefined';

const readSignals = (): SiteSignal[] => {
  if (!isBrowser()) return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is SiteSignal => Boolean(item)
      && typeof (item as SiteSignal).name === 'string'
      && typeof (item as SiteSignal).at === 'number');
  } catch {
    return [];
  }
};

export const trackSiteSignal = (name: SiteSignalName, meta?: string) => {
  if (!isBrowser()) return;
  try {
    const next = [...readSignals(), { name, meta, at: Date.now() }].slice(-MAX_SIGNALS);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // 隐私模式拒绝写入时静默跳过，不影响正常浏览。
  }
};

/** 供未来的"我的探索足迹"面板使用：按名称汇总次数。 */
export const summarizeSiteSignals = (): Record<string, number> => {
  const summary: Record<string, number> = {};
  for (const signal of readSignals()) {
    summary[signal.name] = (summary[signal.name] || 0) + 1;
  }
  return summary;
};

/** 最近 N 条足迹；只返回名称与时间，用于"探索足迹"的展示。 */
export const recentSiteSignals = (limit = 5): SiteSignal[] => readSignals().slice(-limit).reverse();

const SIGNAL_LABELS: Record<SiteSignalName, string> = {
  'compass:open': '打开星海罗盘',
  'compass:search': '在星海里找了找',
  'compass:random': '让星星抽了一篇',
  'compass:navigate': '沿着罗盘出发',
  'drawer:open': '翻开移动端小抽屉',
};

export const signalLabel = (name: string) => SIGNAL_LABELS[name as SiteSignalName] || '继续探索';
