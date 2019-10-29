import { EventEmitter } from "events";
const WebSocket = require('ws');

const WebSocketWrapper = require("ws-wrapper");

export class PrototypeWS extends EventEmitter {
    ws: any;
    uri: string;
    apikey: string;

    constructor(uri: string, options: any) {
        super();

        this.apikey = options.apikey;

        if (uri.split("://")[0] == "http") {
            this.uri = "ws://" + uri.split("://")[1]
        } else {
            this.uri = "wss://" + uri.split("://")[1]
        }


        this.ws = new WebSocketWrapper(new WebSocket(this.uri));

        this.ws.on("connect", (socket) => {
            //this.ws.emit("join", options.apikey);
            this.emit("connect");
            this.ws.emit("join", this.apikey);

            //this.ws.emit("join", options.apikey);

            // this.ws.on('message', (data) => {
            //     console.log("----------ws recv---------")
            //     console.log(data.data);
            //     console.log("-----------------------------")
            // });

            // this.ws.on("post", data) => {
            //     this.emit("data", data);
            // }

            this.listenSocketChannel(this.ws.of(options.apikey));



        });

        // this.ws.on("states", (states) => {
        //     this.emit("states", states);
        // })


        // this.ws.on('open', () => {
        //     //this.ws.send('something');
        //     this.emit("connect");
        // });




        // console.log(options);

        // console.log("proto ws init")

        // setTimeout(()=>{
        //     this.emit("connect", {});
        // },100);


        // this.on("join", (channel) => {
        //     let message = { join: channel }
        //     this.ws.send(JSON.stringify(message))
        // })
    }

    listenSocketChannel = (channel) => {
        channel.on("states", (states) => {
            this.emit("states", states);
        })
    }

    post = (packet) => {
        console.log("posting packet ws")
        this.ws.emit("post", packet);
    }

    disconnect() {
        this.ws.disconnect()
    }
}