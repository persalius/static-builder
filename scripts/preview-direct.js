import { execSync } from "child_process";
import { paths } from "../paths.js";
import fs from "fs";
import path from "path";
import { ensureDependencies, validateVitePath } from "../utils/dependencies.js";

function startPreviewDirect() {
  try {
    // Проверяем существование папки dist
    if (!fs.existsSync(paths.dist)) {
      console.error(`❌ Build not found: ${paths.dist}`);
      console.log("💡 Please run 'npm run build:direct' first");
      process.exit(1);
    }

    console.log("🔍 Starting preview server using Vite from landing page...");

    // Автоматически проверяем и устанавливаем зависимости
    const vitePath = ensureDependencies();

    // Проверяем безопасность пути
    validateVitePath(vitePath);

    // Запускаем Vite preview с мерженым конфигом (landing page + builder)
    const mergedConfigPath = path.resolve(
      paths.builderRoot,
      "vite.config.merged.js"
    );
    const command = `"${vitePath}" preview --config "${mergedConfigPath}"`;

    console.log(`Running: ${command}`);
    console.log(`📝 Using merged config: landing page + builder`);

    execSync(command, {
      stdio: "inherit",
      cwd: paths.landingPage,
    });
  } catch (error) {
    console.error("❌ Failed to start preview server:", error);
    process.exit(1);
  }
}

startPreviewDirect();
