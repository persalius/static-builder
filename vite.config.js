import { defineConfig } from "vite";
import path from "path";
import { paths } from "./paths.js";
import plugins from "./plugins/index.js";

export default defineConfig({
  // Устанавливаем root в папку landing page
  root: paths.landingPage,

  // Подключаем плагины
  plugins: [...plugins],

  // Настройки сборки
  build: {
    // Выходная папка относительно корня проекта landing-builder
    outDir: path.resolve(paths.builderRoot, "dist"),
    // Очищать папку при каждой сборке
    emptyOutDir: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
});
