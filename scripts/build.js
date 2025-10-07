import { build } from "vite";
import { paths } from "../paths.js";
import viteConfig from "../vite.config.js";
import fs from "fs";

async function buildProject() {
  try {
    // Проверяем существование необходимых папок
    if (!fs.existsSync(paths.landingPage)) {
      console.error(`❌ Landing page not found: ${paths.landingPage}`);
      process.exit(1);
    }

    if (!fs.existsSync(paths.templates)) {
      console.error(`❌ Templates not found: ${paths.templates}`);
      process.exit(1);
    }

    // Запускаем сборку
    await build(viteConfig);
    console.log("✅ Build completed successfully!");
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

buildProject();
