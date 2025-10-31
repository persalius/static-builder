import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";
import type { Plugin } from "vite";
import { paths } from "@/config/paths.js";
import { attributeTemplateName, virtualScssId } from "@/constants/templates.js";
import { TemplatesContext } from "./context.js";

const fileTemplatesCache = new Map();

export const scanSingleHtmlFile = (htmlPath: string) => {
  const templates = new Set();
  try {
    const htmlContent = fs.readFileSync(htmlPath, "utf-8");
    const $ = cheerio.load(htmlContent);
    $(`[${attributeTemplateName}]`).each((_, el) => {
      const templateName = $(el).attr("data-template");
      if (templateName) templates.add(templateName);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("Error scanning HTML file:", message);
  }
  return templates;
};

export const getAllCacheTemplates = (): Set<string> =>
  new Set([...fileTemplatesCache.values()].flatMap((set) => [...set]));

export const templatesTrackingPlugin = (context: TemplatesContext): Plugin => {
  return {
    name: "templates-tracking-plugin",
    enforce: "pre",

    configResolved() {
      const htmlFiles = fs
        .readdirSync(paths.landingPage, { withFileTypes: true })
        .filter((d) => d.isFile() && d.name.endsWith(".html"))
        .map((d) => path.join(paths.landingPage, d.name));
      htmlFiles.forEach((file) => {
        fileTemplatesCache.set(file, scanSingleHtmlFile(file));
      });
      context.setUsedTemplates(getAllCacheTemplates());
    },

    configureServer(server) {
      if (fs.existsSync(paths.landingPage)) {
        server.watcher.add(paths.landingPage); // Отслеживаем изменения HTML файлов
      }

      server.watcher.on("change", (filePath) => {
        const isInLandingPage = filePath.startsWith(paths.landingPage);
        const isHtmlFile = filePath.endsWith(".html");

        if (isInLandingPage && isHtmlFile) {
          fileTemplatesCache.set(filePath, scanSingleHtmlFile(filePath));
          const allCurrentTemplates = getAllCacheTemplates();

          const newTemplatesStr = [...allCurrentTemplates].sort().join(",");
          const oldTemplatesStr = [...context.usedTemplates].sort().join(",");

          if (oldTemplatesStr !== newTemplatesStr) {
            context.setUsedTemplates(allCurrentTemplates);

            const module = server.moduleGraph.getModuleById(virtualScssId);
            if (module) {
              server.reloadModule(module);
            }
          }
        }
      });
    },
  };
};
