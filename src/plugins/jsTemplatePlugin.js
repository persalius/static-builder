import path from "path";
import fs from "fs";
import { paths } from "../config/paths.js";
import { templateConfigPath } from "../constants/templates.js";

export const jsTemplatePlugin = (context) => {
  return {
    name: "js-template-plugin",
    enforce: "pre",

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

        const jsonPath = path.join(templatePath, templateConfigPath);
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
          console.warn(
            `Error reading ${templateConfigPath} for ${templateName}:`,
            error.message
          );
        }
      }

      // Добавляем найденные файлы как входные точки
      if (Object.keys(inputs).length) {
        // Обновляем входные точки Rollup
        opts.input = opts.input || {};
        if (typeof opts.input === "string") {
          opts.input = { main: opts.input };
        }
        Object.assign(opts.input, inputs);
      }
    },

    configureServer(server) {
      // Middleware для обслуживания JS файлов шаблонов в dev режиме
      server.middlewares.use("/templates", (req, res, next) => {
        const requestedPath = decodeURIComponent(req.url);

        // Парсим путь: /templateName/relativePath
        const pathParts = requestedPath.split("/").filter(Boolean);
        if (pathParts.length < 2) {
          console.log("Invalid path structure");
          return next();
        }

        const templateName = pathParts[0];
        const relativeFilePath = pathParts.slice(1).join("/");

        // Получаем путь к шаблону из индекса
        const templatePath = context.getTemplatePath(templateName);
        if (!templatePath) {
          console.log(`Template not found in index: ${templateName}`);
          return next();
        }

        // Читаем конфигурацию шаблона
        const templateJsonPath = path.join(templatePath, templateConfigPath);
        if (!fs.existsSync(templateJsonPath)) {
          console.log(`Template config not found: ${templateJsonPath}`);
          return next();
        }

        let filePath;
        try {
          const templateConfig = JSON.parse(
            fs.readFileSync(templateJsonPath, "utf-8")
          );

          // Если запрашивается JS файл, ищем его в scripts
          if (relativeFilePath.startsWith("js/")) {
            const requestedFileName = path.basename(relativeFilePath);
            const script = templateConfig.scripts?.find(
              (s) => path.basename(s.file) === requestedFileName
            );

            if (script) {
              filePath = path.join(templatePath, script.file);
            } else {
              console.log(`Script not found in config: ${requestedFileName}`);
              return next();
            }
          } else {
            // Для других файлов используем прямой путь
            filePath = path.join(templatePath, relativeFilePath);
          }
        } catch (error) {
          console.error(`Error reading template config: ${error.message}`);
          return next();
        }

        if (fs.existsSync(filePath)) {
          try {
            const content = fs.readFileSync(filePath, "utf-8");

            let contentType = "text/plain";
            if (filePath.endsWith(".js")) {
              contentType = "application/javascript; charset=utf-8";
            }

            res.setHeader("Content-Type", contentType);
            res.setHeader("Cache-Control", "no-cache");
            res.end(content);
            return;
          } catch (error) {
            console.error(
              `Error serving template file ${filePath}:`,
              error.message
            );
          }
        }
        next();
      });
    },
  };
};
