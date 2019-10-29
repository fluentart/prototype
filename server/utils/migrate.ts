/** This code helps to migrate database from 5.0.x to 5.1.x */


import { EventEmitter } from "events";
import { logger } from "../shared/log"
import { DocumentStore } from "../core/data";

import * as _ from "lodash"
import { User } from "../shared/interfaces";

import * as utils from "../utils/utils"

export class Migration extends EventEmitter {
    db: any;

    constructor(options: { documentstore: DocumentStore }) {
        super();
        this.db = options.documentstore.db;
        //logger.log({message:{msg:"Core constructor", options}, level:"info"})

        this.migrateDeviceStatesId(() => {
            this.migrateDeviceStateUsernames(() => {
                this.migrateDeviceStateWidgets(() => {
                    this.migrateDeviceStateKeys(() => {
                        console.log("done.")
                    })
                })
            })
        });
    }


    /** migrate device dbs from 5.0 to 5.1 */
    migrateDeviceStatesId(cb: Function) {
        // rename devid to id
        this.db.states.find({ devid: { $exists: true } }, (err: Error, result: any) => {
            var countdone = 0;
            for (var dev of result) {
                // , { $rename: { 'devid': 'id', 'payload.data': 'data' } }
                var id = _.clone(dev.devid);
                dev.id = id;
                delete dev["devid"]
                // -----
                var oldpayload = _.clone(dev.payload)
                dev = { ...oldpayload, ...dev }
                delete dev["payload"]

                this.db.states.update({ _id: dev._id }, dev, (errupd: Error, resultupd: any) => {
                    console.log(resultupd)
                    countdone++;
                    if (countdone == result.length) { console.log(countdone + " device id and payload updated."); cb(); }
                })
            }

            if (result.length == 0) { cb(); }



        })
    }


    migrateDeviceStateUsernames(cb: Function) {
        // add user username to device state (this is mostly optimization)
        var countdone = 0;

        this.db.states.find({ username: { $exists: false } }, (err: Error, result: any) => {
            for (var dev of result) {
                var thisdev = JSON.parse(JSON.stringify(dev)); //clone
                this.db.users.findOne({ apikey: dev.apikey }, (errU: Error, user: User) => {
                    if (user) {
                        //this.db.states.update({ apikey: user.apikey }, { $set: { username: user.username } }, (errUpd: Error, resultUpda: any) => {
                        this.db.states.update({ apikey: user.apikey, username: { $exists: false } }, { $set: { username: user.username } }, (errUpd: Error, resultUpda: any) => {
                            console.log(resultUpda.nModified + " device username updated for user " + user.username)
                            countdone++;
                            if (result.length == countdone) (cb())
                        })
                    }
                })
            }

            if (result.length == 0) cb();
        })
    }

    migrateDeviceStateWidgets(cb: Function) {
        // migrate widgets
        this.db.states.find({ layout: { $exists: true } }, (err: Error, result: any) => {

            if (result.length == 0) cb();

            var counttodo = 0;
            var countdone = 0;

            for (var dev of result) {

                var updatethisdev = false;

                for (var widget of dev.layout) {
                    if (widget.datapath) {

                        if (widget.datapath.indexOf("root.payload.data") >= 0) {
                            widget.datapath = widget.datapath.replace("root.payload.data", "root.data");
                            updatethisdev = true;

                        }

                        if (widget.datapath.indexOf("root.") == 0) {
                            widget.datapath = widget.datapath.slice(5);
                            updatethisdev = true;
                        }



                    }
                    if (widget.type.toLowerCase() == "blank") { widget.type = "basic"; updatethisdev = true; }
                    if (widget.type.toLowerCase() == "chartline") { widget.type = "graph"; updatethisdev = true; }
                }


                if (updatethisdev) {
                    counttodo++;
                    this.db.states.update({ "_id": dev["_id"] }, dev, (e: Error, r: any) => {
                        console.log(dev.id + " widgets migrated for user " + dev.username)
                        countdone++;
                        if (countdone == counttodo) cb();
                    })
                }
            }



        })
        // end migrate widget
    }

    /** add the needed public/private keys to devices that do not have them */
    migrateDeviceStateKeys(cb: Function) {
        this.db.states.find({ $or: [{ publickey: { $exists: false } }, { publickey: null }] }, (e: Error, devices: any[]) => {
            var countdone = 0;
            for (var dev of devices) {
                dev.publickey = utils.generate(32).toLowerCase()
                this.db.states.update({ "_id": dev["_id"] }, dev, (err: Error, result: any) => {
                    countdone++;
                    console.log(dev.id + " publickey added for user " + dev.username)
                    if (countdone == devices.length) {
                        cb();
                    }
                })
            }

            if (devices.length == 0) cb();
        })
    }

}


