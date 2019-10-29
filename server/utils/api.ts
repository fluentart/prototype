import * as request from "request"
import { EventEmitter } from "events";
import { iotnxt, Gateway } from "./api_prototype_iotnxt"
//import { teltonika } from "./teltonika"

import { PrototypeWS } from "./api_ws"

export interface Packet {
    id: string;
    data: object;
}

export interface Options {
    host?: string;
    apikey?: string;
    protocol?: string;
    id?: string | any;
    https?: boolean;
    port?: number;
}

export class Prototype extends EventEmitter {
    uri: string = ""
    apikey: string = "";
    headers: any = {};
    id = undefined;
    socketclient: any = undefined;
    socketiojoined: boolean = false;
    websocketclient: any;

    mqttclient: any = undefined;
    protocol = "http";
    plugins: any = {};
    host: string = "localhost";

    https: boolean = false;
    httpprot = "http";
    port: number | undefined = undefined;

    constructor(options?: Options) {
        super();
        if (options) {
            //if (options.uri) { this.protocol+"://"+this.host = options.uri; }
            if (options.host) { this.host = options.host }
            if (options.https) { this.https = options.https }

            if (this.https) {
                this.httpprot = "https";
                this.protocol = "https";
            } else {
                this.httpprot = "http"
                this.protocol = "http";
            }

            if (options.apikey) {
                this.apikey = options.apikey;
                this.rebuildHeader();
            }

            if (options.port) { this.port = options.port }

            if (this.port) {
                if ([80, 443].indexOf(this.port) == -1) {
                    this.uri = this.httpprot + "://" + this.host + ":" + this.port;
                } else {
                    this.uri = this.httpprot + "://" + this.host;
                }
            } else {
                this.uri = this.httpprot + "://" + this.host;
            }



            if (options.protocol) {
                this.protocol = options.protocol;
                if (options.protocol == "socketio") {
                    //connect over socket.io
                    this.protocolSocketio();
                }

                if (options.protocol == "mqtt") {
                    //connect over mqtt
                    this.protocolMqtt();
                }

                if (options.protocol == "websocket") {
                    //connect over vanilla websockets
                    this.protocolWebSocket();
                }
            }

            if (options.id) { this.id = options.id };
        }


        //this.plugins.iotnxt = new iotnxt(this);
        //this.plugins.teltonika = new teltonika(this);

    }

    /*
        registers a new account
    */

    register(options: { email: string, pass: string }, cb: (err: any, result?: any) => void) {
        request.post(this.uri + "/api/v4/admin/register", { json: { email: options.email, pass: options.pass } }, (err: Error, res: any, body: any) => {
            if (err) cb(err);
            if (body) {
                if (body.error) { cb(new Error(body.error)); return; }
                if (body.account.apikey) {
                    this.apikey = body.account.apikey
                    this.rebuildHeader();
                    cb(null, body);
                }
            }
        });
    }

    // takes the apikey and generates the base64 auth header
    rebuildHeader() {
        this.headers = {
            Authorization: "Basic " + Buffer.from("api:key-" + this.apikey).toString("base64"),
            "Content-Type": "application/json"
        }
    }

    // gets our latest account details
    account(cb: Function) {
        request.get(this.uri + "/api/v4/account",
            { headers: this.headers, json: true },
            (err: Error, res: any, body: any) => {
                if (err) cb(err);
                if (body) cb(null, body);
            }
        )
    }

    signin(email: string, pass: any, cb: Function) {
        request.post(this.uri + "/signin", { json: { email, pass } }, (err: Error, res: any, body: any) => {
            if (err) cb(err);
            if (body) {
                if (body.err) { cb(new Error(body.err)); return; }
                if (body.error) { cb(new Error(body.error)); return; }
                if (body.signedin == true) cb(null, body);
            }
        })
    }

    version(cb: Function) {
        request.get(this.uri + "/api/v4/version", { json: true }, (err: Error, res: any, body: any) => {
            if (err) cb(err);
            if (body) {
                cb(null, body);
            }
        })
    }

    post(packet: Packet, cb?: (err?: Error | null, result?: any) => void) {

        if ((this.protocol == "http") || (this.protocol == "https")) {
            request.post(this.uri + "/api/v4/data/post", { headers: this.headers, json: packet }, (err: Error, res: any, body: any) => {
                if (err) if (cb) cb(err);
                if (body) {
                    if (body.result == "success") {
                        if (cb) cb(null, body);
                        return;
                    }
                    if (cb) cb(body);
                }
            })
        }

        if (this.protocol == "mqtt") {
            if (this.mqttclient) {
                this.mqttclient.publish(this.apikey, JSON.stringify(packet), { qos: 1 }, cb)
            }
        }

        if (this.protocol == "socketio") {
            if (this.socketclient) {
                //immediate or wait for join if queued function
                if (this.socketiojoined) {
                    this.socketclient.emit("post", packet, () => {
                        if (cb) cb();
                    })
                } else {
                    this.on("connect", () => {
                        this.socketclient.emit("post", packet, () => {
                            if (cb) cb();
                        })
                    })
                }
            }
        }

        if (this.protocol == "websocket") {
            if (this.websocketclient) {
                this.websocketclient.post(packet);
            }
        }

    }

    // view state of a device by id
    view(id: string, cb: Function) {
        request.post(this.uri + "/api/v4/view",
            { headers: this.headers, json: { id } },
            (err: Error, res: any, body: any) => {
                if (err) cb(err);
                if (body) {
                    cb(null, body);
                }
            })
    }

    /*
        retrieve device packet history
    */
    packets(id: string, cb: Function) {
        request.post(this.uri + "/api/v4/packets",
            { headers: this.headers, json: { id } },
            (err: Error, res: any, body: any) => {
                if (err) cb(err);
                if (body) {
                    cb(null, body);
                }
            })
    }

    /*  
        retrieve a single device state in detail.
    */

    state(id: string, cb: Function) {
        request.post(this.uri + "/api/v4/state",
            { headers: this.headers, json: { id } },
            (err: Error, res: any, body: any) => {
                if (err) cb(err);
                if (body) {
                    cb(null, body);
                }
            })
    }

    /*
        provides all device states in an array
    */

    states(cb: Function) {
        request.get(this.uri + "/api/v4/states",
            { headers: this.headers, json: true },
            (err: Error, res: any, body: any) => {
                if (err) cb(err);
                if (body) {
                    cb(null, body);
                }
            })
    }

    /*
        deletes a device/state. Device history is not deleted.
    */
    delete(id: string, cb: Function) {
        request.post(this.uri + "/api/v4/state/delete",
            { headers: this.headers, json: { id } },
            (err: Error, res: any, body: any) => {
                if (err) cb(err);
                if (body) {
                    if (body.ok == 1) {
                        cb(null, body);
                    } else {
                        cb(body);
                    }
                }
            })
    }

    protocolSocketio() {
        // var socketclient = require("socket.io-client")(this.uri, { transports: ['websocket'] })
        // this.socketclient = socketclient;
        // socketclient.on("connect", () => {
        //     console.log("b.connect")
        //     this.emit("connect");

        //     // if (this.apikey == "") { console.error("apikey blank") }
        //     // if (this.id) {
        //     //     socketclient.emit("join", this.apikey + "|" + this.id, () => {
        //     //         this.socketiojoined = true;
        //     //         this.emit("connect");
        //     //     });

        //     // } else {
        //     //     socketclient.emit("join", this.apikey, () => {
        //     //         this.socketiojoined = true;
        //     //         this.emit("connect");
        //     //     });
        //     // }
        //     socketclient.on("post", (data: any) => {
        //         this.emit("data", data);
        //     })
        // })
    }

    protocolWebSocket() {
        var websocketclient = new PrototypeWS(this.uri, { apikey: this.apikey, id: this.id })
        this.websocketclient = websocketclient;

        websocketclient.on("connect", () => {
            this.emit("connect");

            if (this.apikey == "") { console.error("apikey blank") }

            // if (this.id) {
            //     websocketclient.emit("join", this.apikey + "|" + this.id);
            //     this.emit("connect");
            // } else {
            //     websocketclient.emit("join", this.apikey);
            //     this.emit("connect");
            // }

            websocketclient.on("states", (states: any) => {
                this.emit("data", states);
            })
        })
    }

    protocolMqtt() {
        var mqtt = require('mqtt');
        var mqttclient = mqtt.connect('mqtt://' + this.host, { username: "api", password: "key-" + this.apikey });
        this.mqttclient = mqttclient;

        mqttclient.on("connect", () => {
            this.emit("connect");
            if (this.id) {
                mqttclient.subscribe(this.apikey + "|" + this.id);
            } else {
                mqttclient.subscribe(this.apikey);
            }

            mqttclient.on("message", (topic: string, message: any) => {
                this.emit("data", JSON.parse(message.toString()))
            })
        })

    }

    /*
     Disconnects from server
    */

    disconnect() {
        if (this.protocol == "mqtt") {
            if (this.mqttclient) this.mqttclient.end();
        }
        if (this.protocol == "socketio") {
            if (this.socketclient) this.socketclient.disconnect();
        }
        if (this.protocol == "websocket") {
            if (this.websocketclient) this.websocketclient.disconnect();
        }
    }

    /*
    Teltonika set port and verify port operation
   */

    // setTeltonikaPort(cb?: any) {
    //     this.plugins.teltonika.setport((err: Error, result: any) => {
    //         cb(err, result);
    //     })
    // }

    // getTeltonikaPort(cb?: any) {
    //     this.plugins.teltonika.getport((err: Error, result: any) => {
    //         cb(err, result);
    //     })
    // }

    // teltonikaTest(port: any, host: any, cb: any) {
    //     this.plugins.teltonika.teltonikaTest(port, host, (err: Error, result: any) => {
    //         cb(err, result);
    //     })
    // }

    /*-----------------------------------------------------------------------------------------------*/

    /*
   IOTNXT Add gateway ,set gateway to device, get gateway and remove gateway
   */
    addgateway(gateway: Gateway, cb: any) {
        this.plugins.iotnxt.addgateway(gateway, (err: Error, result: any) => {
            cb(err, result);
        })
    }

    setdevicegateway(id: string, GatewayId: string, HostAddress: string, options: any, cb: any) {
        this.state(id, (err: any, device: any) => {
            this.plugins.iotnxt.setgatewaydevice(device.key, id, GatewayId, HostAddress, options, (err: Error, result: any) => {
                cb(err, result);
            })
        })
    }

    getgateways(cb?: any) {
        this.plugins.iotnxt.getgateways((err: Error, result: any) => {
            cb(err, result);
        })
    }

    deletegateway(cb?: any) {
        this.plugins.iotnxt.getgateways((err: Error, result: any) => {
            this.plugins.iotnxt.removegateway(result, (err: Error, result: any) => {
                cb(err, result);
            })
        })
    }

    /*-----------------------------------------------------------------------------------------------*/

    /*
Device sharing
 */
    shareDevice(id: any, cb: Function) {
        this.state(id, (err: any, device: any) => {
            request.post(this.uri + "/api/v4/setprivateorpublic", { json: { public: true, devid: device.key } }, (err, res, body) => {
                if (err) cb(err);
                else if (body) {
                    if (body.nModified == 1) {
                        cb(null, body);
                    } else {
                        cb(body);
                    }
                }
            });
        })
    }

    unshareDevice(id: any, cb: Function) {
        this.state(id, (err: any, device: any) => {
            request.post(this.uri + "/api/v4/setprivateorpublic", { json: { public: false, devid: device.key } }, (err, res, body) => {
                if (err) cb(err);
                else if (body) {
                    if (body.nModified == 1) {
                        cb(null, body);
                    } else {
                        cb(body);
                    }
                }
            });
        })
    }
    /*-----------------------------------------------------------------------------------------------*/

    /*
Device workflow code
*/
    assignDevWorkflow(code: any, id: any, cb: Function) {
        request.post(this.uri + "/api/v4/workflow", { headers: this.headers, json: { code, id } }, (err, res, body) => {
            if (err) cb(err);
            else if (body) {
                if (body.result == "success") {
                    cb(null, body)
                }
                else {
                    cb(body);
                }
            }
        });
    }
    /*-----------------------------------------------------------------------------------------------*/

    /*
Device Dashboard
*/
    assignDevDasboard(id: any, layout: any, cb: Function) {
        this.state(id, (err: any, device: any) => {
            request.post(this.uri + "/api/v4/dashboard", { json: { key: device.key, layout } }, (err, res, body) => {
                if (err) cb(err);
                else if (body) {
                    if (body.nModified == 1) {
                        cb(null, body);
                    } else {
                        cb(body);
                    }
                }
            });
        })
    }
    /*-----------------------------------------------------------------------------------------------*/

    /*
CLEAR DEVICE DATA & WORKFLOW
*/
    //CLEAR DEVICE DATA
    clearDeviceData(id: any, cb: Function) {
        request.post(this.uri + "/api/v4/state/clear", { headers: this.headers, json: { id: id } }, (err, res, body) => {
            if (err) cb(err);
            else if (body) {
                if (body.nModified == 1) {
                    cb(null, body);
                } else {
                    cb(body);
                }
            }
        });
    }

    //CEAR DEVICE DATA & HISTORY
    clearDevDataHist(id: any, cb: Function) {
        this.state(id, (err: any, device: any) => {
            var devices = []
            devices.push(device)
            request.post(this.uri + "/api/v4/state/clear", { headers: this.headers, json: { id: devices, type: "multi", clearhistory: true } }, (err, res, body) => {
                if (err) cb(err);
                else if (body) {
                    if (body.ok == 1) {
                        cb(null, body);
                    } else {
                        cb(body);
                    }
                }
            });
        })
    }
    /*-----------------------------------------------------------------------------------------------*/
}