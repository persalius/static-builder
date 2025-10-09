import { execSync } from "child_process";
import { paths } from "../paths.js";
import fs from "fs";
import path from "path";

/**
 * Проверяет и устанавливает зависимости в landing page проекте
 * @param {boolean} verbose - показывать подробную информацию
 * @returns {string} путь к исполняемому файлу Vite
 */
export function ensureDependencies(verbose = false) {
  const packageJsonPath = path.resolve(paths.landingPage, "package.json");
  const nodeModulesPath = path.resolve(paths.landingPage, "node_modules");

  // Проверяем существование package.json
  if (!fs.existsSync(packageJsonPath)) {
    console.error(`❌ package.json not found in ${paths.landingPage}`);
    process.exit(1);
  }

  // Читаем package.json для информации (если нужно)
  let packageJson = {};
  if (verbose) {
    try {
      packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      console.log(`📦 Project: ${packageJson.name || "Unknown"}`);
    } catch (error) {
      console.warn("⚠️ Could not read package.json details");
    }
  }

  // Если node_modules не существует, устанавливаем зависимости
  if (!fs.existsSync(nodeModulesPath)) {
    console.log("📦 Installing dependencies in landing page...");
    try {
      execSync("npm install", {
        cwd: paths.landingPage,
        stdio: "inherit",
      });
      console.log("✅ Dependencies installed successfully!");
    } catch (error) {
      console.error("❌ Failed to install dependencies:", error.message);
      process.exit(1);
    }
  }

  // Проверяем, что Vite действительно установлен
  const vitePath = path.resolve(paths.landingPage, "node_modules/.bin/vite");
  if (!fs.existsSync(vitePath)) {
    console.log("📦 Vite not found, reinstalling dependencies...");
    try {
      execSync("npm install", {
        cwd: paths.landingPage,
        stdio: "inherit",
      });
      console.log("✅ Dependencies reinstalled successfully!");
    } catch (error) {
      console.error("❌ Failed to install dependencies:", error.message);
      process.exit(1);
    }
  }

  if (verbose) {
    console.log("✅ All dependencies are ready!");
  }

  return vitePath;
}

/**
 * Проверяет существование и валидность Vite пути
 * @param {string} vitePath - путь к исполняемому файлу Vite
 */
export function validateVitePath(vitePath) {
  // Безопасность: проверяем, что путь действительно внутри ожидаемой структуры
  const normalizedLandingPath = path.resolve(paths.landingPage);
  const normalizedVitePath = path.resolve(vitePath);

  if (!normalizedVitePath.startsWith(normalizedLandingPath)) {
    console.error(`❌ Security: Vite path outside of landing page directory`);
    process.exit(1);
  }

  // Дополнительная проверка: это действительно файл, а не папка
  if (!fs.statSync(vitePath).isFile()) {
    console.error(`❌ Vite path is not a file: ${vitePath}`);
    process.exit(1);
  }
}
