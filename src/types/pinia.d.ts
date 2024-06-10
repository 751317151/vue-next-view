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
  id: Number;
  categoryName: String;
}
declare interface Tag {
  id: Number;
  tagName: String;
}
