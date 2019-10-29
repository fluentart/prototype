import { describe, it } from "mocha";
import { generateDifficult } from "../utils/utils"
import * as request from "request";

import { webapi_v3 } from "./webapiv3/webapi_v3_tests"
import { webapi_v4 } from "./webapiv4/webapi_v4_tests"

import { test_websockets } from "./webapiv4/webapi_v4_websockets"

//import * as plugins from "../../plugins/plugins_list_tests"
import { pluginTests } from "../../plugins/plugins_list_tests"


import * as bench from "./benchmark"

export interface TESTCONFIG {
    hostname: string
    httpprot: string
    httpport: string
    mqttprot: string
    /** specifies if we should test SSL/TLS ports like 443, 8883 and so on */
    tls: boolean
}

export interface PluginConfigTestProps {
    hostname: string
    tls: boolean
    account: { apikey: string }
    httpprot?: string
    httpport?: string
    mqttprot?: string
    uri: string
    headers: any
    timeout: number
    mqtturi?: string
}

var testconfig: TESTCONFIG = { hostname: "", httpprot: "", httpport: "", mqttprot: "", tls: false };

var preset = "localhost";
//var preset = "dev";
//var preset = "prod"; // last 100% test Oct 28 2019
//var preset = "8bo";

if (preset == "localhost") {
    testconfig.hostname = "localhost"
    testconfig.httpport = ":8080"
    testconfig.httpprot = "http://"
    testconfig.mqttprot = "mqtt://"
    testconfig.tls = false;
}

if (preset == "dev") {
    testconfig.hostname = "prototype.dev.iotnxt.io"
    testconfig.httpport = "" // default to 443
    testconfig.httpprot = "https://"
    testconfig.mqttprot = "mqtts://"
    testconfig.tls = true;
}

if (preset == "prod") {
    testconfig.hostname = "prototype.iotnxt.io"
    testconfig.httpport = "" // default to 443
    testconfig.httpprot = "https://"
    testconfig.mqttprot = "mqtt://"
    testconfig.tls = true;
}

if (preset == "8bo") {
    testconfig.hostname = "8bo.org"
    testconfig.httpport = "" // default to 443
    testconfig.httpprot = "https://"
    testconfig.mqttprot = "mqtt://"
    testconfig.tls = true;
}

var testAccount: any = { email: "test" + generateDifficult(32) + "@iotlocalhost.com", password: "newUser" };

var uri = testconfig.httpprot + testconfig.hostname + testconfig.httpport;
var mqtturi = testconfig.mqttprot + testconfig.hostname
var headers = { Authorization: "" };
var timeout = 5000;
var account: any;           // instance for new user

// ACCOUNT REGISTRATION

describe("PROTOTYPE MAIN", () => {

    /** test registration of new accounts */
    it("register", function (done) {
        this.timeout(timeout);
        request.post(uri + "/api/v4/admin/register", { json: { email: testAccount.email, pass: testAccount.password } }, (err, res, response) => {
            if (err) { done(err); return }
            if (response) {
                if (!response.account) { done(new Error("Missing account from response.")); return; }
                if (!response.account.apikey) { done(new Error("Missing apikey from account response.")); return; }
                account = response.account;

                done();
            }
        })
    })

    /** get account information using auth header */
    it("account", function (done) {
        this.timeout(timeout); // crazy slow on prod.

        //generate headers
        headers = { Authorization: "Basic " + Buffer.from("api:key-" + account.apikey).toString("base64") }

        request.get(uri + "/api/v4/account", { headers, json: true }, (err, res, response) => {
            if (err) done(err);
            if (response) {
                if (!response.uuid) { done(new Error("uuid missing from response")); return; }
                if (!response.apikey) { done(new Error("apikey missing from response")); return; }
                if (account.apikey != response.apikey) { done(new Error("apikey mismatch from response")); return; }
                done();
            }
        })
    })

    /** get server version information */
    it("version", done => {
        request.get(uri + "/api/v4/version", { json: true }, (err, res, response) => {
            if (err) done(err);
            if (response) {
                if (!response.version) { done(new Error("version missing from response")); return; }
                if (!response.description) { done(new Error("description missing from response")); return; }
                done();
            }
        })
    })

    /** test signin using username and pass */
    it("signin", done => {
        // singin
        request.post(uri + "/signin", { json: { email: testAccount.email, pass: testAccount.password } }, (err, res, response) => {
            if (err) done(err);
            if (response) {
                if (response.signedin) {

                    runPluginTests();

                    done();
                } else done(new Error("signedin true missing from response"));
            }
        })
    })
})


function runPluginTests() {

    var config: PluginConfigTestProps = {
        hostname: testconfig.hostname,
        httpprot: testconfig.httpprot,
        httpport: testconfig.httpport,
        tls: testconfig.tls,
        account,
        uri,
        headers,
        timeout,
        mqtturi
    }

    webapi_v3(config)
    webapi_v4(config)

    // TEST PLUGINS
    for (var pluginName of Object.keys(pluginTests)) {

        if (pluginName != "__esModule") {
            if (pluginTests[pluginName]) {
                pluginTests[pluginName](config);
            }
        }

    }
}

// uncomment to run old tests


//test_websockets();