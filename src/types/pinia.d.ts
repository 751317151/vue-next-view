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
