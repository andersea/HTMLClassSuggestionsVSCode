'use strict';
import * as vscode from 'vscode';
import aggregator from './cssAggregator';

export class CssCompletionItemProvider implements vscode.CompletionItemProvider {
    private completionItems: PromiseLike<vscode.CompletionItem[]>;

    constructor() {
        this.refreshCompletionItems();
    }

    private getLastAttributeValue(classAttributeText: string) {
        const attributeValueText = classAttributeText.substr(8);
        if (attributeValueText.lastIndexOf(" ")) {
            return attributeValueText.substr(attributeValueText.lastIndexOf(" ") + 1);
        } else {
            return attributeValueText;
        }
    }

    public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.CompletionItem[]> {
        let lineUntilPosition = document.getText(new vscode.Range(position.with(undefined, 0), position));
        let textAfterClassAttributeStart = lineUntilPosition.substr(lineUntilPosition.lastIndexOf('class='));
        let attributeClosed = textAfterClassAttributeStart.search(/class=(?:\"[a-zA-Z0-9-\s]*\"|\'[a-zA-Z0-9-\s]*\'|.*[=>])/)
        if (textAfterClassAttributeStart.length > 1 && attributeClosed === -1) {
            const attributeValue = this.getLastAttributeValue(textAfterClassAttributeStart);
            return this.completionItems.then(items => {
                const filterResult = items.filter(item => item.label.indexOf(attributeValue) !== -1);
                return filterResult
                    .map(item => {
                        let newItem = new vscode.CompletionItem(item.label);
                        newItem.textEdit = vscode.TextEdit.replace(new vscode.Range(
                            new vscode.Position(position.line, position.character - attributeValue.length - 1), position
                        ), item.label);

                        return newItem;
                    });
            });
        } else {
            return Promise.resolve([]);
        }
    }

    public refreshCompletionItems() {
        this.completionItems = aggregator().then(cssClasses => cssClasses.map(cssClass => new vscode.CompletionItem(cssClass)));
    }
};
