import { defineStore } from "pinia";

export const useConfig = defineStore("config", {
  state: () => ({
    toolbar: {
      visible: true,
      enter: false,
    },
    showToolButton: false,
    aaa: true,
    Categories: new Array<Category>(),
    Tags: new Array<Tag>(),
    currentUser: {},
    currentAdmin: {},
    webInfo: {
      webName: "",
      webTitle: [],
      notices: [],
      footer: "",
      backgroundImage: "",
      avatar: "https://haiyong.site/img/favicon.png",
    },
    scrollTop: 0,
    sideNavBarShow: false,
    isMobile: false,
    showToc: true, // 展示文章目录
  }),
  actions: {
    changeToolbarStatus(toolbar) {
      this.toolbar = toolbar;
    },
    changeTocStatus() {
      this.showToc = !this.showToc;
    },
    changeAaa() {
      this.toolbar.visible = !this.toolbar.visible;
      console.log(this.toolbar.visible);
    },
    onScrollPage() {
      this.scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
    },
    getCategories(Categories: Array<Category>) {
      if (Categories !== null && Categories.length !== 0) {
        this.Categories = Categories;
      }
    },
    getTags(Tags: Array<Tag>) {
      this.Tags = Tags;
    },
  },
});
