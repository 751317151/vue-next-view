import { defineStore } from "pinia";

export const useConfig = defineStore("config", {
  state: () => ({
    toolbar: {
      visible: true,
      enter: true,
    },
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
      avatar: "",
    },
    scrollTop: 0,
    sideNavBarShow: false,
    //可视窗口大小
    clientSize: {
      clientHeight: 0,
      clientWidth: 1080,
    },
  }),
  actions: {
    changeToolbarStatus(toolbar) {
      this.toolbar = toolbar;
    },
    changeAaa() {
      this.toolbar.visible = !this.toolbar.visible;
      console.log(this.toolbar.visible);
    },
    onScrollPage() {
      console.log("aa");
      this.scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
    },
  },
});
