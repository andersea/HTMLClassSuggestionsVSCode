import { workspace } from 'vscode'
import { parse, Rule } from 'css';
import * as path from 'path'

function flatten<T>(nestedArray: T[][]): T[] {
    if (nestedArray.length === 0) {
        throw new RangeError("Can't flatten an empty array.");
    } else {
        return nestedArray.reduce((a, b) => a.concat(b));
    }
}

function findClassName(selector: string): string {
    let classNameStartIndex = selector.lastIndexOf('.');
    if (classNameStartIndex >= 0) {
        let classText = selector.substr(classNameStartIndex + 1);
        // Search for one of ' ', '[', ':' or '>'
        let classNameEndIndex = classText.search(/[\s\[:>]/);
        if (classNameEndIndex >= 0) {
            return classText.substr(0, classNameEndIndex);
        } else {
            return classText;
        }
    } else {
        return "";
    }
}

export default function () {

    return workspace.findFiles('**/*.css', '').then(uris => {

        let cssTextPromises = uris.map(
            uri => workspace.openTextDocument(uri).then(cssDocument => {
                console.log("Parsing - " + cssDocument.fileName);

                return cssDocument.getText();
            }, console.log)
        );

        let cssASTPromises = cssTextPromises.map(
            cssTextPromise => cssTextPromise.then(cssText => parse(cssText), console.log)
        );

        let rulesPromises = cssASTPromises.map(
            cssASTPromise => cssASTPromise.then(cssAST =>
                <Rule[]>(cssAST.stylesheet.rules.filter(node => (<Rule>node).type === 'rule')),
                console.log)
        );

        let selectorsPromises = rulesPromises.map(
            rulesPromise => rulesPromise.then(rules => {
                if (rules.length > 0) {
                    return flatten(rules.map(rule => rule.selectors));
                } else {
                    return [];
                }
            }, console.log)
        );

        let cssClassesPromises = selectorsPromises.map(
            selectorsPromise => selectorsPromise.then(selectors =>
                selectors.map(selector => findClassName(selector)).filter(value => value !== ""),
                console.log)
        );

        return Promise.all(cssClassesPromises).then(cssClassesInAllFiles => {
            let allcssClasses = Array.from(new Set(
                cssClassesInAllFiles
                    .filter(cssClasses => cssClasses.length > 0)
                    .reduce((p, c) => p.concat(c))
            ));

            return allcssClasses;
        }, console.log);
    }, console.log);
}