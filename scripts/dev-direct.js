import { execSync } from "child_process";
import { paths } from "../paths.js";
import fs from "fs";
import path from "path";
import { ensureDependencies, validateVitePath } from "../utils/dependencies.js";

function startDevDirect() {
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

    console.log("🚀 Starting dev server using Vite from landing page...");

    // Автоматически проверяем и устанавливаем зависимости
    const vitePath = ensureDependencies();

    // Проверяем безопасность пути
    validateVitePath(vitePath);

    // Запускаем Vite с мерженым конфигом (landing page + builder)
    const mergedConfigPath = path.resolve(
      paths.builderRoot,
      "vite.config.merged.js"
    );
    const command = `"${vitePath}" --config "${mergedConfigPath}"`;

    console.log(`Running: ${command}`);
    console.log(`📝 Using merged config: landing page + builder`);

    execSync(command, {
      stdio: "inherit",
      cwd: paths.landingPage,
    });
  } catch (error) {
    console.error("❌ Failed to start dev server:", error);
    process.exit(1);
  }
}

startDevDirect();
