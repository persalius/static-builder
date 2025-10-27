import fs from "fs";
import path from "path";
import { templateConfigFile } from "../constants/templates.js";

export const buildTemplatesIndex = (dir) => {
  const index = new Map();

  if (!fs.existsSync(dir)) {
    console.warn(`Templates directory not found: ${dir}`);
    return index;
  }

  const folders = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory());

  folders.forEach((folder) => {
    const jsonPath = path.join(dir, folder.name, templateConfigFile);
    if (!fs.existsSync(jsonPath)) return;

    const { name } = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    if (name) {
      index.set(name, path.join(dir, folder.name));
    }
  });

  return index;
};
