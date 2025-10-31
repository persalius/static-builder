import { execSync } from "child_process";
import { paths } from "@/config/paths.js";
import fs from "fs";
import path from "path";

export const checkDependencies = () => {
  const packageJsonPath = path.resolve(paths.landingPage, "package.json");
  const nodeModulesPath = path.resolve(paths.landingPage, "node_modules");

  if (!fs.existsSync(packageJsonPath)) {
    console.log(`❌ package.json not found in ${paths.landingPage}`);
    return false;
  }

  const isNeedInstall = !fs.existsSync(nodeModulesPath);
  return isNeedInstall;
};

export const installDependencies = () => {
  console.log("📦 Installing dependencies in landing page...");
  try {
    execSync("npm install", {
      cwd: paths.landingPage,
      stdio: "inherit",
    });
    console.log("✅ Dependencies installed successfully!");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ Failed to install dependencies:", message);
    process.exit(1);
  }
};

export function ensureDependencies() {
  const needsInstallation = checkDependencies();

  if (needsInstallation) {
    installDependencies();
  }
}
