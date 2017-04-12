import { workspace, window } from 'vscode'
import { parse, Stylesheet, Rule, Media } from 'css';
import { readFile } from 'fs';
import { flatten } from './arrayUtils';
import { findRootRules, findMediaRules, findClassName, sanitizeClassName } from './cssUtils';
let XXH = require('xxhashjs').h32;

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
            uniqueCssTexts => uniqueCssTexts.map(cssText => {
                try {
                    return parse(cssText);
                } catch (Error) {
                    return undefined;
                }

            }).filter(cssAST => cssAST !== undefined),
            console.log
        );

        let rulesPromise = cssASTsPromise.then(cssASTs => {
            if (cssASTs.length > 0) {
                return flatten(cssASTs.map(
                    cssAST => {
                        let rootRules = findRootRules(cssAST);
                        let mediaRules = findMediaRules(cssAST);
                        return rootRules.concat(mediaRules);
                    }
                ))
            } else {
                return [];
            }
        }, console.log);

        let selectorsPromise = rulesPromise.then(rules => {
            if (rules.length > 0) {
                return flatten(rules.map(rule => rule.selectors)).filter(value => value && value.length > 0);
            } else {
                return [];
            }
        }, console.log);

        let cssClassesPromise = selectorsPromise.then(selectors => {
            return selectors
                .map(selector => findClassName(selector))
                .filter(value => value && value.length > 0)
                .map(className => sanitizeClassName(className))
        },
            console.log
        );

        return cssClassesPromise.then(cssClasses => {
            let uniqueCssClasses = Array.from(new Set(cssClasses));

            let elapsedTime = process.hrtime(startTime);

            console.log(`Elapsed time: ${elapsedTime[0]} s ${Math.trunc(elapsedTime[1] / 1e6)} ms`);
            console.log(`Files processed: ${cssHashSet.size}`);
            console.log(`cssClasses discovered: ${uniqueCssClasses.length}`);

            window.setStatusBarMessage(`HTML Class Suggestions processed ${cssHashSet.size} distinct css files and discovered ${uniqueCssClasses.length} css classes.`, 10000);

            return uniqueCssClasses;
        }, console.log);
    }, console.log);
}
