import { defineStore } from "pinia";

export const useConfig = defineStore("config", {
  state: () => ({
    toolbar: {
      visible: true,
      enter: false,
    },
    showToolButton: false,
    aaa: true,
    sortInfo: [],
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
    loadSortInfo(sortInfo) {
      if (sortInfo !== null && sortInfo.length !== 0) {
        this.sortInfo = sortInfo.sort((s1, s2) => s1.priority - s2.priority);
      }
    },
  },
});
