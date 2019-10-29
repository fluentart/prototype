import * as http from "http"
import * as https from "https"
import * as os from 'os';
import * as dns from 'dns';
import * as url from 'url';

//import * as accounts from "./accounts"

import { logger } from "../shared/log"

/* ------------------------------------------------------------------------- */

export function getGUID() {
    var d = new Date().getTime();
    var uuid: string = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};

/* ------------------------------------------------------------------------- */


/* ------------------------------------------------------------------------- */

interface color {
    r: number;
    g: number;
    b: number;
    a: number;
}

export function blendrgba(x: color, y: color, ratio: number) {

    if (ratio <= 0) {
        return "rgba(" + Math.round(x.r) + "," + Math.round(x.g) + "," + Math.round(x.b) + "," + x.a + ")"
    } else if (ratio >= 1) {
        return "rgba(" + Math.round(y.r) + "," + Math.round(y.g) + "," + Math.round(y.b) + "," + y.a + ")"
    } else {
        var blended = {
            r: (x.r * (1 - ratio)) + (y.r * ratio),
            g: (x.g * (1 - ratio)) + (y.g * ratio),
            b: (x.b * (1 - ratio)) + (y.b * ratio),
            a: (x.a * (1 - ratio)) + (y.a * ratio),
        }
        return "rgba(" + Math.round(blended.r) + "," + Math.round(blended.g) + "," + Math.round(blended.b) + "," + blended.a + ")"
    }

}


/**
 * Deep diff between two object, using lodash
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 */
// export function difference(object: any, base: any) {

//     function changes(object: any, base: any) {
//         return _.transform(object, function (result: any, value: any, key: any) {
//             if (!_.isEqual(value, base[key])) {
//                 result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
//             }
//         });
//     }

//     return changes(object, base);
// }


export function recursiveFlat(inObj: any) {
    var res: any = {};

    (function recurse(obj, current) {
        for (var key in obj) {
            var value = obj[key];
            var newKey: any = (current ? current + "." + key : key);  // joined key with dot
            if (value && typeof value === "object") {
                recurse(value, newKey);  // it's a nested object, so do it again
            } else {
                res[newKey] = value;  // it's not an object, so set the property
            }
        }
    })(inObj);

    return res;
}



export function restJSON(query: any, cb: any) {

    // apikey:string, method: string, path:string,body:Object,

    const myURL = new url.URL(query.path);

    var protocol = myURL.protocol;

    var protocolObject: any;

    var port;

    if (protocol == "http:") {
        protocolObject = http;
        port = 80;
    } else {
        protocolObject = https;
        port = 443;
    }

    if (query.port) { port = query.port }

    if (myURL.port != "") { port = myURL.port }

    var packet = query.body;
    const postData = JSON.stringify(packet);
    const options: any = {
        hostname: myURL.hostname,
        port: port,
        path: myURL.pathname,
        method: query.method,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    if (query.apikey) {
        options.headers.Authorization = "Basic " + Buffer.from("api:key-" + query.apikey).toString("base64");
    }

    var response = "";
    const req = protocolObject.request(options, (res: any) => {
        // HANDLE RESPONSE:
        // console.log(`STATUS: ${res.statusCode}`);
        // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);        
        res.setEncoding('utf8');
        res.on('data', (chunk: any) => { response += chunk; });
        res.on('end', () => {

            var responseJson = JSON.parse(response);

            if (responseJson) {
                cb(undefined, responseJson);
            }

        });
    });

    req.on('error', (e: Error) => { console.error(`problem with request: ${e.message}`); });
    req.write(postData);
    req.end();



}

//generate random strings
export function generate(count: number) {
    var _sym = 'abcdefghijklmnopqrstuvwxyz1234567890'
    var str = '';
    for (var i = 0; i < count; i++) {
        var tmp = _sym[Math.round(Math.random() * (_sym.length - 1))];
        str += "" + tmp;
    }
    return str;
}


export function generateDifficult(count: number) {
    var _sym = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'
    var str = '';
    for (var i = 0; i < count; i++) {
        var tmp = _sym[Math.round(Math.random() * (_sym.length - 1))];
        str += "" + tmp;
    }
    return str;
}

export function createDBIndexes(db: any) {
    // creates optimized indexes
    // meant to be run on first start or when upgrading from an older version
    logger.log({ message: "creating db indexes", data: {}, level: "info" })

    db.states.createIndex({ apikey: 1 })
    db.states.createIndex({ apikey: 1, devid: 1 })
    db.states.createIndex({ "_last_seen": 1 })
    db.states.createIndex({ key: 1 })
    db.states.createIndex({ "plugins_iotnxt_gateway.GatewayId": 1, "plugins_iotnxt_gateway.HostAddress": 1 }, { background: 1 })

    db.packets.createIndex({ "_created_on": 1 })
    db.packets.createIndex({ apikey: 1 })
    db.packets.createIndex({ apikey: 1, devid: 1, "created_on": 1 })
    db.packets.createIndex({ key: 1 }, { background: 1 })

    db.users.createIndex({ uuid: 1 })
    db.users.createIndex({ apikey: 1 })
    db.users.createIndex({ "_last_seen": 1 })
    db.users.createIndex({ username: 1 }, { background: 1 })
    db.users.createIndex({ email: 1 }, { background: 1 }) // gert's fix
    db.users.createIndex({ email: "text", username: "text" }, { background: 1 })
}

