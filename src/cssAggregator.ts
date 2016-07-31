import { workspace } from 'vscode'
import { parse, Rule } from 'css';
import { readFile } from 'fs'
let XXH = require('xxhashjs').h32;

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

    let startTime = process.hrtime();
    let cssHashSet = new Set();

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

        let uniqueCssTextsPromise = Promise.all(cssTextPromises).then(
            cssTexts => cssTexts.filter(cssText => {
                let hash = XXH(cssText, 0x1337).toNumber();
                if (cssHashSet.has(hash)) {
                    return false;
                } else {
                    cssHashSet.add(hash);
                    return true;
                }
            })
        );

        let cssASTsPromise = uniqueCssTextsPromise.then(
            uniqueCssTexts => uniqueCssTexts.map(cssText => parse(cssText)),
            console.log
        );

        let rulesPromise = cssASTsPromise.then(cssASTs => {
            if (cssASTs.length > 0) {
                return flatten(cssASTs.map(
                    cssAST => <Rule[]>(cssAST.stylesheet.rules.filter(node => (<Rule>node).type === 'rule'))
                ))
            } else {
                return [];
            }
        }, console.log);

        let selectorsPromise = rulesPromise.then(rules => {
            if (rules.length > 0) {
                return flatten(rules.map(rule => rule.selectors));
            } else {
                return [];
            }
        }, console.log);

        let cssClassesPromise = selectorsPromise.then(selectors =>
            selectors.map(selector => findClassName(selector)).filter(value => value !== ""),
            console.log
        );

        return cssClassesPromise.then(cssClasses => {
            let uniqueCssClasses = Array.from(new Set(cssClasses));

            let elapsedTime = process.hrtime(startTime);

            console.log(`Elapsed time: ${elapsedTime[0]} s ${Math.trunc(elapsedTime[1] / 1e6)} ms`);
            console.log(`Files processed: ${cssHashSet.size}`);
            console.log(`cssClasses discovered: ${uniqueCssClasses.length}`);
            

            return uniqueCssClasses;
        }, console.log);
    }, console.log);
}
