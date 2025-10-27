import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../../");

dotenv.config({ path: path.resolve(projectRoot, ".env") });

if (!process.env.LANDING_PAGE_PATH) {
  throw new Error("❌ LANDING_PAGE_PATH not found in .env file");
}
if (!process.env.TEMPLATES_PATH) {
  throw new Error("❌ TEMPLATES_PATH not found in .env file");
}

const landingPage = path.resolve(projectRoot, process.env.LANDING_PAGE_PATH);
const templates = path.resolve(projectRoot, process.env.TEMPLATES_PATH);

export const paths = {
  builderRoot: projectRoot,
  landingPage,
  templates,
  dist: path.resolve(projectRoot, "./dist"),
  viteConfig: path.resolve(projectRoot, "./vite.config.js"),
  plugins: path.resolve(projectRoot, "./src/plugins"),
};
