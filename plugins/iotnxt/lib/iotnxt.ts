import { PluginSuperServerside } from "../../../server/shared/plugins_super_serverside"
import { Core } from "../../../server/core/core";
import { Webserver } from "../../../server/core/webserver";
import { DocumentStore } from "../../../server/core/data";
import { generateDifficult } from "../../../server/utils/utils";
import { Gateway, GatewayType } from "../lib/gateway"
import { User, CorePacket } from "../../../server/shared/interfaces";
import { logger } from "../../../server/shared/log";
import { hostname } from "os";

export interface GatewayAdd {
    GatewayId: string
    Secret: string
    HostAddress: string
    PublicKey: string
}

export interface GatewayRemove {
    GatewayId: string
    HostAddress: string
}

export class IotnxtCore extends PluginSuperServerside {
    name = "iotnxt";
    gateways: Gateway[] = [];

    constructor(props: { core: Core, documentstore: DocumentStore, webserver: Webserver, plugins: any }) {
        super(props);
    }


    /* are we connected to this gateway now? on this cluster node */
    areWeConnectedToGateway(gatewayToCheck: GatewayType): Gateway {
        var found = false;
        for (var gateway of this.gateways) {
            if ((gateway.GatewayId == gatewayToCheck.GatewayId) &&
                (gateway.HostAddress == gatewayToCheck.HostAddress)) {
                found = true;
                return gateway;
            }
        }
        if (found == false) { return undefined; }
    }

    reconnectgateway(query: { gateway: GatewayType, user: User }, cb: any) {

        // set gateway to not connected so we may retry.
        // cluster will then find unconnected gateway and attempt to connect.

        this.documentstore.db.plugins_iotnxt.update(
            { type: "gateway", unique: query.gateway.unique },
            { "$set": { connected: false, lastactive: new Date() } }, (err: Error, result: any) => {

                /** send a message to entire cluster */
                this.plugins.cluster.broadcast({ group: "iotnxt", message: "disconnectGateway", data: query })
                cb(undefined, { reconnect: "true" })

            })

    }

    addgateway(query: { gateway: GatewayAdd, user: User }, cb: any) {
        const user = query.user

        if (user.level <= 0) { cb(new Error("level must be 1 or higher")); return; }

        if (query.gateway.GatewayId.indexOf(" ") >= 0) {
            cb(new Error("No spaces allowed in gateway names"));
            return;
        }

        if (query.gateway.GatewayId == "") {
            cb(new Error("Cannot have blank gateway name"));
            return;
        }


        this.documentstore.db.plugins_iotnxt.find({ GatewayId: query.gateway.GatewayId.toUpperCase() }, (err: Error, result: any) => {
            if (err) { cb(err); console.log(err); return; }
            if (result) {
                if (result.length != 0) { cb(new Error("Gateway with this GatewayId already exists!")); return; }
                //////////////
                // ADD GATEWAY
                var gateway: GatewayType = {
                    GatewayId: query.gateway.GatewayId.toUpperCase(),
                    Secret: query.gateway.Secret,
                    HostAddress: query.gateway.HostAddress,
                    PublicKey: query.gateway.PublicKey,
                    //default: false,
                    connected: false,
                    //connecting: false,
                    unique: generateDifficult(64),
                    type: "gateway",
                    //updated: new Date(),
                    usepublickey: true,
                    error: "",
                    "_created_on": new Date(),
                    "_created_by": { publickey: user["publickey"] }
                };

                this.documentstore.db.plugins_iotnxt.save(gateway, (err: Error, result: any) => { cb(err, result, gateway); });
                //////////////
            }
        })
    }

    /** Removing of gateways */
    removegateway = (query: { gateway: GatewayRemove, user: User }, cb: any) => {
        var { gateway, user } = query;

        var string = query.gateway.GatewayId;
        var caseInsensitiveGatewayId = new RegExp(["^", string, "$"].join(""), "i");

        var dbQuery: any = {
            type: "gateway",
            GatewayId: caseInsensitiveGatewayId,
            HostAddress: query.gateway.HostAddress
        }

        // If you are not admin you can only delete gateways you created.
        if (!user.admin) { dbQuery["_created_by"] = { publickey: query.user.publickey } }

        this.documentstore.db.plugins_iotnxt.remove(dbQuery, (e: Error, r: any) => {
            cb(e, { deletedCount: r.deletedCount })
        });
    }

    // handlenewgateway(gateway: any) {
    //     this.connectGateway(gateway);
    // }

    getgateways(query: { user: User }, cb: any) {
        var { user } = query;
        var dbquery: any = { type: "gateway" }
        if (!user.admin) { dbquery["_created_by.publickey"] = query.user.publickey }
        this.documentstore.db.plugins_iotnxt.find(dbquery, cb);
    }

    /** check if we are connected to a gateway, and if so disconnect from it and remove from our list of local gateway connections */
    disconnectGateway(gateway: GatewayType, cb: any) {
        var gatewayConn = this.areWeConnectedToGateway(gateway)
        if (gatewayConn) {
            gatewayConn.disconnect();

            this.documentstore.db.plugins_iotnxt.update(
                { type: "gateway", unique: gatewayConn.gateway.unique },
                { "$set": { connected: false, lastactive: new Date() } }, (err: Error, result: any) => { })
        }

        //remove from array
        this.gateways = this.gateways.filter(gw => {
            if (gw.GatewayId !== gateway.GatewayId) { return true } else { return false }
        })

        this.emit("updatestate");

        cb();
    }

    connectGateway(gatewaytoconnect: GatewayType) {
        //console.log(process.pid + " is attempting to connect " + gatewaytoconnect.GatewayId)
        logger.log({ group: this.name, message: gatewaytoconnect.GatewayId + "connecting... ", data: { GatewayId: gatewaytoconnect.GatewayId }, level: "verbose" })

        this.documentstore.db.plugins_iotnxt.findOne({ unique: gatewaytoconnect.unique }, (e: Error, gateway: GatewayType) => {

            if (gateway) {
                //////
                /** We have to pass in the db for it to calculate the registration tree structure.. I know. It sucks. */
                var gatewayConnection = new Gateway(gateway, this.documentstore.db)

                gatewayConnection.on("connected", () => {
                    var update = {
                        unique: gateway.unique,
                        connected: true,
                        instance_id: process.pid,
                        hostname: hostname(),
                        lastactive: new Date(),
                        _connected_last: new Date()
                    }
                    //this.updateGatewayDB(gateway.unique, update, () => { })

                    this.documentstore.db.plugins_iotnxt.update(
                        { type: "gateway", unique: gateway.unique },
                        { "$set": update }, (err: Error, result: any) => { })

                    this.emit("updatestate", update);
                })
                //

                /**  New 5.1: 
                 *  gateway connections to iotnxt now don't use apikeys in the route anymore 
                 * we still support this old method for compatibility, only the old gateways will 
                 * still have this behaviour.
                 * */

                // handling incoming requests from commander/portal
                gatewayConnection.on("request", (request: any) => {

                    // UPDATE DB that this gateway is active.
                    var update = {
                        unique: gateway.unique,
                        connected: true,
                        instance_id: process.pid,
                        hostname: hostname(),
                        lastactive: new Date(),
                        _connected_last: new Date()
                    }

                    this.documentstore.db.plugins_iotnxt.update({ type: "gateway", unique: gateway.unique }, { "$set": update }, (err: Error, result: any) => { })
                    this.emit("updatestate", update);

                    // PROPAGATE DATA THROUGH TO USER
                    //this.emit("request", request);
                    //console.log(gateway);
                    //console.log(request);

                    // newer 5.1 gateways use publickey instead for security, so we don't reveal user's apikey.
                    if (gateway.usepublickey) {
                        var packet = request.packet;
                        packet.publickey = request.key

                        this.documentstore.db.states.findOne({ publickey: request.key }, (err: Error, state: CorePacket) => {
                            if (state) {
                                this.core.user({ apikey: state.apikey }, (e, user) => {
                                    this.core.datapost({ user, packet }, () => { })
                                })
                            }
                        })

                    } else {
                        var packet = request.packet;
                        packet.apikey = request.key
                        this.core.user({ apikey: request.key }, (e, user) => {
                            this.core.datapost({ user, packet }, () => { })
                        })

                    }
                })

                /**  update lastactive// connected last on ping response.
                 * if the server responded to our ping request on mqtt, it must mean the 
                 * server is still connected, so we can update the UI
                 * */
                gatewayConnection.on("pingresp", () => {
                    // UPDATE DB that this gateway is active.
                    var update = {
                        unique: gateway.unique,
                        connected: true,
                        instance_id: process.pid,
                        hostname: hostname(),
                        lastactive: new Date(),
                        _connected_last: new Date()
                    }

                    this.documentstore.db.plugins_iotnxt.update({
                        type: "gateway",
                        unique: gateway.unique
                    }, { "$set": update },
                        (err: Error, result: any) => { })
                    this.emit("updatestate", update);
                })


                // propagate errors through to UI by storing in db state.

                gatewayConnection.on("error", (error) => {
                    // console.log("iotnxt.ts error:")
                    // console.log(error);

                    var update = {
                        connected: "error",
                        instance_id: process.pid,
                        hostname: hostname(),
                        lastactive: new Date(),
                        error: error.message
                    }
                    //this.updateGatewayDB(gateway.unique, update, () => { })

                    this.documentstore.db.plugins_iotnxt.update(
                        { type: "gateway", unique: gateway.unique },
                        { "$set": update }, (err: Error, result: any) => { })


                    //remove from array
                    this.gateways = this.gateways.filter(gw => {
                        if (gw.GatewayId !== gateway.GatewayId) { return true } else { return false }
                    })

                    this.emit("updatestate");

                    //this.emit("updatestate", update);

                })

                /** add this gateway connection to our list of connected gateways */
                this.gateways.push(gatewayConnection);

                //////
            } else {
                logger.log({ group: "iotnxt", message: "error finding gateway from db", level: "error" })
            }
        })


    }




    setgatewaydevice(user: any, key: any, gateway: any, id: any, current: any, cb: Function) {
        var changes;
        if (current) {
            changes = "changed gateway from " + current + " to " + gateway.GatewayId
        }
        else {
            changes = "changed gateway to " + gateway.GatewayId + " [via POSTMAN]"
        }

        if (user.level >= 100) {
            //admins
            if (key) {
                this.documentstore.db.states.update({ key }, { $push: { history: { $each: [{ date: new Date(), user: user.username, publickey: user.publickey, change: changes }] } } })
                this.documentstore.db.states.update(
                    { key },
                    { "$set": { "plugins_iotnxt_gateway": { GatewayId: gateway.GatewayId, HostAddress: gateway.HostAddress } } },
                    cb)
            }
            else {
                this.documentstore.db.states.update({ devid: id, apikey: user.apikey }, { $push: { history: { $each: [{ date: new Date(), user: user.username, publickey: user.publickey, change: changes }] } } })
                this.documentstore.db.states.update(
                    { devid: id, apikey: user.apikey },
                    { "$set": { "plugins_iotnxt_gateway": { GatewayId: gateway.GatewayId, HostAddress: gateway.HostAddress } } },
                    cb)
            }
        } else {
            if (key) {
                this.documentstore.db.states.update({ key }, { $push: { history: { $each: [{ date: new Date(), user: user.username, publickey: user.publickey, change: changes }] } } })
                this.documentstore.db.states.update(
                    { key: key, apikey: user.apikey },
                    { "$set": { "plugins_iotnxt_gateway": { GatewayId: gateway.GatewayId, HostAddress: gateway.HostAddress } } },
                    cb)
            }
            else {
                this.documentstore.db.states.update({ devid: id, apikey: user.apikey }, { $push: { history: { $each: [{ date: new Date(), user: user.username, publickey: user.publickey, change: changes }] } } })
                this.documentstore.db.states.update(
                    { devid: id, apikey: user.apikey },
                    { "$set": { "plugins_iotnxt_gateway": { GatewayId: gateway.GatewayId, HostAddress: gateway.HostAddress } } },
                    cb)
            }
        }
    }



    updateGatewayDB(unique: string, update: any, cb: Function) {

    }

    /** this function runs automatically on the node every x time, it finds an inactive gateway and attempts to connect to it. */
    connectIdleGatewayCluster(cb) {
        //     //var time = 24 * 60 * 60 * 1000 * days;

        var time = 1000 * 60 * 5;

        this.documentstore.db.plugins_iotnxt.findAndModify(
            {
                query: { connected: false },
                update: { "$set": { lastactive: new Date(), connected: "connecting", hostname: hostname(), instance_id: process.pid } }
            }, (err: Error, gateway: GatewayType, lasterror: any) => {
                // for now we assume this gateway is unconnected.
                if (gateway) { this.connectGateway(gateway); }
            })
    }

};

