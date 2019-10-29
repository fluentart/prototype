import { describe, it } from "mocha";
import { generateDifficult } from "../utils/utils"
import { Prototype } from "../utils/api"


import { BenchmarkHTTP } from "./benchmarks/http_updaterate"


var a = new BenchmarkHTTP();

a.on("ready", () => {
    var s = a.microtime();
    var count = 0;
    var total = 10000
    for (var b = 0; b <= total; b++) {
        a.senddata(() => {
            count++;
            if (count == total) {
                var delta = a.microtime() - s;
                console.log("time to send:" + delta)
                console.log("packets per second: " + total / delta)
            }
        });
    }
})



// import * as _ from "lodash"
// import { start } from "repl";

// var count = 1;
// var last: any = new Date();

// var packetcounter = 0;

// var lastpacketcounter = 0;

// setInterval(() => {
//     var diff = packetcounter - lastpacketcounter;
//     console.log("packets per second:" + diff)
//     lastpacketcounter = packetcounter;
// }, 1000)

// /*
//   prototype test suite
//   env server=https://prototype.dev.iotnxt.io port=443 https=true npm run test
// */

// // https://mochajs.org/#getting-started

// var toggle = true; //local or online

// var testAccount: any = {};

// if (toggle) {
//     testAccount = {
//         email: "test" + generateDifficult(32) + "@iotlocalhost.com",
//         password: "newUser",

//         /* dev server:                          */
//         // host: "prototype.dev.iotnxt.io",
//         // https: true

//         /* localhost:                           */
//         host: "localhost",
//         https: false,
//         port: 8080
//     }
// } else {
//     testAccount = {
//         email: "test" + generateDifficult(32) + "@iotlocalhost.com",
//         password: "newUser",

//         /* dev server:                          */
//         host: "prototype.dev.iotnxt.io",
//         https: true

//         /* localhost:                           */
//         // host: "localhost",
//         // https: false,
//         // port: 8080
//     }
// }

// class TestBot {
//     email: string;
//     pass: string;
//     protocon: Prototype;
//     count: number = 0;

//     constructor() {

//         this.email = "test" + generateDifficult(32) + "@iotlocalhost.com"
//         this.pass = "newUser"

//         this.protocon = new Prototype({ host: "localhost", port: 8080 })
//         this.protocon.register({ email: this.email, pass: this.pass }, (err, result) => {
//             //console.log(err);
//             //console.log(result);
//             this.sendData();
//         })
//     }

//     sendData() {

//         var packet = { id: "test_httppost", data: { random: generateDifficult(32) } }
//         count++;


//         //var start = microtime();


//         this.protocon.post(packet, (err, result) => {
//             if (result) {
//                 var end = microtime();


//                 packetcounter++;

//                 //console.log("time :" + (end - start))
//                 //console.log(count);
//                 // if (count % 1000 == 0) {
//                 //     var now: any = new Date();
//                 //     var delta = now - last;
//                 //     last = now;
//                 //     console.log(new Date().toISOString() + " " + delta + " " + count);
//                 // }
//                 this.sendData();
//             }
//         })
//     }
// }


// for (var users = 0; users < 100; users++) {
//     var a = new TestBot;
// }


// function microtime() {
//     var start = process.hrtime()
//     return parseFloat(start[0] + "." + start[1])
// }