import { TemplatesContext } from "./context.js";
import { templatesTrackingPlugin } from "./templatesTrackingPlugin.js";
import { watchTemplatesPlugin } from "./watchTemplatesPlugin.js";
import { htmlTemplatesPlugin } from "./htmlTemplatesPlugin.js";
import { scssTemplatesPlugin } from "./scssTemplatesPlugin.js";
import { jsTemplatePlugin } from "./jsTemplatePlugin.js";

const context: TemplatesContext = new TemplatesContext();

export default [
  templatesTrackingPlugin(context),
  watchTemplatesPlugin(context),
  htmlTemplatesPlugin(context),
  scssTemplatesPlugin(context),
  jsTemplatePlugin(context),
];
