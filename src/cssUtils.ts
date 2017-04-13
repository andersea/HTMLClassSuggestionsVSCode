import { Stylesheet, Rule, Media } from 'css';
import { flatten } from './arrayUtils';

export function findRootRules(cssAST: Stylesheet): Rule[] {
    return cssAST.stylesheet.rules.filter(node => (<Rule>node).type === 'rule');
}

export function findMediaRules(cssAST: Stylesheet): Rule[] {
    let mediaNodes = <Rule[]>(cssAST.stylesheet.rules.filter(node => {
        return (<Rule>node).type === 'media';
    }));
    if (mediaNodes.length > 0) {
        return flatten(mediaNodes.map(node => (<Media>node).rules));
    } else {
        return [];
    }
}

export function findClassName(selector: string): string {
    let classNameStartIndex = selector.lastIndexOf('.');
    if (classNameStartIndex >= 0) {
        let classText = selector.substr(classNameStartIndex + 1);
        // Search for one of ' ', '[', ':' or '>', that isn't escaped with a backslash
        let classNameEndIndex = classText.search(/[^\\][\s\[:>]/);
        if (classNameEndIndex >= 0) {
            return classText.substr(0, classNameEndIndex + 1);
        } else {
            return classText;
        }
    } else {
        return "";
    }
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
