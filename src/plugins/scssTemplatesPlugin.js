import path from "path";
import fs from "fs";
import {
  virtualScssId,
  virtualScssImport,
  mainJsPath,
  templateConfigPath,
} from "../constants/templates.js";

export const scssTemplatesPlugin = (context) => {
  return {
    name: "scss-templates",
    enforce: "post",

    transform(code, id) {
      if (!id.endsWith(mainJsPath)) return null;
      if (code.includes(virtualScssImport)) return null;

      const newCode = `${virtualScssImport};\n` + code;
      return { code: newCode, map: null };
    },

    resolveId(id) {
      if (id === virtualScssId) return id;
    },

    load(id) {
      if (id === virtualScssId) {
        if (!context.usedTemplates?.size) return "";

        const imports = Array.from(context.usedTemplates)
          .map((templateName) => {
            const templatePath = context.getTemplatePath(templateName);
            if (!templatePath) return null;

            const templateJsonPath = path.join(
              templatePath,
              templateConfigPath
            );
            if (!fs.existsSync(templateJsonPath)) return null;

            const { styles } = JSON.parse(
              fs.readFileSync(templateJsonPath, "utf-8")
            );
            if (!styles.length) return null;

            // Подключаем каждый SCSS с templateName как namespace
            return styles
              .map((file) => {
                const abs = path.join(templatePath, file);
                const rel = path
                  .relative(process.cwd(), abs)
                  .replace(/\\/g, "/");
                return `@use "${rel}" as ${templateName};`;
              })
              .join("\n");
          })
          .filter(Boolean)
          .join("\n");
        return imports;
      }
    },
  };
};
