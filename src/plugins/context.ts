import path from "path";
import { paths } from "@/config/paths.js";
import { buildTemplatesIndex } from "@/utils/buildTemplatesIndex.js";

interface UpdateTemplatesIndex {
  name: string;
  folderName: string;
}

export class TemplatesContext {
  usedTemplates: Set<string>;
  templatesIndex: Map<string, string>;

  constructor() {
    this.usedTemplates = new Set();
    this.templatesIndex = buildTemplatesIndex(paths.templates);
  }

  updateTemplatesIndex = ({ name, folderName }: UpdateTemplatesIndex) => {
    this.templatesIndex.set(name, path.join(paths.templates, folderName));
  };

  getTemplatePath = (templateName: string) => {
    return this.templatesIndex.get(templateName);
  };

  clearUsedTemplates = () => {
    this.usedTemplates.clear();
  };

  addUsedTemplate = (templateName: string) => {
    this.usedTemplates.add(templateName);
  };

  addUsedTemplates = (templateNames: Set<string>) => {
    this.usedTemplates = new Set([...this.usedTemplates, ...templateNames]);
  };

  setUsedTemplates = (templateNames: Set<string>) => {
    this.clearUsedTemplates();
    this.addUsedTemplates(templateNames);
  };
}
