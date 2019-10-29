import { PluginSuperServerside } from "../../server/shared/plugins_super_serverside"
import { Core } from "../../server/core/core";
import { Webserver } from "../../server/core/webserver";
import { DocumentStore } from "../../server/core/data";

import { Teltonika as TeltonikaProtocol } from "./lib/lib_teltonika"
import * as net from "net"
import { logger } from "../../server/shared/log";

interface TeltonikaDBEntry {
    apikey: string
    port: number
}

export default class Teltonika extends PluginSuperServerside {

    minPort = 12001;
    maxPort = 12200;
    connections: TeltonikaProtocol[] = [];

    constructor(props: { core: Core, documentstore: DocumentStore, webserver: Webserver, plugins: any }) {
        super(props);

        var mainteltonika = net.createServer(socket => {


            socket.on("error", (err) => {
                logger.log({ group: "teltonika", message: "error " + err.toString(), level: "error" })
            })

            var device = new TeltonikaProtocol(socket);

            device.on("data", (data: any) => {
                logger.log({ group: "teltonika", message: "data recieved", level: "info" })
                console.log(data);
            })

            device.on("end", () => {
                logger.log({ group: "teltonika", message: "connection end", level: "info" })
            })
        })


        logger.log({ group: "teltonika", message: "server listening on port 12000", level: "info" })
        mainteltonika.listen(12000);

        // start webserver for port 12000 that should ideally handle any teltonika device type

        // this.webserver.app.get("/api/v4/myplugin/test", (req, res) => {
        //      res.json({ test: "successful123!" })
        // })

        // this.webserver.app.post("/api/v4/myplugin/sendtest", (req, res) => {
        //     console.log(req.body);
        //     res.json({ test: "sendtestsuccess", recieved: req.body })
        // })

        this.webserver.app.get("/api/v3/teltonika/info", (req: any, res: any) => {
            this.documentstore.db.plugins_teltonika.findOne({ apikey: req.user.apikey }, (err: Error, result: any) => {
                if (result == null) { res.json({}) }
                console.log(result);
                if (err) { res.json(err); }
                if (result) {
                    delete result.apikey;
                    delete result["_id"]
                    res.json(result);
                }
            })
        });

        this.webserver.app.get("/api/v3/teltonika/reqport", (req: any, res: any) => {
            // check if account has port assigned
            // console.log(req.user)
            this.documentstore.db.plugins_teltonika.findOne({ apikey: req.user.apikey }, (err: Error, result: any) => {
                if (err) { res.json(err); }

                if (result == null) {
                    // no ports yet
                    // find open port
                    this.findOpenPort((err: Error, openport: any) => {
                        // asign to account
                        this.registerPort(req.user, openport, (err: Error, port: any) => {
                            this.connectPort(port);
                            res.json(port);
                        });
                    });

                } else {
                    res.json({ error: "account already has port assigned", port: result.port })
                }
            })

        });

        // open ports at startup
        this.findPorts((err: Error, teltonikaDBentries) => {
            for (var userPort of teltonikaDBentries) {
                this.connectPort(userPort);
            }
        })

        //// end
    }

    findOpenPort(cb: Function) {
        this.documentstore.db.plugins_teltonika.find({}, (e: Error, r: any) => {
            var ports = []
            var found = false;
            for (var p of r) {
                ports.push(p.port);
            }

            //sort ascending
            ports.sort((a, b) => { if (b < a) { return 1 } else return -1 });

            //find first unused
            for (var m = this.minPort; m < this.maxPort; m++) {
                if (ports.indexOf(m) == -1 && found == false) {
                    cb(null, m);
                    found = true;
                    m = this.maxPort + 1;
                } else {
                    found = false;
                }
            }
        })
    }

    findPorts(cb: (err: Error, result?: TeltonikaDBEntry[]) => void) {
        this.documentstore.db.plugins_teltonika.find({}, (err: Error, result: TeltonikaDBEntry[]) => {
            if (err) { cb(err); }
            if (result) { cb(null, result); }
        })
    }


    registerPort(user: any, port: number, cb: Function) {
        var newentry: TeltonikaDBEntry = { apikey: user.apikey, port }
        this.documentstore.db.plugins_teltonika.save(newentry, cb)
    }

    connectPort(userPort: TeltonikaDBEntry) {

        var server = net.createServer((socket) => {
            var device: any = new TeltonikaProtocol(socket);

            device.on("data", (data: any) => {
                data.data.connected = true;

                this.core.user({ apikey: userPort.apikey }, (err, user) => {
                    if (user) {
                        data.meta = { method: "teltonika" }
                        this.core.datapost({ user, packet: data }, (err, result) => {

                        })
                    }
                });

            })

            device.on("end", () => {

                if (device.id == "TELTONIKA_unknown") { return; }

                logger.log({ group: "teltonika", message: "device disconnected", level: "verbose" })

                this.core.user({ apikey: userPort.apikey }, (err, user) => {
                    if (user) {
                        this.core.datapost({ user, packet: { id: device.id, data: { connected: false } } }, (err, result) => { })
                    }
                });

                for (var dev in this.connections) {
                    if (device == this.connections[dev]) {
                        logger.log({ group: "teltonika", message: "removing device from connection list", level: "verbose" })
                        this.connections.splice(parseInt(dev), 1);
                    }
                }
            })

            this.connections.push(device);
        })

        server.listen(userPort.port, () => {
            logger.log({ group: "teltonika", message: "listening on " + userPort.port, level: "verbose" })
        })
    }
};

