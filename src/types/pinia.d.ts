/**
 * pinia 类型定义
 */

// 用户信息
declare interface Config<T = any> {
  toolbar: {
    visible: boolean;
    enter: boolean;
  };
  Categories: Array<Category>;
  Tags: Array<Tag>;
  currentUser: {};
  currentAdmin: {};
  webInfo: {
    webName: "";
    webTitle: [];
    notices: [];
    footer: "";
    backgroundImage: "";
    avatar: "";
  };
}

declare interface Category {
  id: number;
  categoryName: string;
}
declare interface Tag {
  id: number;
  tagName: string;
}

declare interface Article {
  id: number;
  articleTitle: string;
  articleContent: string;
  articleCover: string;
  createTime: date;
  viewCount: number;
  commentCount: number;
  likeCount: number;
}
