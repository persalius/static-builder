export interface TemplateConfig {
  name: string;
  entry: string;
  styles?: string[];
  scripts?: TemplateScript[];
}

export interface TemplateScript {
  file: string;
  container?: "head" | "body";
  position?: "start" | "end" | "comment";
  targetComment?: string;
}
