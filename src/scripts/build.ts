import { build } from "vite";
import fs from "fs";
import { paths } from "@/config/paths.js";
import viteConfig from "@/config/vite.config.js";
import { ensureDependencies } from "@/utils/dependencies.js";

async function buildProject() {
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

    console.log("🚀 Starting build...");
    await build(viteConfig);
    console.log("✅ Build completed successfully!");
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

buildProject();
