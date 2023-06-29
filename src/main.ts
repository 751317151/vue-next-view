import { createApp } from "vue";
import App from "./App.vue";
import router from "@/router";
import pinia from "@/stores/index";
import registerIcons from "@/utils/registerIcons";
import $ from "jquery";

//引入css
import "./assets/css/animation.css";
import "./assets/css/index.css";
import "./assets/css/tocbot.css";
import "./assets/css/color.css";
import "./assets/css/markdown-highlight.css";
import "./assets/css/font-awesome.min.css";

//阿里icon
import "@/assets/css/icon/iconfont.css";

createApp(App).use(pinia).use(router).use($).use(registerIcons).mount("#app");
