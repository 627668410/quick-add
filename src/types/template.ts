export interface TemplateWrite {
  templatePath: string;
  fileName: string;
  writePath: string;
  isRoot: boolean;
}

export interface FileCreateParams {
  templatePath: string;
  fileName: string;
  writePath: string
}