import { defineConfig, mergeConfig } from "vite";
import path from "path";
import fs from "fs";
import { paths } from "./paths.js";
import plugins from "./plugins/index.js";
import { fileURLToPath } from "url";

// Импортируем конфиг из landing page
async function getLandingPageConfig() {
  try {
    const landingConfigPath = path.resolve(paths.landingPage, "vite.config.js");
    // Проверяем существование файла
    if (!fs.existsSync(landingConfigPath)) {
      console.warn(
        "⚠️ No vite.config.js found in landing page, using default config"
      );
      return {};
    }
    const { default: landingConfig } = await import(
      `file://${landingConfigPath}?t=${Date.now()}`
    );
    return typeof landingConfig === "function"
      ? landingConfig()
      : landingConfig;
  } catch (error) {
    console.warn("⚠️ Error loading landing page config:", error.message);
    return {};
  }
}

// Наша конфигурация
const builderConfig = defineConfig({
  // Устанавливаем root в папку landing page
  root: paths.landingPage,

  // Подключаем наши плагины
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

// Экспортируем функцию, которая мержит конфиги
export default async () => {
  const landingConfig = await getLandingPageConfig();

  // Мержим конфигурации: landing page + builder
  const mergedConfig = mergeConfig(landingConfig, builderConfig);

  console.log("🔧 Merged Vite config from landing page and builder");

  return mergedConfig;
};
