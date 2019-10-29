import { PluginConfigTestProps } from "../../server/tests/tests"
import { describe, it, reporters } from "mocha";
import * as request from "request";
import { generate } from "../../server/utils/utils"
import { HTTPRoute } from "./interfaces";

export default function test(props: PluginConfigTestProps) {

    describe("PLUGIN [HTTP]", () => {
        var route: HTTPRoute = {
            id: "somedevice",
            method: "post"
        }
        /** ----------------------------------------------------------------- */

        it("add route", done => {
            request.post(props.uri + "/api/v3/http/addroute",
                {
                    headers: props.headers,
                    json: route
                }, (err, res, response) => {
                    if (err) { done(new Error("error")); console.log(err); return; }
                    if (response.result == "success") {
                        done();
                    } else {
                        done(new Error("invalid response")); console.log(response);
                    }
                });

        })

        /** ----------------------------------------------------------------- */

        it("list routes", (done) => {
            request.get(props.uri + "/api/v3/http/routes", { headers: props.headers, json: true }, (err, res, response) => {
                if (!Array.isArray(response)) { done(new Error("expected an array")); return; }
                if (response.length != 1) { done(new Error("expected only one route in array")) }
                if (response[0].id != route.id) { done(new Error("id mismatch")); return; }
                if (response[0].method != route.method) { done(new Error("method mismatch")); return; }
                if (!response[0].route) { done(new Error("expected route data")); return; }
                done();
            })
        })

        /** ----------------------------------------------------------------- */
        // test route 
        /** ----------------------------------------------------------------- */

        it("Can remove a route", function (done) {
            request.post(props.uri + "/api/v3/http/removeroute",
                {
                    headers: props.headers,
                    json: route
                }, (err, res, response) => {
                    if (response.result != "success") { done(new Error("Expected result success string")); return; }
                    if (response.deletedCount == 1) {
                        done();
                    }

                });
        });
    });
}
