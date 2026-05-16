import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

///element ui
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // 將 tableau-viz 視為自訂元素
          isCustomElement: tag => tag === 'tableau-viz'
        }
      }
    }),
    ///element ui
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    ///element ui
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // 👇 幫你加上的 Sass 警告隱藏設定
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler', // 解決 legacy-js-api 警告
        silenceDeprecations: [
          'import',
          'global-builtin',
          'color-functions',
          'if-function'
        ], // 隱藏 Bootstrap 引起的相關警告
      },
    },
  },
  // 👆 加到這邊結束
});