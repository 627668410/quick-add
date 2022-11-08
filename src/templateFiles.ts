import {FileCreateParams, TemplateWrite} from "./types/template";
import {message} from "./utils";
const _ = require("lodash");
const path = require("path");
const fs = require("fs");
const exists = fs.existsSync;

export function writeFileByTemplate({
  templatePath,
  fileName,
  writePath,
  isRoot,
}: TemplateWrite) {
  const stats = fs.statSync(templatePath);
  var isFile = stats.isFile(); //是文件
  var isDir = stats.isDirectory(); //是文件夹
  if (isFile) {
    createFile({templatePath, fileName, writePath});
  }
  if (isDir) {
    if (!isRoot && !exists(writePath)) {
      fs.mkdirSync(writePath);
    }
    const files = fs.readdirSync(templatePath);
    files.forEach((file: any) =>
      writeFileByTemplate({
        templatePath: path.join(templatePath, file),
        fileName,
        writePath: path.join(writePath, file),
        isRoot: false,
      })
    );
  }
}

const hanldeFileName: {
  [key: string]: (name: string) => string;
} = {
  QuickAddFileName: (name) => _.upperFirst(_.camelCase(name)),
  quickAddFileName: (name) => _.camelCase(name),
  quickaddfilename: (name) => _.toLower(name),
  QUICKADDFILENAME: (name) => _.toUpper(name),
  "quick-add-file-name": (name) => _.kebabCase(name),
  quick_add_file_name: (name) => _.snakeCase(name),
};

function createFile({templatePath, fileName, writePath}: FileCreateParams) {
  let content = fs.readFileSync(templatePath).toString();
  Object.keys(hanldeFileName).forEach((key: string) => {
    const reg = new RegExp(key, "g");
    content = content.replace(reg, hanldeFileName[key](fileName));
  });

  if (exists(writePath)) {
    message(`${writePath}文件已存在`);
  } else {
    fs.writeFileSync(writePath, content);
  }
}
