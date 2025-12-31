import { createApp } from "vue";
import App from "./App.vue";
import router from "@/router";
import pinia from "@/stores/index";
import registerIcons from "@/utils/registerIcons";
import $ from "jquery";
import ElementPlus from "element-plus";

import VMdPreview from "@kangc/v-md-editor/lib/preview";
import "@kangc/v-md-editor/lib/style/preview.css";
import githubTheme from "@kangc/v-md-editor/lib/theme/github.js";
import "@kangc/v-md-editor/lib/theme/style/github.css";

// highlightjs - 按需加载常用语言
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import sql from "highlight.js/lib/languages/sql";
import markdown from "highlight.js/lib/languages/markdown";

// 注册常用语言
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("java", java);
hljs.registerLanguage("css", css);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("shell", bash);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("md", markdown);

VMdPreview.use(githubTheme, {
  Hljs: hljs,
});

//引入css
import "./assets/css/animation.css";
import "./assets/css/color.css";
import "./assets/css/theme.css";
import "./assets/css/index.css";
import "./assets/css/tocbot.css";
import "./assets/css/markdown-highlight.css";
import "./assets/css/font-awesome.min.css";

import "element-plus/theme-chalk/index.css";
// import "element-plus/theme-chalk/dark/css-vars.css"; //这句是暗黑模式切换

//阿里icon
import "@/assets/css/icon/iconfont.css";

import "virtual:svg-icons-register";

//页面滚动加载动画
import AOS from "aos";
import "aos/dist/aos.css";
AOS.init({
  offset: 120,
  duration: 700,
  easing: "ease-in-out-sine",
  delay: 100,
});

createApp(App)
  .use(pinia)
  .use(router)
  .use($)
  .use(ElementPlus)
  .use(VMdPreview)
  .use(registerIcons)
  .mount("#app");
