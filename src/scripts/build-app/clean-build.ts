import fs from "fs";
import path from "path";

const destDir = path.resolve("build");

if (fs.existsSync(destDir)) {
  await fs.promises.rm(destDir, { recursive: true, force: true });
}
