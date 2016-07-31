'use strict';
import * as vscode from 'vscode';
import aggregator from './cssAggregator';

let completionItems = aggregator().then(cssClasses => cssClasses.map(cssClass => new vscode.CompletionItem(cssClass)));

export default {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.CompletionItem[]> {
        let lineUntilPosition = document.getText(new vscode.Range(position.with(undefined, 0), position));
        let textAfterClassAttributeStart = lineUntilPosition.substr(lineUntilPosition.lastIndexOf('class='));
        let attributeClosed = textAfterClassAttributeStart.search(/class=(?:\"[a-zA-Z0-9-\s]*\"|\'[a-zA-Z0-9-\s]*\'|.*[=>])/)
        if (textAfterClassAttributeStart.length > 1 && attributeClosed === -1) {
            return completionItems;
        } else {
            return Promise.resolve([]);
        }
    }
};
