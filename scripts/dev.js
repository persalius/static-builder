import { createServer } from "vite";
import fs from "fs";
import { paths } from "../paths.js";
import viteConfig from "../vite.config.js";

async function startDev() {
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

    console.log("🚀 Starting dev server...");

    // Создаем dev сервер
    const server = await createServer(viteConfig);

    await server.listen();

    server.printUrls();
    console.log("🚀 Landing builder dev server started!");
  } catch (error) {
    console.error("❌ Failed to start dev server:", error);
    process.exit(1);
  }
}

startDev();
