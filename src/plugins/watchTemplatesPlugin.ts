import fs from "fs";
import path from "path";
import type { Plugin } from "vite";
import { paths } from "@/config/paths.js";
import { templateConfigFile } from "@/constants/templates.js";
import { TemplatesContext } from "./context.js";

export const watchTemplatesPlugin = (context: TemplatesContext): Plugin => {
  return {
    name: "watch-templates-plugin",
    configureServer(server) {
      // Проверяем существование директории шаблонов
      if (fs.existsSync(paths.templates)) {
        server.watcher.add(paths.templates);
      }

      server.watcher.on("change", (file) => {
        if (file.startsWith(paths.templates)) {
          // Обновляем индекс для изменённой папки
          const folderName = path.relative(paths.templates, path.dirname(file));
          const jsonPath = path.join(paths.templates, folderName, templateConfigFile);
          if (fs.existsSync(jsonPath)) {
            const { name } = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
            if (name) {
              context.updateTemplatesIndex({ name, folderName });
            }
          }

          // Сообщаем Vite обновить страницу
          server.ws.send({
            type: "full-reload",
            path: "*",
          });
        }
      });
    },
  };
};
