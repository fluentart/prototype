import { PrototypeWS } from "../../shared/prototypews"
var ws = require("ws");


new PrototypeWS({ uri: 'ws://localhost:8080', apikey: "mfyny5hzpudk0k075nq6jdzzyz0uxtkp" })


// client.on('open', function open() {
//     client.send('something');
// });

// client.on('message', function incoming(data) {
//     console.log(data);
// });

export function test() { }