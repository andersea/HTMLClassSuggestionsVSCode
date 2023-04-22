'use strict';
import * as vscode from 'vscode';
import aggregator from './cssAggregator';

export class CssCompletionItemProvider
  implements vscode.CompletionItemProvider
{
  private completionItems: PromiseLike<vscode.CompletionItem[]>;

  constructor() {
    this.refreshCompletionItems();
  }

  public provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Thenable<vscode.CompletionItem[]> {
    if (canTriggerCompletion(document, position)) {
      return this.completionItems;
    } else {
      return Promise.reject<vscode.CompletionItem[]>(
        'Not inside html class attribute.'
      );
    }
  }

  public refreshCompletionItems() {
    this.completionItems = aggregator().then((cssClasses) => {
      const completionItems = cssClasses.map((cssClass) => {
        const completionItem = new vscode.CompletionItem(cssClass);
        completionItem.detail = `Insert ${cssClass}`;
        completionItem.insertText = cssClass;
        completionItem.kind = vscode.CompletionItemKind.Value;
        return completionItem;
      });
      return completionItems;
    });
  }
}

function canTriggerCompletion(
  document: vscode.TextDocument,
  position: vscode.Position
): boolean {
  const attributeName =
    document.languageId === 'typescriptreact' ? 'className' : 'class';

  const lineUntilCursorPosition = getLineUntilPosition(document, position);
  const textAfterAttributeStart = getTextAfterAttributeStart(
    lineUntilCursorPosition,
    attributeName
  );
  const attributeClosed = isAttributeClosed(
    textAfterAttributeStart,
    attributeName
  );

  return textAfterAttributeStart.length > 1 && attributeClosed;
}

// helper functions
function getLineUntilPosition(
  document: vscode.TextDocument,
  position: vscode.Position
): string {
  return document.getText(
    new vscode.Range(position.with(undefined, 0), position)
  );
}

function getTextAfterAttributeStart(
  lineUntilPosition: string,
  attributeName: string
): string {
  const lastAttributeOccurrence = lineUntilPosition.lastIndexOf(attributeName);
  return lineUntilPosition.substr(lastAttributeOccurrence);
}

function isAttributeClosed(text: string, attributeName: string): boolean {
  const attributeRegex = new RegExp(
    `${attributeName}=(?:\"[a-zA-Z0-9-\\s]*\"|\'[a-zA-Z0-9-\\s]*\'|.*[=>])`
  );
  return text.search(attributeRegex) === -1;
}
