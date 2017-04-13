import { workspace, window } from 'vscode'
import { parse, Stylesheet, Rule, Media } from 'css';
import * as arrayUtils from './arrayUtils';
import * as cssUtils from './cssUtils';
import uriFilesReader from './uriFilesReader';

interface CSSTextsParseResult {
    styleSheets: Stylesheet[];
    unparsable: string[];
}

function parseCssTexts(cssTexts: string[]): CSSTextsParseResult {
    const initialValue = {
        styleSheets: <Stylesheet[]>[],
        unparsable: <string[]>[]
    };

    return cssTexts.reduce((acc, cssText) => {
        try {
            acc.styleSheets.push(parse(cssText));
        } catch (error) {
            acc.unparsable.push(cssText);
        }
        return acc;
    }, initialValue);
}

function getCSSRules(styleSheets: Stylesheet[]): Rule[] {
    return styleSheets.reduce((acc, styleSheet) => {
        return acc.concat(
            cssUtils.findRootRules(styleSheet),
            cssUtils.findMediaRules(styleSheet)
        );
    }, []);
}

function getCSSSelectors(rules: Rule[]): string[] {
    if (rules.length > 0) {
        return arrayUtils.flatten(rules.map(rule => rule.selectors)).filter(value => value && value.length > 0);
    } else {
        return [];
    }
}

function getCSSClasses(selectors: string[]): string[] {
    return selectors.reduce((acc, selector) => {
        const className = cssUtils.findClassName(selector);

        if (className && className.length > 0) {
            acc.push(cssUtils.sanitizeClassName(className));
        }

        return acc;
    }, []);
}

export default function () {

    const startTime = process.hrtime();

    const cssTextsPromise = uriFilesReader(
        workspace.findFiles('**/*.css', ''),
        workspace.getConfiguration('files').get('encoding', 'utf8')
    );

    const distinctCSSTextsPromise = cssTextsPromise.then(cssTexts => arrayUtils.distinctByXXHash(cssTexts));

    const parseResultPromise = distinctCSSTextsPromise.then(distinctCSSTexts => parseCssTexts(distinctCSSTexts));

    const rulesPromise = parseResultPromise.then(parseResult => getCSSRules(parseResult.styleSheets));

    const selectorsPromise = rulesPromise.then(rules => getCSSSelectors(rules));

    const cssClassesPromise = selectorsPromise.then(selectors => getCSSClasses(selectors));

    const distinctCssClassesPromise = cssClassesPromise.then(cssClasses => arrayUtils.distinct(cssClasses));

    return distinctCssClassesPromise.then(distinctCssClasses => {
        const elapsedTime = process.hrtime(startTime);

        parseResultPromise.then(parseResult => {
            console.log(`Elapsed time: ${elapsedTime[0]} s ${Math.trunc(elapsedTime[1] / 1e6)} ms`);
            console.log(`Files processed: ${parseResult.styleSheets.length}`);
            console.log(`cssClasses discovered: ${distinctCssClasses.length}`);

            window.setStatusBarMessage(`HTML Class Suggestions processed ${parseResult.styleSheets.length} distinct css files and discovered ${distinctCssClasses.length} css classes.`, 10000);
        })

        return distinctCssClasses;
    });
}
