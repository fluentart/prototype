



import { describe, it } from "mocha";
import * as _ from "lodash"

import * as request from "request"

import * as wsclient from "./wsclient"

var config = {
    uri: "http://localhost:8080"
}

export function test_websockets() {
    describe("WEBSOCKETS RAW API", () => {
        it("version", function (done) {
            done();
        });
    });
}

test_websockets();