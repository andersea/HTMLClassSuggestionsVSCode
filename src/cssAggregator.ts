import { workspace } from 'vscode'
import { parse, Rule } from 'css';
import { readFile } from 'fs'

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
        
        let cssTextPromises = uris.map(uri =>
            <PromiseLike<string>>new Promise<string>((resolve, reject) =>
                readFile(uri.fsPath, workspace.getConfiguration('files').get('encoding'), (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data.toString());
                    }
                })
            )
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