const WebSocket = require('isomorphic-ws')

import { EventEmitter } from "events";
import { logger } from "./log";
export class PrototypeWS extends EventEmitter {
    socket: any;
    apikey: string;
    connected = false;
    uri: string;
    reconnectTimeMS: number = 100;
    reconnectTimeMSReset: number = 100;

    constructor(options: { uri: string, apikey: string }) {
        super();
        this.apikey = options.apikey;
        this.uri = options.uri;

        this.connectSocket();

        //this.on("join", (apikey) => { })
    }

    connectSocket() {
        logger.log({ group: "ws", message: " connecting...", level: "info" })
        this.socket = new WebSocket(this.uri);

        this.socket.onopen = () => {
            this.reconnectTimeMS = this.reconnectTimeMSReset;
            logger.log({ group: "ws", message: "open event", level: "info" })
            this.sendJSON({ apikey: this.apikey, connect: "true" });
        };

        this.socket.onclose = () => {
            logger.log({ group: "ws", message: "close event", level: "info" })
            setTimeout(() => {
                this.reconnectTimeMS *= 2;
                logger.log({ group: "ws", message: "reconnecting..", level: "info" })
                this.connectSocket();
            }, this.reconnectTimeMS)
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

                    if (msg.account) {
                        this.emit("account", msg.account)
                    }

                    if (msg.packet) {
                        this.emit("packet", msg.packet)
                    }

                } catch (err) {
                    console.error(err);
                }

            }

        };
    }

    /** helper function to check state of web socket
     * can be used from web console:
     * api.prototypews.checkState()
     */
    checkState() {
        // logger.log({ group: "ws", message: "pinging...", level: "info" })
        // this.socket.send(JSON.stringify({ ping: true }))
        //0
        if (this.socket.readyState == this.socket.CONNECTING) {
            logger.log({ group: "ws", message: "State: CONNECTING", level: "info" })
        }
        //1
        if (this.socket.readyState == this.socket.OPEN) {
            logger.log({ group: "ws", message: "State: OPEN", level: "info" })
        }
        //2
        if (this.socket.readyState == this.socket.CLOSING) {
            logger.log({ group: "ws", message: "State: CLOSING", level: "info" })
        }
        //3
        if (this.socket.readyState == this.socket.CLOSED) {
            logger.log({ group: "ws", message: "State: CLOSED", level: "info" })
        }
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