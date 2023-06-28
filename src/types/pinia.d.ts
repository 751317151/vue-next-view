/**
 * pinia 类型定义
 */

// 用户信息
declare interface Config<T = any> {
  toolbar: {
    visible: boolean;
    enter: boolean;
  };
  sortInfo: [];
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
