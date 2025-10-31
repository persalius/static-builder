import path from "path";
import fs from "fs";
import type { Plugin } from "vite";
import { paths } from "@/config/paths.js";
import { TemplateConfig } from "@/types/template.js";
import { templateConfigFile } from "@/constants/templates.js";
import { TemplatesContext } from "./context.js";

export const jsTemplatePlugin = (context: TemplatesContext): Plugin => {
  return {
    name: "js-template-plugin",
    enforce: "pre",

    buildStart(opts) {
      // Добавляем JS файлы шаблонов
      if (!fs.existsSync(paths.templates)) {
        return;
      }

      const usedTemplates = context.usedTemplates;
      const inputs: Record<string, string> = {};

      for (const templateName of usedTemplates) {
        const templatePath = context.getTemplatePath(templateName);
        if (!templatePath) continue;

        const jsonPath = path.join(templatePath, templateConfigFile);
        if (!fs.existsSync(jsonPath)) continue;

        try {
          const templateConfig: TemplateConfig = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
          const { scripts } = templateConfig;
          if (!scripts) continue;

          scripts.forEach(({ file }) => {
            const sourcePath = path.join(templatePath, file);
            if (!fs.existsSync(sourcePath)) return;

            const fileName = path.basename(file, ".js");
            const inputKey = `templates/${templateName}/js/${fileName}`;
            inputs[inputKey] = sourcePath;
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.warn(`Error reading ${templateConfigFile} for ${templateName}:`, message);
        }
      }
    },

    configureServer(server) {
      // Middleware для обслуживания JS файлов шаблонов в dev режиме
      server.middlewares.use("/templates", async (req, res, next) => {
        const requestedPath = decodeURIComponent(req.url || "");
        const pathParts = requestedPath.split("/").filter(Boolean);
        if (pathParts.length < 2) return next();

        const templateName = pathParts[0];
        const relativeFilePath = pathParts.slice(1).join("/");

        const templatePath = context.getTemplatePath(templateName);
        if (!templatePath) return next();

        const templateJsonPath = path.join(templatePath, templateConfigFile);
        try {
          await fs.promises.access(templateJsonPath);
          const templateConfig: TemplateConfig = JSON.parse(
            await fs.promises.readFile(templateJsonPath, "utf-8"),
          );

          let filePath;
          if (relativeFilePath.startsWith("js/")) {
            const requestedFileName = path.basename(relativeFilePath);
            const script = templateConfig.scripts?.find(
              (script) => path.basename(script.file) === requestedFileName,
            );
            if (script) {
              filePath = path.join(templatePath, script.file);
            } else {
              return next();
            }
          } else {
            filePath = path.join(templatePath, relativeFilePath);
          }

          await fs.promises.access(filePath);
          const content = await fs.promises.readFile(filePath, "utf-8");
          let contentType = "text/plain";
          if (filePath.endsWith(".js")) {
            contentType = "application/javascript; charset=utf-8";
          }
          res.setHeader("Content-Type", contentType);
          res.setHeader("Cache-Control", "no-cache");
          res.end(content);
          return;
        } catch (error) {
          res.statusCode = 404;
          res.end("File not found");
          return next();
        }
      });
    },
  };
};
