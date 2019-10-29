import { generateDifficult } from "../../utils/utils"
import request = require("request");
import { EventEmitter } from "events";
import { User } from "../../shared/interfaces";


/** this benchmark test simulates: 
 * creating an account 
 * creating a single device 
 * pumping data on that one device. */

export class BenchmarkHTTP extends EventEmitter {
    account: User;
    headers: any;
    uri: string;

    constructor() {
        super();

        this.uri = "http://localhost:8080"

        var testAccount = { email: "test" + generateDifficult(32) + "@iotlocalhost.com", pass: "newUser" };

        request.post(this.uri + "/api/v4/admin/register", { json: testAccount }, (err, res, response) => {
            //if (err) { done(err); return }

            this.account = response.account;
            this.headers = { Authorization: "Basic " + Buffer.from("api:key-" + this.account.apikey).toString("base64") }
            this.emit("ready");

        })
    }

    senddata(cb: Function) {
        var start = this.microtime();
        if (this.account != undefined) {
            var packet = {
                id: "test_httppost",
                data: { random: generateDifficult(32) }
            }

            request.post(this.uri + "/api/v4/data/post",
                { headers: this.headers, json: packet },
                (err, res, response) => {
                    if (response.result == "success") {
                        //console.log("success")
                        var delta = this.microtime() - start;
                        //console.log("time to send:" + delta)
                        cb();
                    } else {
                        //console.log("error")
                    }
                }
            )
        }
    }


    microtime() {
        var start = process.hrtime()
        return parseFloat(start[0] + "." + start[1])
    }
}