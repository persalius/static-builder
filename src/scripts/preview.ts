import { preview } from "vite";
import fs from "fs";
import { paths } from "@/config/paths.js";
import viteConfig from "@/config/vite.config.js";

async function startPreview() {
  try {
    if (!fs.existsSync(paths.dist)) {
      console.error(`❌ Build not found: ${paths.dist}`);
      console.log("💡 Please run 'npm run build' first");
      process.exit(1);
    }

    console.log("🚀 Starting preview server...");
    const server = await preview(viteConfig);
    server.printUrls();
    console.log("✅ Preview server started!");
  } catch (error) {
    console.error("❌ Failed to start preview server:", error);
    process.exit(1);
  }
}

startPreview();
