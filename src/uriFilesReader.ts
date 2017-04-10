import { Uri } from "vscode";
import { readFile } from "fs";

export default (urisPromise: Thenable<Uri[]>, encoding: string) => {
    return Promise.resolve(urisPromise).then(uris => {
        return Promise.all(uris.map(uri => new Promise<string>((resolve, reject) => {
            readFile(uri.fsPath, encoding, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.toString());
                }
            })
        })));
    });
}
