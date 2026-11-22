export interface PublicGlintRecord {
  id: number;
  slug: string;
  title: string;
  body: string;
  summary: string;
  /** 纯文本正文，供列表卡片、RSS 与 llms.txt 共用。 */
  text: string;
  html: string;
  date: string;
  emoji: string;
}

export interface PublicGlintWithPath extends PublicGlintRecord {
  path: string;
}

/** 微光详情页的规范路径；列表锚点继续保留给旧链接。 */
export const glintPath = (slug: string) => `/glints/${encodeURIComponent(slug)}`;
