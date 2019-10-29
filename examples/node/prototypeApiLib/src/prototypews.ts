const WebSocket = require('ws')


import { EventEmitter } from "events";

export class PrototypeWS extends EventEmitter {
    socket: any;
    apikey: string;
    connected = false;

    constructor(options: { uri: string, apikey: string }) {
        super();
        this.apikey = options.apikey;
        this.socket = new WebSocket(options.uri);

        this.socket.onopen = () => {
            this.sendJSON({ apikey: options.apikey, connect: "true" });
        };

        this.socket.onclose = function close() {
            // todo handle reconnections
        };

        this.socket.onmessage = (message: any) => {

            if (message.data) {
                try {
                    var msg = JSON.parse(message.data);

                    if (msg.auth == "success") {
                        this.emit("connect");
                        this.connected = true;
                    }

                    if (msg.states) {
                        this.emit("states", msg.states)
                    }
                } catch (err) {
                    console.error(err);
                }

            }

        };

        this.on("join", (apikey) => { })
    }


    sendJSON(data: object) {
        this.socket.send(JSON.stringify(data));
    }

    subscribe(key: string) {
        if (this.connected) {
            console.log("subscribing to " + key)
            this.socket.send(JSON.stringify({ key }))
        } else {
            this.on("connect", () => {
                console.log("subscribing to " + key)
                this.socket.send(JSON.stringify({ key }))
            })
        }
    }
}
 