import { EventEmitter } from "events";
import { logger } from "../shared/log"

import * as utils from "../utils/utils"

var geoip = require("geoip-lite");

import * as crypto from "crypto"
import { DocumentStore } from "./data";

import * as _ from "lodash"

import * as vm2 from "vm2"

import { User, CorePacket, CorePacketsOptions, ClientPacketOptions } from "../shared/interfaces"

import { cleanString, recursiveSetValue } from "../shared/shared";

export class Core extends EventEmitter {
    db: any;
    salt: string = "nsajkdnasjkdnjkasd";
    config: any;
    clusterstate: any = {};

    constructor(options: { documentstore: DocumentStore, config: any }) {
        super();
        this.db = options.documentstore.db;
        this.config = options.config;
        //logger.log({message:{msg:"Core constructor", options}, level:"info"})
    }

    /** used by plugins to coordinate state across clusters */
    setState(datain: any) {
        this.clusterstate = { ...this.clusterstate, ...datain };
        this.emit("clusterstate", { state: this.clusterstate, change: datain })
    }

    register(options: { email: string, pass: string, username?: string, ip?: string, userAgent?: string }, cb?: (err: Error | undefined, result?: any) => void) {
        logger.log({ message: "core.register", data: options, level: "verbose" });

        //lowercase email
        if (options.email) { options.email = options.email.toLowerCase() }

        //encrypt password
        crypto.scrypt(options.pass, this.salt, 64, (err, derivedKey) => {
            if (err) { logger.log({ message: "core new user registration scrypt error", data: { err }, level: "error" }); }
            if (derivedKey) {
                //////////////
                let now = new Date();

                var user: any = {
                    uuid: utils.generate(128),
                    "_created_on": now,
                    "_last_seen": now,
                    ip: options.ip,
                    userAgent: options.userAgent,
                    password: derivedKey.toString("hex"),
                    email: options.email.toLowerCase(),
                    level: 1,
                    apikey: utils.generate(32),
                    publickey: utils.generate(32).toLowerCase()
                }

                // handle case where no username is provided.
                if (options.username) {
                    user.username = cleanString(options.username);
                } else {
                    user.username = cleanString(options.email.split("@")[0] + Math.round(Math.random() * 10000));
                }



                var ipLoc = geoip.lookup(options.ip);
                if (ipLoc) { user.ipLoc = ipLoc }

                //check if user exists...
                this.user({ email: user.email }, (err, checkuser) => {
                    if (err) { if (cb) cb(err); }
                    if (checkuser == null) {
                        //email is not taken.
                        logger.log({ message: "core new user registration", data: { options }, level: "verbose" })
                        this.db.users.save(user, (err: any, usersaved: any) => {
                            if (err) if (cb) cb(err);
                            if (usersaved) {
                                if (cb) cb(undefined, { account: usersaved });
                            }
                        });
                    } else {
                        //user email is taken!
                        logger.log({ message: "registration failed", data: { reason: "user email already taken", options }, level: "error" })
                        if (cb) {
                            cb(new Error("user email already taken"));
                            return;
                        }
                    }

                })

                //////////////
            }
        });
    }
    // end register

    /** update an account with a change json
     * 
     * EXAMPLE:
     * ```js
     * this.account({ user, change: {"_last_seen": new Date() }})
     * ```
    */
    account(options: { user: User, change: any, ip?: string }, cb?: (err: Error | undefined, result?: any) => void) {
        logger.log({ message: "core.account", data: options, level: "verbose" });

        if (options.user == undefined) {
            logger.log({ message: "BLOCKED! account api use without authentication!", data: { ip: options.ip, change: options.change }, level: "warn" })
            if (cb) { cb(new Error("user not authenticated")) }
            return;
        }

        if ((options.user) && (options.change)) {
            this.db.users.update({ apikey: options.user.apikey },
                { "$set": options.change }, (err: any, result: any) => {
                    if (err) { if (cb) cb(err); }
                    if (result) { if (cb) cb(undefined, result); }
                })
        }
    }
    // end account

    /** used when changing passwords to verify if the user typed in the correct password */
    checkPassword(options: {
        pass: string,
        apikey: string
    }, cb: (err: Error | undefined, user?: any) => void) {
        this.db.users.findOne({ apikey: options.apikey }, (err: any, user: User) => {
            if (user) {
                // check password:
                var passbuf: any = options.pass;
                crypto.scrypt(passbuf, this.salt, 64, (err, derivedKey) => {
                    if (err) { logger.log({ message: "core user signedin password match scrypt error", data: { err }, level: "error" }); }
                    if (derivedKey) {
                        if (derivedKey.toString("hex") == user.password) {
                            logger.log({ message: "core user email password match", data: {}, level: "info" });
                            cb(undefined, user);
                        } else {
                            logger.log({ message: "core user email password mismatch!", data: {}, level: "warn" });
                            cb(new Error("username/password incorrect"))
                        }
                    }
                });
            }

        })
    }

    /** encrypts a string for use to update a password in db */
    encryptPass(password: string, cb: (e: Error | undefined, encrypted: string) => void) {
        var passbuf: any = password;
        crypto.scrypt(passbuf, this.salt, 64, (err, derivedKey) => {
            if (err) {
                logger.log({
                    message: "encryption error",
                    data: { err }, level: "error"
                });
            }

            if (derivedKey) {
                cb(undefined, derivedKey.toString("hex"));
            }
        })
    }

    /** Everything to do with finding a user */
    user(options: { username?: string, uuid?: string, apikey?: string, email?: string, pass?: string, authorization?: string }, cb: (err: Error | undefined, user?: any) => void) {
        logger.log({ message: "core.user", data: options, level: "verbose" });

        // force lowercase on users
        if (options.email) { options.email = options.email.toLowerCase() }

        // finds user from db by Basic Auth base64 key
        if (options.authorization) {
            var auth = Buffer.from(options.authorization.split(" ")[1], 'base64').toString();
            if (auth.split(":")[0] != "api") { cb(new Error("Basic Authorization header username should be api")); return; }
            if (auth.split(":")[1].split("-")[0] != "key") { cb(new Error("Basic Authorization header password should start with key")); return; };

            let apikey = auth.split(":")[1].split("-")[1];
            this.db.users.findOne({ apikey }, (err: Error | undefined, user: any) => {
                if (err) {
                    logger.log({ message: "db err", data: { err }, level: "error" })
                    cb(err);
                }
                if (user) { cb(undefined, user); }
            })
        }
        // or
        if ((options.email) && (options.pass)) {
            if (typeof options.email != "string") { cb(new Error("email must be a string.")); return; }
            this.db.users.findOne({ email: options.email }, (err: Error | undefined, user: any) => {
                if (err) { logger.log({ message: "finding user by email failed.", data: { err }, level: "error" }); cb(err); return; }
                if (user) {
                    // check password:
                    var passbuf: any = options.pass;
                    crypto.scrypt(passbuf, this.salt, 64, (err, derivedKey) => {
                        if (err) { logger.log({ message: "core user signedin password match scrypt error", data: { err }, level: "error" }); }
                        if (derivedKey) {
                            if (derivedKey.toString("hex") == user.password) {
                                logger.log({ message: "core user email password match", data: { user }, level: "info" });
                                cb(undefined, user);
                            } else {
                                logger.log({ message: "core user email password mismatch!", data: { email: options.email }, level: "warn" });
                                cb(new Error("username/password incorrect"))
                            }
                        }
                    });
                }

                if (user == null) {
                    cb(new Error("user account not found"))
                }
            })

        }

        // or apikey
        if (options.apikey) {
            this.db.users.findOne({ apikey: options.apikey }, (err: Error, user: any) => {
                if (err) { cb(err); return; }
                if (user) {
                    cb(undefined, user);
                }

            })
        }

        // or only email
        if ((options.email) && (options.pass == undefined)) {
            this.db.users.findOne({ email: options.email }, (err: Error | undefined, user?: any) => {
                if (err) { cb(err); return; }
                cb(undefined, user);
            })
        }

        // or uuid
        if (options.uuid) {
            this.db.users.findOne({ uuid: options.uuid }, (err: Error | undefined, user?: any) => {
                if (err) { cb(err); return; }
                if (user) {
                    this.account({ user, change: { "_last_seen": new Date() } }, (e, r) => {
                        cb(undefined, user);
                    })

                } else { cb(new Error("user not found by uuid")); }
            })
        }

        // or username
        if (options.username) {
            console.log("finding by username:" + options.username)
            this.db.users.findOne({ username: options.username }, (err: Error | undefined, user?: any) => {
                if (err) { cb(err); return; }
                cb(undefined, user);
            })
        }
    }
    // end user

    datapost(options: { user: User, packet: CorePacket }, cb: (err: any, result?: any) => void) {

        logger.log({ message: "core.datapost", data: options, level: "verbose" });

        if (!options) {
            let error = new Error("options missing")
            logger.log({ message: "core.datapost " + error.toString(), data: options, level: "error" });
            cb(error); return;
        }
        if (!options.packet) {
            let error = new Error("missing packet")
            logger.log({ message: "core.datapost " + error.toString(), data: options, level: "error" });
            cb(error); return;
        }

        if (!options.packet.key) if (!options.packet.id) {
            let error = new Error("missing id")
            logger.log({ message: "core.datapost " + error.toString(), data: options, level: "error" });
            cb(error); return;
        }

        if (options.packet.id) {
            options.packet.id = options.packet.id.toLowerCase();
        }

        /////////////////

        var { packet, user } = options;



        // ERROR CHECK
        var check = this.checkValidCorePacket(packet)
        if (check.passed == false) {
            let error = new Error("invalid core packet");
            logger.log({ message: "core.datapost " + error.toString(), data: options, level: "error" });
            return check.error
        }


        // add a recieved timestamp to the packet.
        packet["_recieved"] = new Date()

        //override from device when this data was valid. for historical graphing and reconnection log purposes
        if (packet.timestamp) {
            packet["timestamp"] = new Date(packet.timestamp)
        } else {
            packet["timestamp"] = new Date()
        }


        // gets this device's state from the db. 
        // todo: get all subscribed instances and perform workflows on the chain, then update db.


        var finddevicequery: any = { user, id: packet.id };

        if (packet.key) { finddevicequery = { user, key: packet.key } }

        this.state(finddevicequery, (err: any, statedb: any) => {
            if (err) { if (cb) cb({ error: "db error" }); return; }

            packet["_recieved"] = new Date()

            var state: CorePacket | any = {};
            if (statedb) {
                state = statedb; //existed!
            } else {
                state = {
                    "_created_on": new Date(),
                    publickey: utils.generate(32),
                    key: utils.generateDifficult(128)
                }
            }

            delete state["_id"]; //sanitize db data

            // timestamp it.
            state["_last_seen"] = new Date();

            //add data from state
            packet.key = state.key;

            //add data from user
            packet.apikey = user.apikey;
            packet.publickey = state.publickey

            packet.userpublickey = user.publickey
            packet.username = user.username

            //if (!packet.id) { return; }
            //packet.id = packet.id.toLowerCase();
            if (state.id) { if (!packet.id) packet.id = state.id }




            //todo: meta
            if (!packet.meta) {
                packet.meta = {};
            }


            //flags force boolean
            if (packet.public != undefined) packet.public = (packet.public == true);

            logger.log({ message: "core.datapost workflow", level: "verbose" });

            // workflow just before saving to db.
            if (!packet.data) packet.data = {};

            // 5.0 to 5.1 compatibility hack
            if (packet.workflowCode) {
                packet.workflowCode = packet.workflowCode.split("state.payload").join("state");
            }
            // 5.0 to 5.1 compatibility hack
            if (state.workflowCode) {
                state.workflowCode = state.workflowCode.split("state.payload").join("state");
            }

            this.workflow({ packet, state }, (err, processedPacket) => {
                logger.log({ message: "core.datapost workflow processed", level: "verbose" });

                // todo: if incoming packet has key, then do not merge.
                // or if { merged: false } 
                delete state["_id"]

                // idea: possibly store previous state into packet aswell so we have both the before and after in each packet?
                if (processedPacket) processedPacket.timestamps = recursiveSetValue(processedPacket, new Date());

                var stateMerged = _.merge(state, processedPacket);
                if (processedPacket == undefined) { console.log("ERROR packet undefined after workflow!"); return; }
                delete processedPacket["_id"]

                // store merged state with packet.
                processedPacket["state"] = stateMerged;
                this.db.packets.save(processedPacket, (err: any, result: any) => {
                    this.db.states.update({ key: stateMerged.key }, stateMerged, { upsert: true }, (err1: any, result1: any) => {
                        if (err1) { console.log(err1) }
                        if (result1) {
                            if (cb) cb(undefined, { result: "success" });
                        }
                    })
                })
            })
            // done!
        });

    }

    // ---------------------------------------
    /** used by POST /api/v4/states */
    states(
        options: {
            request: {
                username?: string
            },
            user: User
        },
        cb: (
            error: { error: string } | Error | undefined,
            result?: CorePacket | CorePacket[] | any) => void
    ) {
        logger.log({ message: "core.states", data: options, level: "verbose" });
        if (options.request) {

            logger.log({ message: "core.states by username", data: options, level: "verbose" });
            if (options.request.username) {

                this.user({ username: options.request.username }, (err: any, user) => {

                    if (!user) {
                        cb({ error: "could not find data" })
                    }

                    if (user) {
                        /**
                         * if a user visits another user's account they will only be able to access
                         * devices that have been shared with them.
                         */
                        this.db.states.find({ apikey: user.apikey, access: options.user.publickey }, (err: Error, states: CorePacket[]) => {
                            if (err) cb(err);
                            if (states) {
                                cb(undefined, states)
                            }
                        })

                    }
                });
            }
            // --

        }
    };

    // ---------------------------------------
    view(options: any, cb: (error: { error: string } | undefined, result?: CorePacket | CorePacket[] | any) => void) {
        logger.log({ message: "core.view", data: options, level: "verbose" });
        var logopt = _.clone(options);
        delete logopt.user;
        logger.log({ message: "core view", data: logopt, level: "verbose" })
        if ((options.user && options.username)) {
            if (options.username == options.user.username) {
                delete options.username;
            }
        }

        console.log("1")

        if (options.publickey) {
            console.log("2")
            this.db.states.findOne({ publickey: options.publickey }, (err: Error, result: CorePacket) => {
                if (err) { cb({ error: err.toString() }) }
                if (result) {
                    var send = false;
                    if (result.public) send = true;

                    if (options.user) {
                        if (options.user.apikey == result.apikey) send = true;
                    }

                    // todo check if shared and so on..

                    if (send) {
                        cb(undefined, result);
                    } else {
                        cb({ error: "device not found" })
                    }
                }
            })

            return;
        }

        // one device
        // own devices
        if ((options.id) && (options.user) && (options.username == undefined)) {
            console.log("3")
            this.db.states.findOne({ apikey: options.user.apikey, id: options.id }, (err: Error, result: any) => {
                if (err) { cb({ error: "db error" }) }
                if (result) {
                    if (result) cb(undefined, result); return;
                } else {
                    cb({ error: "device state not found" }); return;
                }
            })
        }

        if ((options.id) && (options.username)) {
            console.log("4")
            logger.log({ message: "core view device id & username", data: { id: options.id, username: options.username }, level: "verbose" })
            this.user({ username: options.username }, (err, user) => {
                if (err) cb({ error: "db error" });
                if (user) {
                    var query = { $or: [{ apikey: user.apikey, public: true, id: options.id }, { apikey: user.apikey, id: options.id, access: options.user.publickey }] }
                    this.db.states.findOne(query, (err: Error, result: CorePacket | any) => {
                        if (err) { cb({ error: "db error" }); return; }
                        if (result == null) {
                            cb(undefined, { err: "no device found" }); // no device
                            return;
                        }
                        if (result) {
                            delete result["_id"] //cleanup
                            delete result["apikey"] //secure
                            delete result["key"]
                            cb(undefined, result);
                        }
                    })
                }
            })
        }


        // all own devices 
        if ((options.user) && (options.id == undefined) && (options.username == undefined)) {
            console.log("5")
            this.db.states.find({ apikey: options.user.apikey }, (err: Error, result: any) => {
                if (err) { cb({ error: "db error" }); return; }
                cb(undefined, result);
            })
        }

        // all visible devices from a username

        if ((options.username) && (options.user) && (options.id == undefined)) {
            console.log("6")
            logger.log({ message: "core view devices by username", data: { username: options.username }, level: "verbose" })
            let username = options.username;
            this.user({ username }, (err, user) => {
                if (err) cb({ error: "db error" });
                if (user) {
                    this.db.states.find({ apikey: user.apikey, public: true }, (err: Error, result: any) => {
                        if (err) { cb({ error: "db error" }); return; }
                        cb(undefined, result);
                    })
                }
            })
        }
    }

    /** Returns device packet history; 
     * 
     *  
     * */
    packets(options: { request: ClientPacketOptions, user: User }, cb: any) {

        var { request, user } = options;
        logger.log({ message: "core.packets", data: options, level: "verbose" });

        if ((request.find) && (request.sort) && (request.limit)) {
            var { find, sort, limit } = request
            // var query: any = { key: options.request.key }
            // query[request.datapath] = { $exists: true }
            this.db.packets.find(find).sort(sort).limit(limit, cb)
        }

        if ((request.id) && (user)) {
            // like generic api call from v3
            // please note the toLowerCase() since all devices are forced to lowercase when stored to db.
            // the reason for this so we can use device id names for url's
            var query = { id: request.id.toLowerCase(), apikey: user.apikey }
            this.db.packets.find(query).limit(100, cb);
        }
    }


    // returns device state    
    state(options: any, cb: any) {
        logger.log({ message: "core.state", data: options, level: "verbose" });

        if ((options.id) && (options.user)) {
            this.db.states.findOne({ apikey: options.user.apikey, id: options.id }, (err: Error, result: any) => {
                if (err) { cb({ error: "db error" }) }
                logger.log({ message: "core.state id result", data: options, level: "verbose" });
                cb(undefined, result);
            })
        }

        if ((options.key) && (options.user)) {
            this.db.states.findOne({ apikey: options.user.apikey, key: options.key }, (err: Error, result: any) => {
                if (err) { cb({ error: "db error" }) }
                logger.log({ message: "core.state key result", data: options, level: "verbose" });
                cb(undefined, result);
            })
        }
    }

    // --------------------------------- 

    delete(options: any, cb: any) {
        logger.log({ message: "core.delete", data: options, level: "verbose" });

        if ((options.id) && (options.user)) {
            this.db.states.remove({ apikey: options.user.apikey, id: options.id }, (err: Error, result: any) => {
                if (err) { cb({ error: "db error" }); }
                cb(undefined, result);
            })
        }
    }

    // --------------------------------- 

    search(options: any, cb: (err: any, result?: User | User[]) => void) {
        logger.log({ message: "core.search", data: options, level: "verbose" });

        var securityfilter = { username: 1, publickey: 1 }
        if (options.request.searchtext) {
            if (options.request.searchtext.trim() == "") { cb(undefined, []); return; }
            this.db.users.find({
                $or: [{ 'username': { '$regex': options.request.searchtext } },
                { 'email': options.request.searchtext }]
            }, securityfilter, (err: Error, result: User[]) => {
                if (err) { cb({ error: "db error" }); return; }
                if (result) { cb(undefined, result) }
            })
        }

        if (options.request.username) {
            this.db.users.findOne({ username: options.request.username }, securityfilter, (err: Error, result: User) => {
                if (err) { cb({ error: "db error" }); return; }
                if (result) { cb(undefined, result) }
            })
        }
    }

    // --------------------------------- 

    workflow(options: { packet: CorePacket, state: CorePacket }, cb: (err: Error | undefined, result?: CorePacket) => void) {
        logger.log({ message: "core.workflow", data: options, level: "verbose" });

        var packet = options.packet;
        var state = options.state;

        var code = undefined;

        // use new workflowcode if exists on packet, else use from state if exists.
        if (packet.workflowCode) { code = packet.workflowCode; } else {
            if (state.workflowCode) { code = state.workflowCode }
        }

        // if still no workflowCode found, skip workflow.
        if (code == undefined) { cb(undefined, packet); return; }

        let sandbox: any = { packet, state }
        sandbox.callback = (packetProcessed: CorePacket) => {
            packetProcessed.workflowerror = ""
            cb(undefined, packetProcessed)
        }

        const vm = new vm2.VM({ timeout: 100, sandbox })

        try {
            vm.run(code)
        } catch (err) {
            packet.workflowerror = err.toString();
            logger.log({ message: "workflow error", data: { packet, state, err }, level: "debug" })
            cb(undefined, packet);
        }
    }

    // -------------------------------

    /** DEPRECIATED 5.1 
     * manage access to a single device */
    access(options: {
        remove?: boolean, devicekey: string,
        userkey: string, user: User
    }, cb?: (err: Error | undefined, result?: any) => void) {
        logger.log({ message: "core.access", data: options, level: "verbose" });

        if (!options.devicekey) {
            let err = new Error("missing devicekey")
            if (cb) { cb(err) } else console.error(err);
        }
        if (!options.userkey) {
            let err = new Error("missing userkey")
            if (cb) { cb(err) } else console.error(err);
        }

        var query: any = {};
        if (!options.remove)
            query["$addToSet"] = { access: options.userkey }
        else
            query["$pull"] = { access: options.userkey }

        this.db.states.update(
            { key: options.devicekey },
            query,
            (err: Error, result: any) => {
                if (err) {
                    if (cb) { cb(err); } else { console.error(err); }
                }
                if (result) {
                    if (cb) { cb(undefined, result) } else { console.log(result) }
                }
            })
    }

    /** stateupdate - used to remove widgets from device state layout. might be useful for other tasks aswell */
    stateupdate(options: any, cb: any) {
        logger.log({ message: "core.stateupdate", data: options, level: "verbose" });
        if (!options) { return; }
        if (!options.request) { return; }
        if (!options.request.query) { return; }
        if (!options.user) { return; }
        if (!options.user.apikey) { return; }
        options.request.query.apikey = options.user.apikey;
        this.db.states.update(options.request.query, options.request.update, (err: Error, result: any) => {
            if (err) { cb(err); return; }
            if (result) {
                cb(undefined, result);
            }
        })
    }



    // HELPER FUNCTIONS: -------------------------------

    checkValidCorePacket(packet: any): { passed: boolean, error?: string } {

        if (packet.key) {


            if (typeof packet.key != "string") {
                return { passed: false, error: "key must be a string" }
            }
            if (packet.key == "") {
                return { passed: false, error: "key may not be empty" }
            }
            if (packet.key.indexOf(" ") != -1) {
                return { passed: false, error: "key may not contain spaces" }
            }
            if (packet.key.match(/^[a-z0-9_]+$/i) == null) {
                return { passed: false, error: "key may only contain a-z A-Z 0-9 and _" }
            }

            return { passed: true };

        }

        if (packet.id) {


            if (typeof packet.id != "string") {
                return { passed: false, error: "id must be a string" }
            }
            if (packet.id == "") {
                return { passed: false, error: "id may not be empty" }
            }
            if (packet.id.indexOf(" ") != -1) {
                return { passed: false, error: "id may not contain spaces" }
            }
            if (packet.id.match(/^[a-z0-9_]+$/i) == null) {
                return { passed: false, error: "id may only contain a-z A-Z 0-9 and _" }
            }

            return { passed: true };

        }

        return { passed: false, error: "must contain key or id parameter" }
    }

    // -------------------------------

    activity(options: { request: any, user: User }, cb: (err: Error | undefined, result?: any) => void) {

        if (options.request.key && options.request.pathname) {
            console.log("----!")
        }

        if ((options.request.key) && (!options.request.pathname)) {
            this.db.packets.aggregate(
                [
                    {
                        $match: {
                            timestamp: { $gt: new Date("2019-01-01T00:00:00.000Z") },
                            key: options.request.key
                        }
                    },
                    {
                        $group: {
                            _id: {
                                date: {
                                    $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
                                }
                            },
                            day: {
                                $first: {
                                    $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
                                }
                            },
                            value: { $sum: 1 }
                        }
                    },
                    { $sort: { day: 1 } }
                ], (err: Error, results: any) => {
                    if (err) { cb(err); return; }
                    if (results) { cb(undefined, results); }
                }
            );
        }
    }

    // ----------------------------------------------------------------------------------

    users(options: any, cb: any) {
        if (options.request.find) {

            //if you have the publickey you may know the username
            if (options.request.find.publickey) {
                this.db.users.find(options.request.find, { username: 1, publickey: 1 }, cb);
            }

            //only check if username exists (for changing username without conflict)
            if (options.request.find.username) {
                this.db.users.find(options.request.find, { username: 1 }, cb);
            }
        }

    }

}


