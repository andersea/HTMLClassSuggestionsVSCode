# HTML Class Suggestions

html-class-suggestions is a Visual Studio Code extension that provides completion options for html class attributes based on the css files in your workspace. It is similar to other extensions like [Zignd's](https://marketplace.visualstudio.com/search?term=publisher%3A%22Zignd%22&target=VSCode&sortBy=Relevance) [HTML CSS Class Completion](https://marketplace.visualstudio.com/items?itemName=Zignd.html-css-class-completion), but this extension is coded from scratch in typescript.

## Features

Scans your workspace for css files and parses them for class names using the [css npm module](https://github.com/reworkcss/css).

Scanning happens in the background when you open a html file. It should take a couple of seconds to complete, after which css class suggestions should be available in class attributes in your html. Each file is scanned separately in an asynchronous fashion using vscode's promise api.

![Screenshot 1](https://raw.githubusercontent.com/andersea/HTMLClassSuggestionsVSCode/master/images/Screenshot%201.png)

## Requirements

The extension is bundled with all necessary requirements, so it should be plug and play.

## Release Notes

### 0.1.1

Various minor packaging improvements.

### 0.1.0

Initial release of html-class-suggestions.
