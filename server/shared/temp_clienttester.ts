import { PrototypeWS } from "./prototypews"
var ws = require("ws");

setTimeout(() => {
    var protowsclient = new PrototypeWS({ uri: 'ws://localhost:8080', apikey: "mfyny5hzpudk0k075nq6jdzzyz0uxtkp" })

    protowsclient.on("connect", (data) => {
        console.log("connected with authentication")
        console.log(data);
    })

    protowsclient.on("states", (states) => {
        console.log("recieved states:")
        console.log(states);
    })

}, 3000)



// client.on('open', function open() {
//     client.send('something');
// });

// client.on('message', function incoming(data) {
//     console.log(data);
// });

export function test() { }