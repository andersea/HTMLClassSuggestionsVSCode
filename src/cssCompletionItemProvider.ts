'use strict';
import * as vscode from 'vscode';
import aggregator from './cssAggregator';

export class CssCompletionItemProvider implements vscode.CompletionItemProvider {
    private completionItems: PromiseLike<vscode.CompletionItem[]>;

    constructor() {
        this.refreshCompletionItems();
    }

    public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.CompletionItem[]> {
        let lineUntilPosition = document.getText(new vscode.Range(position.with(undefined, 0), position));
        let textAfterClassAttributeStart = lineUntilPosition.substr(lineUntilPosition.lastIndexOf('class='));
        let attributeClosed = textAfterClassAttributeStart.search(/class=(?:\"[a-zA-Z0-9-\s]*\"|\'[a-zA-Z0-9-\s]*\'|.*[=>])/)
        if (textAfterClassAttributeStart.length > 1 && attributeClosed === -1) {
            return this.completionItems;
        } else {
            return Promise.reject<vscode.CompletionItem[]>("Not inside html class attribute.");
        }
    }

    public refreshCompletionItems() {
        this.completionItems = aggregator().then(cssClasses => cssClasses.map(cssClass => new vscode.CompletionItem(cssClass)));
    }
};
