export function flatten<T>(nestedArray: T[][]): T[] {
    if (nestedArray.length === 0) {
        throw new RangeError("Can't flatten an empty array.");
    } else {
        return nestedArray.reduce((a, b) => a.concat(b));
    }
}
