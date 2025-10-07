import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Download .env from root directory
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Check for required variables
if (!process.env.LANDING_PAGE_PATH) {
  throw new Error("❌ LANDING_PAGE_PATH not found in .env file");
}
if (!process.env.TEMPLATES_PATH) {
  throw new Error("❌ TEMPLATES_PATH not found in .env file");
}

// Create absolute paths
const landingPage = path.resolve(__dirname, process.env.LANDING_PAGE_PATH);
const templates = path.resolve(__dirname, process.env.TEMPLATES_PATH);

export const paths = {
  // Root of the builder application
  builderRoot: path.resolve(__dirname, "."),
  // Projects from .env
  landingPage,
  templates,
  // Output folder for build
  dist: path.resolve(__dirname, "./dist"),
  // Configuration
  viteConfig: path.resolve(__dirname, "./vite.config.js"),
  // Plugins
  plugins: path.resolve(__dirname, "./plugins"),
};
