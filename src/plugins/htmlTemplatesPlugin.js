import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";
import {
  attributeTemplateName,
  templateConfigFile,
} from "../constants/templates.js";

export const htmlTemplatesPlugin = (context) => {
  let isProduction = false;
  const bundleInfo = new Map(); // пути к скриптам из templates в dist папке

  return {
    name: "html-template-plugin",
    enforce: "pre",

    configResolved(config) {
      isProduction = config.command === "build";
    },

    generateBundle(options, bundle) {
      // Необходимо для сбора JS файлов из templates
      // Собираем информацию о сгенерированных файлах
      if (isProduction) {
        Object.entries(bundle).forEach(([fileName, chunk]) => {
          if (chunk.type === "chunk" && fileName.includes("templates/")) {
            const originalPath = chunk.facadeModuleId;
            if (originalPath) {
              bundleInfo.set(originalPath, fileName);
            }
          }
        });
      }
    },

    transformIndexHtml(html) {
      const $ = cheerio.load(html);

      $("div.template").each((_, el) => {
        const templateName = $(el).attr(attributeTemplateName) || "";
        const templatePath = context.getTemplatePath(templateName);
        if (!templatePath) return;

        const templateJsonPath = path.join(templatePath, templateConfigFile);
        if (!fs.existsSync(templateJsonPath)) return;

        const templateConfig = JSON.parse(
          fs.readFileSync(templateJsonPath, "utf-8")
        );

        // HTML
        const templateHtmlPath = path.join(templatePath, templateConfig.entry);
        if (fs.existsSync(templateHtmlPath)) {
          let templateHtml = fs.readFileSync(templateHtmlPath, "utf-8");

          const attrs = $(el).attr();
          Object.keys(attrs).forEach((key) => {
            if (key === attributeTemplateName || key === "class") return;
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
            templateHtml = templateHtml.replace(regex, attrs[key]);
          });

          $(el).replaceWith(templateHtml);
        }

        // JS - добавляем скрипты в HTML
        if (templateConfig.scripts) {
          templateConfig.scripts.forEach(
            ({ file, container = "body", position = "end", targetComment }) => {
              const fileName = path.basename(file, ".js");

              let scriptSrc;
              if (isProduction) {
                const originalFilePath = path.join(templatePath, file);
                const bundledFilePath = bundleInfo.get(originalFilePath) || "";
                scriptSrc = `/${bundledFilePath}`;
              } else {
                scriptSrc = `/templates/${templateName}/js/${fileName}.js`;
              }

              const scriptTag = `<script type="module" src="${scriptSrc}"></script>`;

              if (position === "end") {
                $(container).append(scriptTag);
              } else if (position === "start") {
                $(container).prepend(scriptTag);
              } else if (position === "comment") {
                const containers = container ? [container] : ["head", "body"];
                containers.forEach((tag) => {
                  const $container = $(tag);
                  $container.contents().each((_, node) => {
                    if (
                      node.type === "comment" &&
                      node.data.trim() === targetComment
                    ) {
                      $(node).replaceWith(scriptTag);
                    }
                  });
                });
              }
            }
          );
        }
      });

      return $.html();
    },
  };
};
