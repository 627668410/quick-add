export interface TemplateWrite {
  templatePath: string;
  fileName: string;
  writePath: string;
  isRoot: boolean;
  /** 执行命令的目录的路径 */
  rootPath: string;
}

export type FileCreateParams = Omit<TemplateWrite, 'isRoot'>;
