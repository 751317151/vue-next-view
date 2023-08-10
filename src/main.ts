import { createApp } from "vue";
import App from "./App.vue";
import router from "@/router";
import pinia from "@/stores/index";
import registerIcons from "@/utils/registerIcons";
import $ from "jquery";
import ElementPlus from "element-plus";

//引入css
import "./assets/css/animation.css";
import "./assets/css/index.css";
import "./assets/css/tocbot.css";
import "./assets/css/color.css";
import "./assets/css/markdown-highlight.css";
import "./assets/css/font-awesome.min.css";

import "element-plus/theme-chalk/index.css";
// import "element-plus/theme-chalk/dark/css-vars.css"; //这句是暗黑模式切换

//阿里icon
import "@/assets/css/icon/iconfont.css";

import "virtual:svg-icons-register";

createApp(App)
  .use(pinia)
  .use(router)
  .use($)
  .use(ElementPlus)
  .use(registerIcons)
  .mount("#app");
