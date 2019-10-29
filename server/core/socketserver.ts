import { EventEmitter } from "events";

// var socketio = require('socket.io');
// import { Server } from "socket.io"




import { logger } from "../shared/log"
import { Core } from "./core"
import * as _ from "lodash"
import * as http from "http";
import * as https from "https";
import { CorePacket } from "../shared/interfaces";

import * as ws from "ws";

import * as net from "net";
//const WebSocketServer = require("ws").Server
// const WebSocketServerWrapper = require("ws-server-wrapper");


export class SocketServer extends EventEmitter {
    server: http.Server | https.Server;
    io: any;
    wss: ws.Server;

    connections: any = [];

    constructor(options: { server: http.Server | https.Server, core: Core }) {
        super();
        this.server = options.server;
        this.wss = new ws.Server({ server: this.server });

        //// DEBUG

        this.wss.on('connection', (socket: any) => {
            logger.log({ message: "socket new connection", level: "verbose", group: "ws" })
            socket.send(JSON.stringify({ server: "welcome", sendthistoserver: { connect: true, apikey: "yourapikey" } }))

            socket.on('message', (message: string) => {
                logger.log({ message: "socket rx", level: "verbose", group: "ws" })
                try {
                    var msg: any = JSON.parse(message);

                    // login?
                    if (msg.connect) {
                        if (msg.apikey) {
                            options.core.user(msg, (err, user) => {
                                if (err) {
                                    logger.log({ message: "socket join error", level: "error", group: "ws" })
                                }
                                if (user) {
                                    socket.user = user;
                                    socket.subscriptions = [];
                                    this.connections.push(socket);
                                    socket.send(JSON.stringify({ auth: "success" }))
                                }
                            })
                        } else {
                            // anonymous connections to public data streams:
                            // no apikey
                            logger.log({ message: "socket anon connected", level: "warn", group: "ws" })
                            socket.user = {};
                            socket.subscriptions = [];
                            this.connections.push(socket);
                            socket.send(JSON.stringify({ auth: "success" }))
                        }
                    }

                    // logged in:
                    if (socket.user) {

                        if (msg.key) {
                            socket.subscriptions.push(msg.key);
                        }

                        if (msg.id) {
                            console.log(msg);
                            options.core.datapost({ user: socket.user, packet: msg }, (err, result) => {
                                console.log("socket data post ---------")
                                if (err) { console.log(err); }
                                if (result) { console.log(result); }
                                console.log("socket data post --------- end")
                            })
                        }
                    }

                    //////////////
                } catch (err) {
                    socket.send(JSON.stringify({ err: err.toString() }))
                }
            });

            socket.on("end", () => {
                console.log("-------!@! disconnected!")
            })

            socket.on("close", () => {
                console.log("socket closed!");
            });

            socket.on("unexpected-response", () => {
                console.log("socket unexpected-response !")
            })

        })

        // ------------------------------------------------------------------------------------------------------------
        /** this enabled logged in users to instantly update UI if account changes. */
        this.on("users", (account) => {
            for (var socket of this.connections) {
                if (socket.user.apikey == account.apikey) {
                    socket.send(JSON.stringify({ account }))
                }
            }
        })

        // ------------------------------------------------------------------------------------------------------------
        /** updates connected users full device states */
        this.on("states", (states: CorePacket) => {
            if ((states.apikey) && (states.id)) {

                let cleanStates = _.clone(states);
                delete cleanStates["apikey"]

                for (var socket of this.connections) {

                    if (socket.user.apikey == states.apikey) {
                        socket.send(JSON.stringify({ states: cleanStates }))
                    }

                    if (states.public) {
                        // subscriptions
                        for (var sub of socket.subscriptions) {
                            if (sub == states.publickey) {
                                socket.send(JSON.stringify({ states: cleanStates }))
                            }
                        }
                    }
                }
            }
        })

        // ------------------------------------------------------------------------------------------------------------
        /** updates connected users per packet per device (useful for graphs and log widgets) */
        this.on("packets", (packet: CorePacket) => {

            if ((packet.apikey) && (packet.id)) {

                let cleanPacket = _.clone(packet);
                delete cleanPacket["apikey"]
                delete cleanPacket["state"]

                for (var socket of this.connections) {

                    if (socket.user.apikey == packet.apikey) {
                        socket.send(JSON.stringify({ packet: cleanPacket }))
                    }

                    if (packet.public) {
                        // subscriptions
                        for (var sub of socket.subscriptions) {
                            if (sub == packet.publickey) {
                                socket.send(JSON.stringify({ packet: cleanPacket }))
                            }
                        }
                    }
                }
            }

        })
        // ------------------------------------------------------------------------------------------------------------
    }
}



