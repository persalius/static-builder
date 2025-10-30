import path from "path";
import fs from "fs";
import { paths } from "../config/paths.js";
import { templateConfigFile } from "../constants/templates.js";

export const jsTemplatePlugin = (context) => {
  return {
    name: "js-template-plugin",
    enforce: "pre",

    generateBundle(options, bundle) {
      const configPath = paths.appConfig;
      let gtmId = "";
      if (fs.existsSync(configPath)) {
        gtmId = JSON.parse(fs.readFileSync(configPath, "utf-8")).gtmId || "";
      }

      Object.entries(bundle).forEach(([fileName, chunk]) => {
        if (chunk.type === "chunk" && fileName.includes("/custom")) {
          // GTM
          // Заменяем {{gtmId}} на реальный gtmId в custom/gtm.js
          if (fileName.includes("custom/gtm")) {
            chunk.code = chunk.code.replace(/{{gtmId}}/g, gtmId);
          }
        }
      });
    },

    buildStart(opts) {
      // Добавляем JS файлы шаблонов
      if (!fs.existsSync(paths.templates)) {
        return;
      }

      const usedTemplates = context.usedTemplates;
      const inputs = {};

      for (const templateName of usedTemplates) {
        const templatePath = context.getTemplatePath(templateName);
        if (!templatePath) continue;

        const jsonPath = path.join(templatePath, templateConfigFile);
        if (!fs.existsSync(jsonPath)) continue;

        try {
          const templateConfig = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
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
          console.warn(`Error reading ${templateConfigFile} for ${templateName}:`, error.message);
        }
      }

      // GTM
      const configPath = paths.appConfig;
      let gtmId = "";

      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        gtmId = config.gtmId || "";
      }

      if (gtmId) {
        inputs["custom/gtm"] = path.resolve(process.cwd(), "src/custom-landing-scripts/gtm.js");
      }

      // Добавляем найденные файлы как входные точки
      if (Object.keys(inputs).length) {
        opts.input = {
          ...(typeof opts.input === "string" ? { main: opts.input } : (opts.input ?? {})),
          ...inputs,
        };
      }
    },

    configureServer(server) {
      // Middleware для добавление кастомных JS файлов в dev режиме
      server.middlewares.use("/custom", async (req, res, next) => {
        // GTM
        if (req.url.includes("gtm.js")) {
          try {
            const gtmScriptPath = path.resolve(process.cwd(), "src/custom-landing-scripts/gtm.js");
            await fs.promises.access(gtmScriptPath);
            let content = await fs.promises.readFile(gtmScriptPath, "utf-8");
            const configPath = paths.appConfig;
            let gtmId = "";
            if (fs.existsSync(configPath)) {
              gtmId = JSON.parse(fs.readFileSync(configPath, "utf-8")).gtmId || "";
            }
            content = content.replace(/{{gtmId}}/g, gtmId);
            res.setHeader("Content-Type", "application/javascript; charset=utf-8");
            res.setHeader("Cache-Control", "no-cache");
            res.end(content);
            return;
          } catch (error) {
            res.statusCode = 404;
            res.end("File not found");
            return next();
          }
        }
      });

      // Middleware для обслуживания JS файлов шаблонов в dev режиме
      server.middlewares.use("/templates", async (req, res, next) => {
        const requestedPath = decodeURIComponent(req.url);
        const pathParts = requestedPath.split("/").filter(Boolean);
        if (pathParts.length < 2) return next();

        const templateName = pathParts[0];
        const relativeFilePath = pathParts.slice(1).join("/");

        const templatePath = context.getTemplatePath(templateName);
        if (!templatePath) return next();

        const templateJsonPath = path.join(templatePath, templateConfigFile);
        try {
          await fs.promises.access(templateJsonPath);
          const templateConfig = JSON.parse(await fs.promises.readFile(templateJsonPath, "utf-8"));

          let filePath;
          if (relativeFilePath.startsWith("js/")) {
            const requestedFileName = path.basename(relativeFilePath);
            const script = templateConfig.scripts?.find(
              (s) => path.basename(s.file) === requestedFileName,
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
