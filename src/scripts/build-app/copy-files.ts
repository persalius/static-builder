import fs from "fs";
import path from "path";

const srcDir = path.resolve("src");
const destDir = path.resolve("build/src");

const rootPkgPath = path.resolve("package.json");
const buildPkgPath = path.resolve("build/package.json");

async function main() {
  // Copy non-TypeScript and non-JavaScript files from src to build
  await fs.promises.cp(srcDir, destDir, {
    recursive: true,
    filter: (src) => {
      return !src.endsWith(".ts") && !src.endsWith(".js");
    },
  });

  // Copy and modify package.json
  const pkg = JSON.parse(fs.readFileSync(rootPkgPath, "utf8"));

  const newPkg = {
    name: pkg.name,
    version: pkg.version,
    type: pkg.type,
    dependencies: pkg.dependencies,
    scripts: {
      dev: "node src/scripts/dev.js",
      build: "node src/scripts/build.js",
      preview: "node src/scripts/preview.js",
    },
  };

  fs.writeFileSync(buildPkgPath, JSON.stringify(newPkg, null, 2));
}

main().catch((err) => {
  console.error("❌ Build error:", err);
  process.exit(1);
});
