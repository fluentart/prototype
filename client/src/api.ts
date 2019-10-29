import { EventEmitter } from "events"
import { request } from "./utils/requestweb"
import { User, CorePacket, ClientPacketOptions } from "../../server/shared/interfaces"
import { logger } from "../../server/shared/log"
//import { liteio } from "./utils/liteio"

import { PrototypeWS } from "../../server/shared/prototypews"

// v5.0

interface Data {
    account?: User
    states: CorePacket[],
    /** this is for storing packet history of many devices locally. Used for map view. */
    statesHistory: CorePacket[][]
    packets: CorePacket[]
}

export class API extends EventEmitter {
    uri: string = ""
    headers = {};
    apikey: string;
    accountData: User | undefined;
    socket: any;
    prototypews: PrototypeWS;

    data: Data = {
        account: undefined,
        states: [],
        statesHistory: [],
        packets: []
    }

    subscriptions: any = [];

    /** used by mobile for viewing a device chosen on device list */
    mapFocusDevice;

    constructor() {
        super();
        logger.log({ message: "API initialized", level: "verbose" })
    }

    register(options: { email: string, pass: string }, cb: (err, result?) => void) {
        request.post(this.uri + "/api/v4/admin/register",
            { json: { email: options.email, pass: options.pass } },
            (err, res, body: any) => {
                if (err) cb(err);
                if (body) {
                    if (body.error) { cb(new Error(body.error)); return; }
                    if (body.account.apikey) {
                        this.apikey = body.account.apikey
                        this.rebuildHeader();
                        this.connectSocket();

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

    /** allows you to login using email + pass */
    signin(json: { email: string, pass: string }, cb: Function) {
        request.post(this.uri + "/signin", { json }, (err, res, body: any) => {
            if (err) cb(err);
            if (body) {
                if (body.err) { cb(new Error(body.err)); return; }
                if (body.error) { cb(new Error(body.error)); return; }
                if (body.signedin == true) {
                    cb(null, body);
                }
            }
        })
    }

    // gets our latest account details
    account = (options?: any | Function, cb?: Function) => {
        logger.log({ message: "api account load", level: "verbose" })

        var opt;
        var callback: Function;
        if (typeof options == "function") {
            callback = options;
        } else {
            opt = options;
            if (cb) callback = cb;
        }

        if (opt) {
            logger.log({ message: "api account load1", level: "verbose" })
            request.post(this.uri + "/api/v4/account",
                { json: opt },
                (err, res, body: any) => {
                    if (err) if (callback) callback(err);
                    if (body) {
                        if (body.apikey) {
                            this.data.account = body;
                            //this.data.account = body;
                            this.apikey = body.apikey;
                            if (this.socket == undefined) this.connectSocket();
                        }
                        if (callback) callback(null, body);
                    }
                }
            )
        } else {

            request.get(this.uri + "/api/v4/account",
                { headers: this.headers, json: true },
                (err, res, body: any) => {
                    if (err) if (callback) callback(err);
                    if (body) {
                        if (body.apikey) {
                            this.data.account = body;
                            //this.data.account = body;
                            this.apikey = body.apikey;
                            if (this.socket == undefined) this.connectSocket();
                        } else {
                            // connect anonymous visitors to public data streams
                            if (body.level == 0) {
                                if (this.socket == undefined) this.connectSocket();
                            }
                        }
                        if (callback) callback(null, body);
                    }
                }
            )
        }

    }

    connectSocket() {
        console.log("connecting websocket...")
        var uri = "ws://localhost:8080"
        if (location) {
            uri = location.origin.replace("http", "ws")
        }

        logger.log({ message: "api connect socket", level: "verbose" })
        this.prototypews = new PrototypeWS({ uri, apikey: this.apikey });

        this.prototypews.on("connect", () => {
            logger.log({ message: "Websocket auth success", level: "verbose" })
        });

        this.prototypews.on("states", (states: CorePacket) => {
            this.updateStates(states)
        })

        this.prototypews.on("packet", (packet: CorePacket) => {

            this.emit("packet", packet);
        })

        this.prototypews.on("account", (account: User) => {
            this.data.account = account;
            this.emit("account", account);
        })
    }

    originToWSuri() {
        location.origin
    }

    listenSocketChannel = (channel: any) => {
        channel.on("states", this.updateStates);
    }

    updateStates = (data: CorePacket) => {

        // merge state into states:
        if (Array.isArray(data)) {
            for (var dat of data) {
                this.mergeState(dat)
            }
        } else {
            this.mergeState(data);
        }

        this.emit("state", data);

        // let the app know:
        this.emit("states", this.data.states);
    }

    mergeState = (data: CorePacket) => {

        var stateHistoryUpdated = false;

        const maxhistory = 10;
        // merge statesHistory
        var foundStatesHistory = false;
        for (var s in this.data.statesHistory) {
            if (this.data.statesHistory[s].length != 0) {
                if (this.data.statesHistory[s][0].key == data.key) {
                    foundStatesHistory = true;
                    // check if duplicate..
                    var duplicate = false;
                    for (var st of this.data.statesHistory[s]) {
                        if (st.timestamp == data.timestamp) { duplicate = true; }
                    }
                    if (!duplicate) this.data.statesHistory[s].push(data); // if found we add this packet to this array.
                    stateHistoryUpdated = true;
                }
            }

            if (this.data.statesHistory[s].length > 10) {
                this.data.statesHistory[s].shift();
            }
        }

        if (foundStatesHistory == false) {
            this.data.statesHistory.push([data]);
            stateHistoryUpdated = true;
        }

        if (stateHistoryUpdated) this.emit("stateHistoryUpdated")

        /***** */
        let found: boolean = false;
        for (var s in this.data.states) {
            if (this.data.states[s].key == data.key) {
                //logger.log({ message: "recieved new device state", data: data, level: "verbose" })
                this.data.states[s] = data;
                found = true;
            }
        }

        if (found == false) {
            this.data.states.push(data);
        }

        //update subscriptions
        for (var sub of this.subscriptions) {
            if (data.publickey == sub.publickey) {
                if (sub.cb) { sub.cb(data) }
            }
        }
    }



    version(cb: Function) {
        request.get(this.uri + "/api/v4/version", { json: true }, (err, res, body) => {
            if (err) cb(err);
            if (body) {
                cb(null, body);
            }
        })
    }

    post(packet: CorePacket, cb?: (err: Error | undefined, result?: any) => void) {
        request.post(this.uri + "/api/v4/data/post", { json: packet },
            (err, res, body: any) => {
                if (err) if (cb) cb(err);
                if (body) {
                    if (body.result == "success") {
                        if (cb) cb(undefined, body);
                        return;
                    }
                    if (cb) cb(body);
                }
            })
    }

    // view state of a device by id
    view(query: object, cb: Function) {
        request.post(this.uri + "/api/v4/view",
            { json: query },
            (err, res, body) => {
                if (err) cb(err);
                if (body) {
                    cb(null, body);
                }
            })
    }



    /** To utilize the packets api see below: 
     * 
     * @param find mongodb find query object
     * @param sort mongodb sort query object
     * @param limit number
    */
    packets(options: ClientPacketOptions, cb: Function) {
        request.post(this.uri + "/api/v4/packets",
            { json: options },
            (err, res, body) => {
                if (err) cb(err);
                if (body) {
                    cb(null, body);
                }
            })
    }

    /*  
        retrieve a single device state in detail.
    */

    state(query: object, cb: (err: Error | undefined, state?: CorePacket) => void) {

        if (typeof query == "object") {
            request.post(this.uri + "/api/v4/state",
                { json: query },
                (err: Error, res: boolean, body: any) => {
                    if (err) cb(err);
                    if (body) {
                        cb(undefined, body);
                    }
                })
        }

        // if (typeof a == "string") {
        //     let id = a;
        //     request.post(this.uri + "/api/v4/state",
        //         { headers: this.headers, json: { id } },
        //         (err, res, body: CorePacket) => {
        //             if (err) cb(err);
        //             if (body) {
        //                 cb(null, body);
        //             }
        //         })
        // }


    }

    /*
        provides all device states in an array
    */

    states = (options?: any, cb?: (err: Error | undefined, states?: object) => void) => {
        logger.log({ message: "api states", data: { options }, level: "verbose" })
        var callback: Function;
        var opt;
        if (cb) {
            //options - POST
            callback = cb;
            request.post(this.uri + "/api/v4/states", { json: options }, (err, res, body) => {
                if (err) callback(err);
                if (body) {
                    this.updateStates(body)
                    callback(null, body);
                }
            })

        } else {
            // no options - GET
            callback = options;

            request.get(this.uri + "/api/v4/states",
                { json: true },
                (err, res, body: any) => {
                    if (err) callback(err);
                    if (body) {
                        this.updateStates(body)
                        callback(null, body);
                    }
                })
        }


    }

    /** 
     *   deletes a device/state. Device history is not deleted.
     * 
    */
    delete(options: { id?: string }, cb?: (err: Error | undefined, result?: any) => void) {

        if (typeof options != "object") {
            let err = new Error("delete expects an object {id?,key?}");
            if (cb) { cb(err); } else { console.error(err) }
        }

        request.post(this.uri + "/api/v4/state/delete",
            { json: options },
            (err, res, body: any) => {

                if (err != undefined) {
                    if (cb) { cb(err); }
                }

                if (body) {
                    if (body.ok == 1) {
                        this.data.states = this.data.states.filter((dev) => { (dev.id != options.id) })
                        if (cb) { cb(undefined, body); }
                    } else {
                        if (cb) { cb(body); }
                    }
                }
            })

        return true;
    }



    ////////////////////// WEB API

    location = (location: any) => {
        this.emit("location", location);
    }

    subscribe = (options: { username?: string, publickey?: string }, cb?: Function) => {

        if (options.username) {
            this.search({ username: options.username }, (e, r) => {
                if (r) {
                    let publickey = r.publickey
                    logger.log({ message: "joining publickey", data: { publickey }, level: "verbose", group: "ws" })
                    this.prototypews.subscribe(r.publickey)
                }
            })
        }

        if (options.publickey) {
            logger.log({ message: "joining publickey", data: { publickey: options.publickey }, level: "verbose", group: "ws" })
            this.prototypews.subscribe(options.publickey)

            if (cb) {
                this.subscriptions.push({ publickey: options.publickey, cb })
            }
        }
    }

    /// STANDARDIZED:

    search = (options: any, cb?: (err: Error | undefined, result?: any) => void) => {
        request.post(this.uri + "/api/v4/search",
            { json: options },
            (err, res, body: any) => {
                if (err) if (cb) cb(err);
                if (body) {
                    if (body.error) { if (cb) cb(body); return; }
                    if (cb) cb(undefined, body);
                }
            })
    }

    stateupdate = (options: any, cb?: Function) => {
        request.post(this.uri + "/api/v4/stateupdate",
            { json: options },
            (err, res, body: any) => {
                if (err) if (cb) cb(err);
                if (body) {
                    if (body.error) { if (cb) cb(body); return; }
                    if (cb) cb(null, body);
                }
            })
    }


    activity = (options: any, cb: Function) => {
        request.post(this.uri + "/api/v4/activity",
            { json: options },
            (err, res, body: any) => {
                if (err) cb(err);
                if (body) {
                    if (body.error) { cb(body); return; }
                    cb(null, body);
                }
            })
    }

    getapispec = (cb: Function) => {
        request.get(this.uri + "/api/v4",
            { json: true },
            (err, res, body: any) => { cb(err, body); });
    }

    /** query users to obtain username etc of other users
     * 
     *  eg: api.users({publickey: xxxxxxxx}, (e,user)=>{})
    */
    users = (options: any, cb: Function) => {
        request.post(this.uri + "/api/v4/users",
            { json: options },
            (err, res, body: any) => {
                if (err) cb(err);
                if (body) {
                    if (body.error) { cb(body); return; }
                    cb(null, body);
                }
            })
    }


    mapGoto = (device: CorePacket) => {
        this.mapFocusDevice = device;
        this.emit("mapGoto", device);
        setTimeout(() => {
            this.emit("mapGoto", device);
        }, 1000)
    }

    /** used on mobile to check if the map should focus on a certain device.. */
    mapGetFocusDevice = () => {
        if (this.mapFocusDevice) {
            if (this.mapFocusDevice.retrieved) {
                return undefined;
            } else {
                this.mapFocusDevice.retrieved = true;
                return this.mapFocusDevice;
            }
        } else return undefined;
    }

    // httpget = (url, cb) => {
    //     request.get(this.uri + url,
    //         { json: true },
    //         (err, res, body: any) => { cb(err, body); });
    // }

    // httppost = (url, json, cb) => {
    //     request.post(this.uri + url,
    //         { json },
    //         (err, res, body: any) => { cb(err, body); });
    // }
}

var apiinstance = new API()

const globalAny: any = global;
globalAny.api = apiinstance


export var api = apiinstance
//window.api = api;
