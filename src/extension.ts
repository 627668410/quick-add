import * as vscode from 'vscode';
import {writeFileByTemplate} from './templateFiles';
import {ConfigItem} from './types';
import {messageError} from './utils';
const path = require('path');
const fs = require('fs');

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('quick-add', (uri) => {
    try {
      // 执行命令的项目路径
      const folderPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
      if (!folderPath) {
        messageError('获取项目路径失败');
        return;
      }

      // 执行命令的文件夹路径
      const basePath = uri.path;
      if (!basePath) {
        messageError('获取当前目录路径失败');
        return;
      }

      const settings: ConfigItem[] = (vscode.workspace
        .getConfiguration()
        .get('quick-add') as unknown) as ConfigItem[];
      if (!settings || !settings.length) {
        messageError('请添加quick-add配置');
        return;
      }
      vscode.window.showQuickPick(settings).then((selection) => {
        if (!selection) return;
        const {quickOpen, path: templatePath, newDir} = selection as ConfigItem;

        const fileOper = (fileName: string, writePath: string) => {
          writeFileByTemplate({
            templatePath: path.join(folderPath, templatePath),
            fileName,
            writePath,
            isRoot: true,
          });
          if (quickOpen) {
            const uri = vscode.Uri.file(path.join(writePath, quickOpen));
            vscode.window.showTextDocument(uri);
          }
        };

        if (newDir) {
          return vscode.window
            .showInputBox({
              // 这个对象中所有参数都是可选参数
              password: false, // 输入内容是否是密码
              ignoreFocusOut: true, // 默认false，设置为true时鼠标点击别的地方输入框不会消失
              placeHolder: '请输入新建文件夹名称', // 在输入框内的提示信息
              prompt: '新建文件夹名称', // 在输入框下方的提示信息
              validateInput: function (text) {
                if (text) return '';
                return text;
              }, // 对输入内容进行验证并返回
            })
            .then(function (fileName) {
              const writePath = path.join(basePath, fileName);
              fs.mkdirSync(writePath);
              fileOper(fileName as string, writePath);
            });
        }

        const fileName = path.basename(basePath);
        fileOper(fileName, basePath);
      });
    } catch (e) {
      messageError(e as string);
    }
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
