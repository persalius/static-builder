import path from "path";
import { paths } from "../config/paths.js";
import { buildTemplatesIndex } from "../utils/buildTemplatesIndex.js";

export class TemplatesContext {
  constructor() {
    this.usedTemplates = new Set();
    this.templatesIndex = buildTemplatesIndex(paths.templates);
  }

  updateTemplatesIndex = ({ name, folderName }) => {
    this.templatesIndex.set(name, path.join(paths.templates, folderName));
  };

  getTemplatePath = (templateName) => {
    return this.templatesIndex.get(templateName);
  };

  clearUsedTemplates = () => {
    this.usedTemplates.clear();
  };

  addUsedTemplate = (templateName) => {
    this.usedTemplates.add(templateName);
  };

  addUsedTemplates = (templateNames) => {
    this.usedTemplates = new Set([...this.usedTemplates, ...templateNames]);
  };

  setUsedTemplates = (templateNames) => {
    this.clearUsedTemplates();
    this.addUsedTemplates(templateNames);
  };
}
