import fs from "fs";
import path from "path";
import type { Plugin } from "vite";
import * as cheerio from "cheerio";
import { paths } from "@/config/paths.js";
import { attributeTemplateName, templateConfigFile } from "@/constants/templates.js";
import { TemplateConfig } from "@/types/template.js";
import { TemplatesContext } from "./context.js";

type ContainerType = "head" | "body";
type ScriptsMap = {
  [key in ContainerType]: { start: string[]; end: string[] };
} & { comment: Record<string, string> };

export const htmlTemplatesPlugin = (context: TemplatesContext): Plugin => {
  let isProduction = false;
  const bundleInfo = new Map(); // пути к скриптам из templates в dist папке

  return {
    name: "html-template-plugin",
    enforce: "pre",

    configResolved(config: any) {
      isProduction = config.command === "build";
    },

    generateBundle(options, bundle) {
      // Необходимо для сбора JS файлов из templates
      // Собираем информацию о сгенерированных файлах
      Object.entries(bundle).forEach(([fileName, chunk]) => {
        if (chunk.type === "chunk" && fileName.includes("templates/")) {
          const originalPath = chunk.facadeModuleId;
          if (originalPath) {
            bundleInfo.set(originalPath, fileName);
          }
        }
      });
    },

    transformIndexHtml(html: string) {
      const $ = cheerio.load(html);

      const scriptsMap: ScriptsMap = {
        head: { start: [], end: [] },
        body: { start: [], end: [] },
        comment: {},
      };
      const uniqueScripts = new Set();

      $(`[${attributeTemplateName}]`).each((_, el) => {
        const templateName = $(el).attr(attributeTemplateName) || "";
        const templatePath = context.getTemplatePath(templateName);
        if (!templatePath) return;

        const templateJsonPath = path.join(templatePath, templateConfigFile);
        if (!fs.existsSync(templateJsonPath)) return;

        const templateConfig: TemplateConfig = JSON.parse(
          fs.readFileSync(templateJsonPath, "utf-8"),
        );

        // HTML
        const templateHtmlPath = path.join(templatePath, templateConfig.entry);
        if (fs.existsSync(templateHtmlPath)) {
          let templateHtml = fs.readFileSync(templateHtmlPath, "utf-8");

          const attrs = $(el).attr();
          if (attrs) {
            Object.keys(attrs).forEach((key) => {
              if (key === attributeTemplateName) return;
              const cleanKey = key.startsWith("data-") ? key.slice(5) : key;
              const regex = new RegExp(`{{\\s*${cleanKey}\\s*}}`, "g");
              templateHtml = templateHtml.replace(regex, attrs[key]);
            });
          }

          $(el).replaceWith(templateHtml);
        }

        // JS
        if (templateConfig.scripts) {
          templateConfig.scripts.forEach(({ file, container, position, targetComment }) => {
            const fileName = path.basename(file, ".js");

            let scriptSrc = "";
            if (isProduction) {
              const originalFilePath = path.join(templatePath, file);
              const bundledFilePath = bundleInfo.get(originalFilePath) || "";
              if (bundledFilePath) {
                scriptSrc = `/${bundledFilePath}`;
              }
            } else {
              scriptSrc = `/templates/${templateName}/js/${fileName}.js`;
            }

            if (!scriptSrc || uniqueScripts.has(scriptSrc)) return;
            uniqueScripts.add(scriptSrc);

            const scriptTag = `<script src="${scriptSrc}"></script>`;

            if (position === "end") {
              container && scriptsMap[container].end.push(scriptTag);
            } else if (position === "start") {
              container && scriptsMap[container].start.push(scriptTag);
            } else if (position === "comment") {
              targetComment && (scriptsMap.comment[targetComment] = scriptTag);
            }
          });
        }
      });

      // JS - добавляем скрипты шаблонов в HTML
      scriptsMap.head.start.reverse().forEach((scriptTag) => {
        $("head").prepend(scriptTag);
      });

      scriptsMap.head.end.forEach((scriptTag) => {
        $("head").append(scriptTag);
      });

      scriptsMap.body.start.reverse().forEach((scriptTag) => {
        $("body").prepend(scriptTag);
      });

      scriptsMap.body.end.forEach((scriptTag) => {
        $("body").append(scriptTag);
      });

      Object.entries(scriptsMap.comment).forEach(([commentName, scriptTag]) => {
        ["head", "body"].forEach((container) => {
          const $container = $(container);
          $container.contents().each((_, node) => {
            if (node.type === "comment" && node.data.trim() === commentName) {
              $(node).replaceWith(scriptTag);
            }
          });
        });
      });

      // GTM
      const configPath = paths.appConfig;
      let gtmId = "";

      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        gtmId = config.gtmId || "";
      }

      if (gtmId) {
        // gtm script
        const gtmRawPath = path.resolve(process.cwd(), "src/custom-landing-scripts/gtm.js");
        const gtmRawScript = fs.readFileSync(gtmRawPath, "utf-8").replace(/{{gtmId}}/g, gtmId);
        $("head").prepend(`<script>${gtmRawScript}</script>`);

        // gtm consent script
        const gtmConsentRawPath = path.resolve(
          process.cwd(),
          "src/custom-landing-scripts/gtm-consent.js",
        );
        const gtmConsentRawScript = fs.readFileSync(gtmConsentRawPath, "utf-8");
        $("head").prepend(`<script>${gtmConsentRawScript}</script>`);

        // gtm noscript
        const noscriptHtml = `
            <noscript>
              <iframe
                src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
                height="0"
                width="0"
                style="display:none;visibility:hidden"
              ></iframe>
            </noscript>
        `;
        $("body").prepend(noscriptHtml);
        // cookie banner
        $("body").append("<script src='https://cookies.volsor.com/index.js'></script>");
      }

      return $.html();
    },
  };
};
