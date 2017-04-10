import uriFilesReader from "../src/uriFilesReader";
import * as assert from "assert";
import { Uri } from "vscode";

suite("Uri File Reader Tests", () => {
    test("Can't load http protocol", () => {
        const httpsUri = Uri.parse("https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css");
        return uriFilesReader(Promise.resolve([httpsUri]), "utf8").then(data => {
            assert(false, "Expected promise to be rejected.");
        }).catch(err => {
            assert(err.code === "ENOENT");
        });


    });

});