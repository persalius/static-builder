import { createServer } from "vite";
import fs from "fs";
import {paths} from "@/config/paths.js";
import viteConfig from "@/config/vite.config.js";
import { ensureDependencies } from "@/utils/dependencies.js";

async function startDev() {
  try {
    if (!fs.existsSync(paths.landingPage)) {
      console.error(`❌ Landing page not found: ${paths.landingPage}`);
      process.exit(1);
    }

    if (!fs.existsSync(paths.templates)) {
      console.error(`❌ Templates not found: ${paths.templates}`);
      process.exit(1);
    }

    ensureDependencies();

    console.log("🚀 Starting dev server...");
    const server = await createServer(viteConfig);
    await server.listen();
    server.printUrls();
    console.log("✅ Landing builder dev server started!");
  } catch (error) {
    console.error("❌ Failed to start dev server:", error);
    process.exit(1);
  }
}

startDev();
