import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path, { resolve } from "path";
import inject from "@rollup/plugin-inject";

// 自动导入vue中hook reactive ref等
import AutoImport from "unplugin-auto-import/vite";
//自动导入ui-组件 比如说ant-design-vue  element-plus等
import Components from "unplugin-vue-components/vite";
//element
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";

// 自定义svg
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  plugins: [
    vue(),
    //element按需导入
    AutoImport({
      //安装两行后你会发现在组件中不用再导入ref，reactive等
      imports: ["vue", "vue-router"],
      dts: "src/auto-import.d.ts",
      //element
      resolvers: [
        ElementPlusResolver(),
        // 自动导入图标组件
        IconsResolver({
          prefix: "Icon",
        }),
      ],
    }),
    Components({
      //element
      resolvers: [
        ElementPlusResolver(),
        // 自动注册图标组件
        IconsResolver({
          enabledCollections: ["ep"], // element-plus 图标库
        }),
      ],
      //默认存放位置
      //dts: "src/components.d.ts",
    }),
    Icons({
      autoInstall: true,
    }),
    inject({
      $: "jquery", // 这里会自动载入 node_modules 中的 jquery   jquery全局变量
      jQuery: "jquery",
      "windows.jQuery": "jquery",
    }),
    createSvgIconsPlugin({
      iconDirs: [resolve(process.cwd(), "src/assets/svg")],
      symbolId: "icon-[dir]-[name]",
    }),
  ],
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'element-plus',
      'element-plus/es',
      'element-plus/es/components/button/style/css',
      'element-plus/es/components/message/style/css',
      'element-plus/es/components/image/style/css',
      'element-plus/es/components/pagination/style/css',
      '@element-plus/icons-vue',
      'highlight.js/lib/core',
      'jquery',
      'aos',
      '@kangc/v-md-editor/lib/preview',
      '@kangc/v-md-editor/lib/theme/github.js',
    ],
    // 排除不需要预构建的
    exclude: [],
  },
  // 构建优化
  build: {
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // chunk 大小警告限制
    chunkSizeWarningLimit: 1500,
  },
  server: {
    port: 8080,
    host: "0.0.0.0",
    // 预热常用文件
    warmup: {
      clientFiles: [
        './src/main.ts',
        './src/App.vue',
        './src/views/home/Home.vue',
        './src/components/ArticleList.vue',
      ],
    },
  },
  base: "/",
});
