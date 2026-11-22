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
