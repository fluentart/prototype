import { EventEmitter } from "events"
import * as request from "request" // "./utils/requestweb"
import { User, CorePacket, ClientPacketOptions } from "./interfaces"
//import { console } from "../../server/shared/log"
//import { liteio } from "./utils/liteio"

import { PrototypeWS } from "./prototypews"

// 5.1 

/** test */
interface RegisterResult {
    account: User
}

export class API extends EventEmitter {
    uri: string = "http://localhost:8080" //"ws://localhost:8080"
    headers = {};
    apikey: string;
    accountData: User | undefined;
    socket;
    prototypews;

    data = {
        account: undefined,
        states: [],
        packets: []
    }

    /** enable debug logging? */
    debug = false;

    subscriptions: any = [];

    constructor(options?) {
        super();

        if (options) {
            if (options.uri) this.uri = options.uri

        }

        if (this.debug) console.log({ message: "API initialized", level: "verbose" })
    }

    /** Handles account registration, just send a json object with email and 
     *  password both as strings ofcourse:      * 
     *  
     *  ```ts
     *  // EXAMPLE:
     *  api.register({email: "some@mail.com",pass: "hunt3r"}, (err, account) => {
     *  if (err) console.log(err);
     *      console.log(account);
     *  });
       ```
     * 
     */ 
    register(json: { email: string, pass: string }, cb: (err, result?:{account:User}) => void) {
        request.post(this.uri + "/api/v4/admin/register", {json},(err, res, body: any) => {
                if (err) cb(err);
                if (body) {
                    if (body.err) { 
                        cb(body); 
                        return; 
                    }

                    if (body.account == undefined) { cb(new Error("registeration error")); return; }
                    if (body.account.apikey) {
                        
                        this.apikey = body.account.apikey

                        this.rebuildHeader();
                        this.connectSocket();

                        cb(null, body);
                    }
                }
            });
    }

    /** Takes the apikey and generates the base64 auth header. */
    rebuildHeader() {
        this.headers = {
            Authorization: "Basic " + Buffer.from("api:key-" + this.apikey).toString("base64"),
            "Content-Type": "application/json"
        }
    }

    /** Allows you to login using email + pass 
     * 
     * 
     * ```ts
     * api.signin(randomTestAccount, (err,result) => {
     *  result.signedin = true // signedin?
     *  result.auth = "Basic asdfgjhfdkl" //html header
     * })
     *  ```
    */
    signin(json: { email: string, pass: string }, cb: (err:Error,result?:{signedin:boolean, auth:string})=>void) {
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
        if (this.debug) console.log({ message: "api account load", level: "verbose" })

        var opt;
        var callback;
        if (typeof options == "function") {
            callback = options;
        } else {
            opt = options;
            if (cb) callback = cb;
        }

        if (opt) {
            if (this.debug) console.log({ message: "api account load1", level: "verbose" })
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
        //var uri = "ws://localhost:8080"
        // if (this.location) {
        //     uri = location.origin.replace("http", "ws")
        // }

        var uri = this.uri.replace("http", "ws")

        if (this.debug) console.log({ message: "api connect socket", level: "verbose" })
        this.prototypews = new PrototypeWS({ uri, apikey: this.apikey });

        this.prototypews.on("connect", () => {
            if (this.debug) console.log({ message: "Websocket auth success", level: "verbose" })
        });

        this.prototypews.on("states", (states) => {
            this.updateStates(states)
        })
    }

    listenSocketChannel = (channel) => {
        channel.on("states", this.updateStates);
    }

    updateStates = (data) => {

        // merge state into states:
        if (Array.isArray(data)) {
            for (var dat of data) {
                this.mergeState(dat)
            }
        } else {
            this.mergeState(data);
        }

        // let the app know:
        this.emit("states", this.data.states);
    }

    mergeState = (data) => {
        let found: boolean = false;
        for (var s in this.data.states) {
            if (this.data.states[s].key == data.key) {
                if (this.debug) console.log({ message: "recieved new device state", data: data, level: "verbose" })
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

    post(packet: CorePacket, cb?: (err, result?) => void) {
        request.post(this.uri + "/api/v4/data/post", { headers: this.headers, json: packet },
            (err, res, body: any) => {
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

    // view state of a device by id
    view(query: object, cb: Function) {
        request.post(this.uri + "/api/v4/view",
            { headers: this.headers, json: query },
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
            { headers: this.headers, json: options },
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

    state(query: object, cb: (err: Error, state?: CorePacket) => void) {

        if (typeof query == "object") {
            request.post(this.uri + "/api/v4/state",
                { headers: this.headers, json: query },
                (err, res, body: CorePacket) => {
                    if (err) cb(err);
                    if (body) {
                        cb(null, body);
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

    states = (options?, cb?: (err, states?: object) => void) => {
        if (this.debug) console.log({ message: "api states", data: { options }, level: "verbose" })
        var callback;
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
    delete(options: { id?: string }, cb?: (err: Error, result?: any) => void) {

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
                        if (cb) { cb(null, body); }
                    } else {
                        if (cb) { cb(body); }
                    }
                }
            })

        return true;
    }



    ////////////////////// WEB API

    location = (location) => {
        this.emit("location", location);
    }

    subscribe = (options, cb?: Function) => {

        if (options.username) {
            this.search({ username: options.username }, (e, r) => {
                if (r) {
                    let publickey = r.publickey
                    if (this.debug) console.log({ message: "joining publickey", data: { publickey }, level: "verbose", group: "ws" })
                    this.prototypews.subscribe(r.publickey)
                }
            })
        }

        if (options.publickey) {
            if (this.debug) console.log({ message: "joining publickey", data: { publickey: options.publickey }, level: "verbose", group: "ws" })
            this.prototypews.subscribe(options.publickey)

            if (cb) {
                this.subscriptions.push({ publickey: options.publickey, cb })
            }
        }
    }

    /// STANDARDIZED:

    search = (options, cb?: (err: Error, result?: any) => void) => {
        request.post(this.uri + "/api/v4/search",
            { headers: this.headers, json: options },
            (err, res, body: any) => {
                if (err) cb(err);
                if (body) {
                    if (body.error) { cb(body); return; }
                    cb(null, body);
                }
            })
    }

    stateupdate = (options, cb?) => {
        request.post(this.uri + "/api/v4/stateupdate",
            { headers: this.headers, json: options },
            (err, res, body: any) => {
                if (err) cb(err);
                if (body) {
                    if (body.error) { cb(body); return; }
                    cb(null, body);
                }
            })
    }


    activity = (options, cb) => {
        request.post(this.uri + "/api/v4/activity",
            { headers: this.headers, json: options },
            (err, res, body: any) => {
                if (err) cb(err);
                if (body) {
                    if (body.error) { cb(body); return; }
                    cb(null, body);
                }
            })
    }

    getapispec = (cb) => {
        request.get(this.uri + "/api/v4",
            { headers: this.headers, json: true },
            (err, res, body: any) => { cb(err, body); });
    }

    /** query users to obtain username etc of other users
     * 
     *  eg: api.users({publickey: xxxxxxxx}, (e,user)=>{})
    */
    users = (options, cb) => {
        request.post(this.uri + "/api/v4/users",
            { headers: this.headers, json: options },
            (err, res, body: any) => {
                if (err) cb(err);
                if (body) {
                    if (body.error) { cb(body); return; }
                    cb(null, body);
                }
            })
    }
}

// var apiinstance = new API()

// const globalAny: any = global;
// globalAny.api = apiinstance
// export var api = apiinstance
//window.api = api;
