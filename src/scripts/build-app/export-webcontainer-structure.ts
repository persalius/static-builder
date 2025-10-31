import fs from "fs";
import path from "path";
import { WebcontainerStructure } from "../../types/webContainer.js";

const destDir = path.resolve("build");
const outputFile = path.resolve("build/webcontainer-structure.js");

function readDirRecursive(dir: string): WebcontainerStructure {
  const result: WebcontainerStructure = {};
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith(".")) {
      continue;
    }

    const fullPath = path.join(dir, name);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      result[name] = { directory: readDirRecursive(fullPath) };
    } else {
      const contents = fs.readFileSync(fullPath, "utf8");
      result[name] = { file: { contents } };
    }
  }
  return result;
}

const structure = {
  "landing-parser": {
    directory: {
      ...readDirRecursive(destDir),
      ".env": {
        file: {
          contents: "LANDING_PAGE_PATH=../landing\nTEMPLATES_PATH=../templates",
        },
      },
    },
  },
};

const jsModule = `export default ${JSON.stringify(structure, null, 2)};\n`;
fs.writeFileSync(outputFile, jsModule);
console.log("✅ webcontainer-structure.js generated");
