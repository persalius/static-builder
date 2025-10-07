import { preview } from "vite";
import { paths } from "../paths.js";
import viteConfig from "../vite.config.js";
import fs from "fs";

async function startPreview() {
  try {
    // Проверяем существование папки dist
    if (!fs.existsSync(paths.dist)) {
      console.error(`❌ Build not found: ${paths.dist}`);
      console.log("💡 Please run 'npm run build' first");
      process.exit(1);
    }

    console.log("🔍 Starting preview server...");
    // Создаем preview сервер с настройками из .env
    const server = await preview(viteConfig);

    server.printUrls();
    console.log("🚀 Preview server started!");
  } catch (error) {
    console.error("❌ Failed to start preview server:", error);
    process.exit(1);
  }
}

startPreview();
