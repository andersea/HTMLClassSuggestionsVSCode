import { parse, Stylesheet, Rule, Media } from 'css';
import { flatten } from './arrayUtils';


export interface CSSTextsParseResult {
    styleSheets: Stylesheet[];
    unparsable: string[];
}

export function parseCssTexts(cssTexts: string[] | Thenable<string[]>): Thenable<CSSTextsParseResult> {
    const initialValue = {
        styleSheets: <Stylesheet[]>[],
        unparsable: <string[]>[]
    };

    return Promise.resolve(cssTexts).then(cssTexts => cssTexts.reduce((acc, cssText) => {
        try {
            acc.styleSheets.push(parse(cssText));
        } catch (error) {
            acc.unparsable.push(cssText);
        }
        return acc;
    }, initialValue));
}

export function getCSSRules(styleSheets: Stylesheet[] | Thenable<Stylesheet[]>): Thenable<Rule[]> {
    return Promise.resolve(styleSheets).then(styleSheets => styleSheets.reduce((acc, styleSheet) => {
        return acc.concat(
            findRootRules(styleSheet),
            findMediaRules(styleSheet)
        );
    }, [] as Rule[]));
}

export function getCSSSelectors(rules: Rule[] | Thenable<Rule[]>): Thenable<string[]> {
    return Promise.resolve(rules).then(rules => {
        if (rules.length > 0) {
            return flatten(rules.map(rule => rule.selectors!)).filter(value => value && value.length > 0);
        } else {
            return [];
        }
    });
}

export function getCSSClasses(selectors: string[]|Thenable<string[]>): Thenable<string[]> {
    return Promise.resolve(selectors).then(selectors => selectors.reduce((acc, selector) => {
        const className = findClassName(selector);

        if (className && className.length > 0) {
            acc.push(sanitizeClassName(className));
        }

        return acc;
    }, [] as string[]));
}

export function findRootRules(cssAST: Stylesheet): Rule[] {
    return cssAST.stylesheet!.rules.filter((node): node is Rule => node.type === 'rule');
}

export function findMediaRules(cssAST: Stylesheet): Rule[] {
    const mediaNodes = cssAST.stylesheet!.rules.filter((node): node is Media => node.type === 'media');
    if (mediaNodes.length > 0) {
        return flatten(mediaNodes.map(node => node.rules!.filter((r): r is Rule => r.type === 'rule')));
    } else {
        return [];
    }
}

/**
 * Extracts the last CSS class name from a selector string.
 * Handles escaped characters (e.g., \: \@ \/) by skipping them.
 * Used to collect CSS class names for HTML autocomplete suggestions.
 */
export function findClassName(selector: string): string {
    const lastDotIndex = selector.lastIndexOf('.');
    if (lastDotIndex === -1) { return ''; }

    const classText = selector.slice(lastDotIndex + 1);

    for (let i = 0; i < classText.length; i++) {
        if (classText[i] === '\\') {
            i++; // Skip escaped character
        } else if (/[\s[:>:]/.test(classText[i])) {
            return classText.substring(0, i);
        }
    }

    return classText;
}

export function sanitizeClassName(className: string): string {
    return className.replace(/\\[!"#$%&'()*+,\-./:;<=>?@[\\\]^`{|}~]/g, (substr, ...args) => {
        if (args.length === 2) {
            return substr.slice(1);
        } else {
            return substr;
        }
    });
}
