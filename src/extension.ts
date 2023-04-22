'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CssCompletionItemProvider } from './cssCompletionItemProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let provider = new CssCompletionItemProvider();

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((e) => {
      if (e.languageId === 'css') {
        provider.refreshCompletionItems();
      }
    })
  );

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider('html', provider)
  );
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider('cshtml', provider)
  );
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider('php', provider)
  );
  context.subscriptions.push(vscode.languages.registerCompletionItemProvider('vue', provider));
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider('typescriptreact', provider)
  );
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider('javascriptreact', provider)
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
