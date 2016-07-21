import { workspace, Uri } from 'vscode'
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

let profileAll = Date.now();
let profileOpenTextDocument = 0;
let profileFindFiles = Date.now();
let profileReadFiles = 0;
let profileParse = 0;
let profileMapRules = 0;
let profileMapSelectors = 0;
let profileFindClasses = 0;
let profileAggregate = 0;

function readFiles(uris: Uri[]): Thenable<string[]> {
    if (uris.length > 0) {
        return workspace.openTextDocument(uris.pop()).then(cssDocument => {
            console.log
            return readFiles(uris).then(results => results.concat([cssDocument.getText()]));
        })
    } else {
        return Promise.resolve([]);
    }
}
interface FilesConfiguration {
    encoding: string
}

export default function () {

    return workspace.findFiles('**/*.css', '').then(uris => {
        profileFindFiles = Date.now() - profileFindFiles;
        console.log('profileFindFiles: ' + profileFindFiles + ' ms');

        let encoding = workspace.getConfiguration('files').get('encoding');
         
        let cssTextPromises = uris.map(
            uri => {
                let profileOpenTextDocumentStart = Date.now();
                console.log('Opening - ' + path.basename(uri.fsPath));

                let cssTextPromise = workspace.openTextDocument(uri).then(cssDocument => {
                    profileOpenTextDocument += Date.now() - profileOpenTextDocumentStart;
                    console.log("Parsing - " + cssDocument.fileName);
                    let profileReadFilesStart = Date.now();
                    let cssText = cssDocument.getText();
                    profileReadFiles += Date.now() - profileReadFilesStart;
                    return cssText;
                }, console.log);
                return cssTextPromise;
            }
        );

        let cssASTPromises = cssTextPromises.map(
            cssTextPromise => cssTextPromise.then(cssText => {
                let profileParseStart = Date.now();
                let cssAST = parse(cssText);
                profileParse += Date.now() - profileParseStart;

                return cssAST;
            }, console.log)
        );

        let rulesPromises = cssASTPromises.map(
            cssASTPromise => cssASTPromise.then(cssAST => {
                let profileMapRulesStart = Date.now();
                let rules = <Rule[]>(cssAST.stylesheet.rules.filter(node => (<Rule>node).type === 'rule'))
                profileMapRules += Date.now() - profileMapRulesStart;
                return rules;
            },
                console.log)
        );

        let selectorsPromises = rulesPromises.map(
            rulesPromise => rulesPromise.then(rules => {
                let profileMapSelectorsStart = Date.now();
                if (rules.length > 0) {
                    let flattenedSelectors = flatten(rules.map(rule => rule.selectors));
                    profileMapSelectors += Date.now() - profileMapSelectorsStart;
                    return flattenedSelectors;
                } else {
                    return [];
                }
            }, console.log)
        );

        let cssClassesPromises = selectorsPromises.map(
            selectorsPromise => selectorsPromise.then(selectors => {
                let profileFindClassesStart = Date.now();
                let classes = selectors.map(selector => findClassName(selector)).filter(value => value !== "")
                profileFindClasses += Date.now() - profileFindClassesStart;
                return classes;
            },
                console.log)
        );

        return Promise.all(cssClassesPromises).then(cssClassesInAllFiles => {
            let profileAggregateStart = Date.now();
            let allcssClasses = Array.from(new Set(
                cssClassesInAllFiles
                    .filter(cssClasses => cssClasses.length > 0)
                    .reduce((p, c) => p.concat(c))
            ));
            profileAggregate = Date.now() - profileAggregateStart;

            console.log('profileFindFiles: ' + profileFindFiles + ' ms');
            console.log('profileOpenTextDocument: ' + profileOpenTextDocument + ' ms');
            console.log('profileReadFiles: ' + profileReadFiles + ' ms');
            console.log('profileParse: ' + profileParse + ' ms');
            console.log('profileMapRules: ' + profileMapRules + ' ms');
            console.log('profileMapSelectors: ' + profileMapSelectors + ' ms');
            console.log('profilefindClasses: ' + profileFindClasses + ' ms');
            console.log('profileAggregate: ' + profileAggregate + ' ms');
            let profileSum = profileFindFiles + profileOpenTextDocument + profileReadFiles + profileParse + profileMapRules + profileMapSelectors + profileFindClasses + profileAggregate;
            console.log('Sum of extension profiles: ' + profileSum + ' ms');

            console.log('profileAll: ' + (Date.now() - profileAll) + ' ms');


            return allcssClasses;
        }, console.log);
    }, console.log);
}