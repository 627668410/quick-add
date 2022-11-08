import * as vscode from 'vscode';

export function message(msg: string) {
  vscode.window.showInformationMessage(msg);
}

export function messageError(msg: string) {
  vscode.window.showErrorMessage(msg);
}