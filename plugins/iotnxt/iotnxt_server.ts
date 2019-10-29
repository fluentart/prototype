import { PluginSuperServerside } from "../../server/shared/plugins_super_serverside"
import { Core } from "../../server/core/core";
import { Webserver } from "../../server/core/webserver";
import { DocumentStore } from "../../server/core/data";
import { generateDifficult } from "../../server/utils/utils";
import { Gateway, GatewayType } from "./lib/gateway"
import { User, DBchange, CorePacket } from "../../server/shared/interfaces";
import { logger } from "../../server/shared/log";
import { hostname } from "os";
import { IotnxtCore } from "./lib/iotnxt"

export default class Iotnxt extends PluginSuperServerside {

    iotnxt: IotnxtCore;

    checker: any;

    constructor(props: { core: Core, documentstore: DocumentStore, webserver: Webserver, plugins: any }) {
        super(props);

        this.iotnxt = new IotnxtCore(props);

        this.iotnxt.on("updatestate", (data) => {
            //console.log("======== CONNECT!")
            //console.log(this.iotnxt.gateways);

            var listofgateways: any[] = []
            for (var gw of this.iotnxt.gateways) {
                var gatewayl = {
                    GatewayId: gw.gateway.GatewayId,
                    HostAddress: gw.gateway.HostAddress,
                    usepublickey: gw.gateway.usepublickey
                }
                listofgateways.push(gatewayl)
            }

            //this.core.setState({ gateways: listofgateways })
            this.core.clusterstate.gateways = listofgateways;

        })


        this.webserver.app.post("/api/v3/iotnxt/addgateway", (req: any, res: any) => {
            this.iotnxt.addgateway({ gateway: req.body, user: req.user }, (err: Error, result: any, gateway: any) => {
                if (err) { res.json({ err: err.toString() }); return; }
                res.json(result);
            });
        });

        this.webserver.app.post("/api/v3/iotnxt/removegateway", (req: any, res: any) => {
            this.iotnxt.removegateway({ gateway: req.body, user: req.user }, (err: Error, result: any) => {
                if (err) { res.json({ err: err.toString() }); return };
                res.json(result);
            });
        });

        this.webserver.app.get("/api/v3/iotnxt/gateways", (req: any, res: any) => {
            this.iotnxt.getgateways({ user: req.user }, (err: Error, gateways: any) => {
                if (err) res.json({ err: err.toString() });
                for (var g in gateways) { delete gateways[g].Secret }
                res.json(gateways);
            });
        });

        this.webserver.app.post("/api/v3/iotnxt/setgatewaydevice", (req: any, res: any) => {
            var gateway = { GatewayId: req.body.GatewayId, HostAddress: req.body.HostAddress }
            this.iotnxt.setgatewaydevice(req.user, req.body.key, gateway, req.body.id, req.body.currentGateway,
                (err: Error, result: any) => {
                    if (err) { res.json({ err: err.toString() }); return; }
                    res.json(result);
                })
        });

        this.webserver.app.post("/api/v3/iotnxt/reconnectgateway", (req: any, res: any) => {
            this.iotnxt.reconnectgateway({ gateway: req.body, user: req.user }, (err: Error, result: any) => {
                if (err) { res.json({ err: err.toString() }); return; }
                res.json(result);
            })
        })

        // stagger checking to avoid race conditions.. mostly.


        ///////////////////////////////////////////////////////////////////////////


        /** This is the main funnel of data into plugin to send on to iotnxt. We listen to packet data on the db, and process it on if needed. */
        /** Checks if a packet that we need to send to a connected gateway connection. 
   * Checks if we are connected to the gateway that we need to send this on.
   */
        this.documentstore.on("packets", (data: DBchange) => {
            if (data.fullDocument) {


                var packet = data.fullDocument

                if (packet.state) {
                    if (packet.state["plugins_iotnxt_gateway"]) {
                        if (packet.data) {
                            var gateway = this.iotnxt.areWeConnectedToGateway(packet.state["plugins_iotnxt_gateway"])
                            if (gateway) {
                                logger.log({ group: "iotnxt", message: hostname() + " " + process.pid + " is sending packet to " + packet.state["plugins_iotnxt_gateway"].GatewayId, level: "verbose" })
                                gateway.handlePacket(packet)
                            }

                        }

                    }
                }

            }
        })




        /** Below not needed, just here for documentation of the system */
        // update client that packets has changed
        // this.documentstore.on("states", (data: DBchange) => {
        //     //console.log("iotnxt plugin states event")
        //     //console.log(data);
        // })

        // // update client that account has changed
        // this.documentstore.on("users", (data: DBchange) => {
        //     //console.log("iotnxt plugin users event")
        // })



        ///////////////////////////////////////////////////////////////////////
        // DELAY as plugins are loaded...
        this.core.on("ready", () => {
            this.clearOldConnections(() => {
                //
                this.checker = setInterval(() => {
                    this.iotnxt.connectIdleGatewayCluster((err: Error, result: any) => { })
                }, 1500 + Math.round(Math.random() * 1500))
                //
            });


            this.plugins.cluster.on("cluster", (packet) => {
                console.log("IOTNXT cluster recieve message")
                console.log(packet);
                if (packet.message == "disconnectGateway") {
                    // check if we are connected to a gateway and disconnect from it, remove from our list.
                    this.iotnxt.disconnectGateway(packet.data.gateway, (e: Error, r: any) => {
                        this.iotnxt.emit("updatestate"); //update cluster state
                    })
                }
                //if (packet.group)
            })

        })
        ///////////////////////////////////////////////////////////////////////
    }





    /** this function goes through the gateways and 
     * checks if the listed gateway cluster worker still exists, if not then marks this gateway as not connected. */
    clearOldConnections(cb: any) {
        //this.plugins.cluster.
        this.plugins.cluster.getlist((err, workers) => {
            this.documentstore.db["plugins_iotnxt"].find({}, (err: Error, gateways: GatewayType[]) => {

                var count = 0;
                //
                for (var gateway of gateways) {
                    var found = false;
                    for (var worker of workers) {
                        if ((gateway.hostname == worker.hostname) && (gateway.instance_id == worker.pid)) {
                            found = true;
                        }
                    }

                    // not connected
                    if (found == false) {
                        this.documentstore.db["plugins_iotnxt"].update({ unique: gateway.unique }, { $set: { connected: false } })
                    }
                }
                //
                cb();
            })
        })


    }

};

