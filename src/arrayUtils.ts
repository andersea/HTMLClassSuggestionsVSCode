let XXH = require('xxhashjs').h32;

export function flatten<T>(nestedArray: T[][]): T[] {
    if (nestedArray.length === 0) {
        throw new RangeError("Can't flatten an empty array.");
    } else {
        return nestedArray.reduce((a, b) => a.concat(b));
    }
}

export function distinct<T>(items: T[]): T[] {
    return Array.from(new Set(items));
}

export function distinctByXXHash<T>(items: T[]): T[] {
    const initialValue = {
        distinctItems: <T[]>[],
        hashSet: new Set()
    };

    const accumulator = items.reduce((acc, item) => {
        const hash = XXH(item, 0x1337).toNumber();

        if (!acc.hashSet.has(hash)) {
            acc.distinctItems.push(item);
            acc.hashSet.add(hash);
        }

        return acc;
    }, initialValue);

    return accumulator.distinctItems;
}