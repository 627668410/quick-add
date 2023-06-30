import * as vscode from 'vscode';
import {FileCreateParams, TemplateWrite} from './types/template';
import {message} from './utils';
const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const exists = fs.existsSync;

export function writeFileByTemplate({
  templatePath,
  fileName,
  writePath,
  isRoot,
  rootPath,
}: TemplateWrite) {
  const stats = fs.statSync(templatePath);
  var isFile = stats.isFile(); //是文件
  var isDir = stats.isDirectory(); //是文件夹
  if (isFile) {
    createFile({templatePath, fileName, writePath, rootPath});
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
        rootPath,
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
  'quick-add-file-name': (name) => _.kebabCase(name),
  quick_add_file_name: (name) => _.snakeCase(name),
};

function createFile({
  templatePath,
  fileName,
  writePath,
  rootPath,
}: FileCreateParams) {
  let content = fs.readFileSync(templatePath).toString();
  Object.keys(hanldeFileName).forEach((key: string) => {
    const reg = new RegExp(key, 'g');
    content = content.replace(reg, hanldeFileName[key](fileName));
  });

  const settings = vscode.workspace
    .getConfiguration()
    .get('quick-add-name-constant');
  if (settings) {
    try {
      _.forEach(settings, ({constant, rule, relativePath, absolutePath}) => {
        const fileName = absolutePath
          ? getAbsoluteFileName(rootPath, absolutePath)
          : path.basename(path.join(rootPath, relativePath));
        const reg = new RegExp(constant, 'g');
        content = content.replace(reg, hanldeFileName[rule](fileName));
      });
    } catch (e) {
      message(`quick-add-name-constant转换出错`);
    }
  }

  if (exists(writePath)) {
    message(`${writePath}文件已存在`);
  } else {
    fs.writeFileSync(writePath, content);
  }
}

const getAbsoluteFileName = (rootPath, absolutePath) => {
  return rootPath.split(absolutePath)[1]?.split('/')[0];
};
