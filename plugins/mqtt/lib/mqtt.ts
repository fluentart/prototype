// http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718037
// https://docs.solace.com/MQTT-311-Prtl-Conformance-Spec/MQTT%20Control%20Packet%20format.htm#_Toc430864887

import { EventEmitter } from "events"
import * as net from "net";
import * as tls from "tls";

import * as _ from "lodash"
import { DBchange, CorePacket, User } from "../../../server/shared/interfaces";
import { logger } from "../../../server/shared/log";
import { generateDifficult } from "../../../server/utils/utils";


var mqttpacket = require('mqtt-packet')

export class MQTTServer extends EventEmitter {
    serversMem: any[] = [];
    db: any;
    app: any;
    name = "MQTT";

    mqttConnections: any = [];
    isCluster: boolean = false;
    ev: any;
    clustersubs: string[] = [];

    protocol: string = "mqtt"; //default

    constructor(options: { mqtts: boolean, sslOptions?: any }) {
        super();

        var server = (options.mqtts)
            ? tls.createServer(options.sslOptions, this.handleSocket)
            : net.createServer(this.handleSocket);

        if (options.mqtts) {
            this.protocol = "mqtts"; //override
            logger.log({ group: "mqtt", message: "tls server listening on port 8883", data: {}, level: "verbose" })
            server.listen(8883);
        } else {
            logger.log({ group: "mqtt", message: "server listening on port 1883", data: {}, level: "verbose" })
            server.listen(1883);
        }


        // incoming packets from cluster
        this.on("packets", (packets) => {
            this.handlePacket(packets);
        })
    }

    handleSocket = (socket: net.Socket | tls.TLSSocket) => {
        logger.log({ group: "mqtt", message: "new socket", data: { remoteAddress: socket.remoteAddress, protocol: this.protocol }, level: "verbose" })
        var client = new mqttConnection({ socket })

        client.on("connect", (data) => {
            logger.log({ message: "mqtt client conn", data: { data }, level: "verbose" })
            this.mqttConnections.push(client);
        })

        client.on("subscribe", (packet, cb) => {
            if (client.subscriptions.includes(packet.subscribe) == false) {
                logger.log({ message: "mqtt subscr", data: { sub: packet.subscribe }, level: "verbose" })
                client.subscriptions.push(packet.subscribe);
                cb();
            }
        })

        /** forward auth request to plugin */
        client.on("userauth", (apikey, cb) => { this.emit("userauth", apikey, cb); })

        client.on("publish", (data, cb) => {
            data.packet.meta.protocol = this.protocol;
            this.emit("publish", data, cb);
        })

        client.on("error", (err: any) => {
            logger.log({ message: "mqtt error", data: { err }, level: "error" });
        })

        client.on("ping", () => { })
    }

    handlePacket(packet: CorePacket) {
        if (!packet.id) { return; }
        if (!packet.apikey) { return; }

        for (var mqttConnection of this.mqttConnections) {
            for (var sub of mqttConnection.subscriptions) {
                if ((sub == packet.apikey) || (sub == packet.apikey + "|" + packet.id)) {

                    //var temp = _.clone(packet);

                    // delete temp["meta"]
                    // delete temp.timestamp
                    // if (temp.err != undefined) {
                    //     if (temp.err == "") {
                    //         delete temp.err
                    //     }
                    // }

                    if (mqttConnection.connected) {
                        var sendit = true;

                        // // check if this is not the same socket that sent the packet, if so then we do not echo it back.
                        // if (_.has(packet, "payload.meta.socketUuid")) {
                        //     if (packet.payload.meta.socketUuid == mqttConnection.uuid) {
                        //         sendit = false;
                        //     }
                        // }

                        if (sendit) {
                            logger.log({ message: "mqtt handlePacket", data: { apikey: packet.apikey, packet: packet }, level: "verbose" });
                            mqttConnection.publish(packet.apikey, JSON.stringify(packet))
                        }
                    }
                }
            }
        }
    }

}









export class mqttConnection extends EventEmitter {
    socket: net.Socket;
    apikey: string = "";
    subscriptions: any = [];
    connected: Boolean = false;
    uuid: string = "";
    data: Buffer;
    packetCount: number = 0;
    parser: any;
    user: any;

    constructor(options: { socket: net.Socket }) {
        super()

        this.socket = options.socket;

        var opts = { protocolVersion: 4 } // default is 4. Usually, opts is a connect packet
        this.parser = mqttpacket.parser(opts);

        this.data = Buffer.from("");
        this.uuid = generateDifficult(32);

        this.connected = true;

        this.parser.on("packet", (packet: any) => {
            logger.log({ group: "mqtt", message: "packet " + packet.cmd, data: {}, level: "verbose" })
            if (packet.cmd == "connect") {
                /*
                0x00 Connection Accepted
                0x01 Connection Refused, unacceptable protocol version
                0x02 Connection Refused, identifier rejected
                0x03 Connection Refused, Server unavailable
                0x04 Connection Refused, bad user name or password
                0x05 Connection Refused, not authorized
                */

                // check authentication
                if (packet.username != "api") {
                    //disconnect wrong username/pass
                    this.socket.write(mqttpacket.generate({ cmd: "connack", returnCode: 4 }))
                    return;
                }

                if (packet.password) {
                    var apikeyParse = packet.password.toString().split("-");

                    // error check
                    if ((apikeyParse.length != 2) || (apikeyParse[0] != "key")) {
                        //disconnect wrong username/pass
                        console.log("mqtt apikey format fail")
                        this.socket.write(mqttpacket.generate({ cmd: "connack", returnCode: 4 }))
                        return;
                    }

                    // looks okay, check db
                    if ((apikeyParse[0] == "key") && (apikeyParse.length == 2)) {

                        var apikey = apikeyParse[1]; // after the key-

                        // check if this is a valid user?
                        this.emit("userauth", apikey, (err: Error, user: User) => {
                            if (err) {
                                //disconnect wrong username/pass
                                this.socket.write(mqttpacket.generate({ cmd: "connack", returnCode: 4 }))
                                return;
                            }

                            if (user) {

                                logger.log({ group: "mqtt", level: "verbose", message: "mqtt user authed " + user.username, data: {} })
                                this.user = user;
                                this.apikey = apikey;
                                this.emit("connect", { apikey: this.apikey })

                                this.socket.write(mqttpacket.generate({
                                    cmd: 'connack',
                                    returnCode: 0
                                }));
                            }
                        })




                    }

                }
            }

            /** handle subscriptions with callback */
            if (packet.cmd == "subscribe") {
                var count = 0;
                for (var sub of packet.subscriptions) {
                    this.emit("subscribe", { subscribe: sub.topic.toLowerCase() }, () => {
                        count++;

                        if (count == packet.subscriptions.length) {

                            this.socket.write(mqttpacket.generate({
                                cmd: 'suback',
                                messageId: packet.messageId,
                                granted: [0]
                            }));
                        }
                    })
                }
            }

            if (packet.cmd == "publish") {
                ///////////

                // error catching..

                try {
                    var requestClean = JSON.parse(packet.payload)
                    if (requestClean.data == undefined || requestClean.id == undefined) {
                        logger.log({ message: "mqtt data/id parameter missing", data: {}, level: "warn" })
                    } else {
                        logger.log({ message: "mqtt publish recv", data: {}, level: "info" })
                        requestClean.meta = {
                            "remoteip": this.socket.remoteAddress,
                            //"User-Agent": "MQTT",
                            //"method": "publish",
                            //"socketUuid": "..."
                        }

                        this.emit("publish", { user: this.user, apikey: this.apikey, packet: requestClean },
                            (err: Error, result: any) => {
                                logger.log({ group: "mqtt", message: "publish success", data: {}, level: "verbose" })
                                if (packet.qos > 0) {
                                    this.socket.write(mqttpacket.generate({
                                        cmd: 'puback',
                                        messageId: packet.messageId
                                    }))
                                }
                            })
                        // this now needs to be processed and saved to db.



                    }
                } catch (err) {
                    logger.log({ message: "mqtt parse error", data: { err }, level: "error" });
                }



                /////////////
            }
        })

        this.socket.on("close", (err) => {
            //this.connected = false;
            //this.emit("close", err);
        })

        this.socket.on("connect", () => { })
        this.socket.on("data", (chunk) => { this.parser.parse(chunk); })
        this.socket.on("drain", () => { })
        this.socket.on("end", () => { });
        this.socket.on("error", (err) => { })
        this.socket.on("timeout", () => { })
        this.socket.on("lookup", (err, address, family, host) => { })
    }

    publish = (topic: string, data: any) => {
        if (typeof data != "string") {
            data = JSON.stringify(data)
        }

        try {
            this.socket.write(mqttpacket.generate({
                cmd: 'publish',
                topic,
                payload: Buffer.from(data)
            }))
        } catch (err) {
            logger.log({ message: "mqtt publish", data: { err }, level: "error" });
        }

    }

}
