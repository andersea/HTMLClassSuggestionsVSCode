'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { languages, ExtensionContext, workspace } from 'vscode';
import { CssCompletionItemProvider } from './cssCompletionItemProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

    let provider = new CssCompletionItemProvider();

    context.subscriptions.push(workspace.onDidSaveTextDocument((e) => {
        if (e.languageId === 'css') {
            provider.refreshCompletionItems();
        }
    }));

    context.subscriptions.push(languages.registerCompletionItemProvider('html', provider));
    context.subscriptions.push(languages.registerCompletionItemProvider('php', provider));

}

// this method is called when your extension is deactivated
export function deactivate() {
}
