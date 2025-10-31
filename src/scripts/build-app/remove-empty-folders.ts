import fs from "fs";
import path from "path";

function removeEmptyDirs(dir: string) {
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    if (fs.statSync(fullPath).isDirectory()) {
      removeEmptyDirs(fullPath);
      if (!fs.readdirSync(fullPath).length) {
        fs.rmdirSync(fullPath);
        console.log(`🧹 Removed empty folder: ${fullPath}`);
      }
    }
  }
}

removeEmptyDirs(path.resolve("build/src"));
