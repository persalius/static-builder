import { defineConfig } from "vite";
import path from "path";
import fs from "fs";
import { paths } from "./paths.js";
import plugins from "../plugins/index.js";

function getHtmlInputs(rootDir) {
  const files = fs.readdirSync(rootDir).filter((f) => f.endsWith(".html"));

  // Исключаем файлы, начинающиеся с "_"
  const htmlFiles = files.filter((f) => !f.startsWith("_"));

  const inputs = {};
  htmlFiles.forEach((file) => {
    const name = path.basename(file, ".html");
    inputs[name] = path.resolve(rootDir, file);
  });

  return inputs;
}

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
    // Настройки Rollup для множественных HTML точек входа
    rollupOptions: {
      input: getHtmlInputs(paths.landingPage),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
});
