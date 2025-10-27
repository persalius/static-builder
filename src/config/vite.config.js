import { defineConfig } from "vite";
import path from "path";
import fs from "fs";
import { paths } from "./paths.js";
import plugins from "../plugins/index.js";

function getHtmlInputs(rootDir) {
  const files = fs.readdirSync(rootDir).filter((f) => f.endsWith(".html"));

  // Исключаем html файлы, начинающиеся с "_"
  const htmlFiles = files.filter((f) => !f.startsWith("_"));

  const inputs = {};
  htmlFiles.forEach((file) => {
    const name = path.basename(file, ".html");
    inputs[name] = path.resolve(rootDir, file);
  });

  return inputs;
}

export default defineConfig({
  root: paths.landingPage,
  plugins,
  build: {
    outDir: path.resolve(paths.builderRoot, "dist"),
    emptyOutDir: true,
    // Rollup settings for multiple HTML entry points
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
