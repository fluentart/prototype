import { PluginSuperServerside } from "../../../server/shared/plugins_super_serverside"
import { Core } from "../../../server/core/core";
import { Webserver } from "../../../server/core/webserver";
import { DocumentStore } from "../../../server/core/data";
import { generateDifficult } from "../../../server/utils/utils";
import { Gateway, GatewayType } from "../lib/gateway"
import { User } from "../../../server/shared/interfaces";
import { logger } from "../../../server/shared/log";
import { hostname } from "os";

export class IotnxtCore extends PluginSuperServerside {
    name = "iotnxt";
    gateways: Gateway[] = [];

    constructor(props: { core: Core, documentstore: DocumentStore, webserver: Webserver, plugins: any }) {
        super(props);
    }


    /* are we connected to this gateway now? on this cluster node */
    areWeConnectedToGateway(gatewayToCheck: GatewayType, cb: any) {
        var found = false;
        for (var gateway of this.gateways) {
            if ((gateway.GatewayId == gatewayToCheck.GatewayId) &&
                (gateway.HostAddress == gatewayToCheck.HostAddress)) {
                found = true;
                cb(undefined, gateway);
            }
        }
        if (found == false) { cb({ notfound: true }) }
    }

    reconnectgateway(query: { gateway: GatewayType, user: User }, cb: any) {
        var { gateway, user } = query;
        logger.log({ message: "reconnect gateway " + gateway.GatewayId, level: "warn", group: "iotnxt" })

        this.connectGateway(query.gateway);
    }

    addgateway(query: { gateway: any, user: User }, cb: any) {
        //var gateway = gatewayRequest;
        // if (!user.publickey) {
        //   user["publickey"] = utils.generate(32).toLowerCase();
        // }

        var { gateway, user } = query

        if (user.level <= 0) { cb(new Error("level must be 1 or higher")); return; }

        this.documentstore.db.plugins_iotnxt.find({ GatewayId: gateway.GatewayId }, (err: Error, result: any) => {
            if (err) { cb(err); console.log(err); return; }
            if (result) {
                if (result.length != 0) { cb(new Error("Gateway with this GatewayId already exists!")); return; }
                //////////////
                // ADD GATEWAY
                gateway.default = false; // defaults to not the default
                gateway.connected = false;
                gateway.connecting = false;
                gateway.unique = generateDifficult(64);
                gateway.type = "gateway"
                gateway.updated = new Date();
                gateway.usepublickey = true;
                gateway["_created_on"] = new Date();
                gateway["_created_by"] = { publickey: user["publickey"] };
                this.documentstore.db.plugins_iotnxt.save(gateway, (err: Error, result: any) => { cb(err, result, gateway); });
                //////////////
            }
        })
    }

    /** Removing of gateways */
    removegateway = (query: { gateway: Gateway, user: User }, cb: any) => {
        var { gateway, user } = query;

        var dbQuery: any = {
            type: "gateway",
            GatewayId: query.gateway.GatewayId,
            HostAddress: query.gateway.HostAddress
        }

        // If you are not admin you can only delete gateways you created.
        if (!user.admin) { dbQuery["_createdby"] = { publickey: query.user.publickey } }
        this.documentstore.db.plugins_iotnxt.remove(dbQuery, cb);
    }

    handlenewgateway(gateway: any) {
        this.connectGateway(gateway);
    }

    getgateways(query: { user: User }, cb: any) {
        var { user } = query;
        var dbquery: any = { type: "gateway" }
        if (!user.admin) { dbquery["_created_by.publickey"] = query.user.publickey }
        this.documentstore.db.plugins_iotnxt.find(dbquery, cb);
    }


    connectGateway(gatewaytoconnect: GatewayType) {
        console.log(process.pid + " is attempting to connect " + gatewaytoconnect.GatewayId)
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

                // handling incoming requests from commander/portal
                gatewayConnection.on("request", (request: any) => {
                    console.log("iotnxt incoming request!!!! TODO unhandled in 5.1")
                })

                // error
                gatewayConnection.on("error", (error) => {
                    console.log("iotnxt.ts error:")
                    console.log(error);
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
        //     var time = 1000 * 60;

        this.documentstore.db.plugins_iotnxt.findAndModify(
            {
                query: {
                    connected: false
                    // "$or": [
                    //     { lastactive: undefined },
                    //     { lastactive: { $lt: new Date(Date.now() - time) } }]
                },
                update: { "$set": { lastactive: new Date(), connected: "connecting" } }
            }, (err: Error, gateway: GatewayType, lasterror: any) => {
                // for now we assume this gateway is unconnected.
                if (gateway) { this.connectGateway(gateway); }
            })
    }

};

