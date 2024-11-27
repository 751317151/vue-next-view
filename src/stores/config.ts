/*
 * @Author: 华豪 huah@sunwayworld.com
 * @Date: 2024-07-18 10:28:47
 * @LastEditors: 华豪 huah@sunwayworld.com
 * @LastEditTime: 2024-11-27 16:30:46
 * @FilePath: \vue-next-view\src\stores\config.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineStore } from "pinia";

export const useConfig = defineStore("config", {
  state: () => ({
    toolbar: {
      visible: true,
      enter: false,
    },
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
      avatar:
        "https://blackstar.s3.bitiful.net/img/userinfo/luffy.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=14Cj69yjeDqxvrg7yRPHj2AP%2F20241127%2F%2Fs3%2Faws4_request&X-Amz-Date=20241127T082543Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&x-id=GetObject&X-Amz-Signature=eb95285ee92ff18ba32b2afd546dd915ad8da106120ebfb9b45c10ee908ed7b8",
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
