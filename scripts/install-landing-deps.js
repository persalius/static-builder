import { ensureDependencies } from "../utils/dependencies.js";

function installLandingDependencies() {
  try {
    console.log("🔧 Installing dependencies for landing page...");

    ensureDependencies(true);

    console.log("🎉 Landing page dependencies installed successfully!");
  } catch (error) {
    console.error("❌ Failed to install dependencies:", error.message);
    process.exit(1);
  }
}

installLandingDependencies();
