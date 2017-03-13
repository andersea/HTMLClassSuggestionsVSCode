# HTML Class Suggestions

html-class-suggestions is a Visual Studio Code extension that provides completion options for html class attributes based on the css files in your workspace.

## Features

* Suggestions based on the css files in your workspace.
* Monitors your workspace for css file changes and refreshes the suggestions if needed.
* css parsing using the [css npm module](https://github.com/reworkcss/css).
* Avoids parsing identical files by comparing file hash.
* Language support: html, php
* View library support: Vue (new in 1.0.4!)

![Screenshot 1](https://raw.githubusercontent.com/andersea/HTMLClassSuggestionsVSCode/master/images/Screenshot%201.png)

## Requirements

The extension is bundled with all necessary requirements, so it should be plug and play.

## Release Notes

### 1.0.4

Basic Vue support - Suggestions should now be available in html templates in vue components.
Hardened the css aggregator against malformed css which could break parsing completely in certain cases.

### 1.0.3

Fixed handling of css media rules. Classes defined within media rules should now be correctly picked up by the aggregator.

### 1.0.2

Added a status bar notification when processing is completed.

### 1.0.0
 
I am releasing this as v1.0.0. No longer a preview. This release includes basic php support. - Issue #5.

### 0.2.1

Fixed issue #4 - Refresh CSS classes on css file changes.

### 0.2.0

Optimized parsing for projects with a lot of duplicate css files. See [8525aaf](https://github.com/andersea/HTMLClassSuggestionsVSCode/commit/8525aafee9f2f64ad1e39ceb78c38b91b59f0a9b).

### 0.1.2

Fixed issue #1 - VSCode hangs when extension opens a large number of css files.

### 0.1.1

Various minor packaging improvements.

### 0.1.0

Initial release of html-class-suggestions.
