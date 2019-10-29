import { PluginSuperServerside } from "../../server/shared/plugins_super_serverside"
import { Core } from "../../server/core/core";
import { Webserver } from "../../server/core/webserver";
import { DocumentStore } from "../../server/core/data";
import { hostname } from "os"
import { logger } from "../../server/shared/log";

export default class Cluster extends PluginSuperServerside {

    heartbeatms = 5000;
    thresholdms: number;

    constructor(props: { core: Core, documentstore: DocumentStore, webserver: Webserver, plugins: any }) {
        super(props);
        this.thresholdms = this.heartbeatms * 2;

        setInterval(() => {
            this.heartbeat();
        }, this.heartbeatms)

        //on startup
        this.heartbeat();

        /** retrieves cluster data from db and sends to user */
        this.webserver.app.get("/api/v4/cluster/info", (req, res) => {
            this.refresh(() => {
                this.documentstore.db.cluster.findOne({ datatype: "clusterWorkers" }, (err, data) => {
                    data.worker = {
                        hostname: hostname(),
                        pid: process.pid,
                        updated: new Date()
                    }
                    res.json(data);
                });
            })

        })

        /** clear out old entries from db */
        this.webserver.app.get("/api/v4/cluster/refresh", (req, res) => {
            this.refresh(() => {
                res.json({ success: true })
            })
        })

        // setTimeout(() => {
        //     this.refresh(() => { })
        // }, this.thresholdms);

        this.on("cluster", (data) => {
            logger.log({ group: "cluster", message: "cluster recieve", data, level: "verbose" })
        })

        // we listen on cluster collection changes for cluster messages. This is so we don't need redis.
        this.documentstore.on("cluster", (data) => {
            if (data.operationType == "replace") { return; }
            if (data.operationType == "update") { return; }
            if (data.operationType == "insert") {
                if (data.fullDocument) {
                    var packet = data.fullDocument;
                    delete packet["_id"]
                    // emit on cluster plugin events.
                    this.emit("cluster", packet);
                }
            }
        })
    }

    broadcast(data: { group: string, message: string, data: any, broadcastTime?: Date }) {
        logger.log({ group: "cluster", message: "cluster broadcast", data, level: "verbose" })
        data.broadcastTime = new Date();
        this.documentstore.db["cluster"].save(data);
    }

    heartbeat() {

        //STARTUP:
        var worker = {
            hostname: hostname(),
            pid: process.pid,
            updated: new Date(),
            state: this.core.clusterstate
        }

        var workerupdate = {
            "$push": {
                workers: worker
            }
        }

        this.documentstore.db.cluster.update({ datatype: "clusterWorkers", "workers.hostname": worker.hostname, "workers.pid": worker.pid }, { $set: { "workers.$": worker } }, (err, result) => {
            // console.log(err)
            // console.log(result);
            if (result) {
                if (result.nModified == 0) {
                    this.documentstore.db.cluster.update({ datatype: "clusterWorkers" }, workerupdate, { upsert: true }, () => { });
                }
            } else {
                this.documentstore.db.cluster.update({ datatype: "clusterWorkers" }, workerupdate, { upsert: true }, () => { });
            }

        })
    }


    refresh(cb) {
        this.documentstore.db.cluster.findOne({ datatype: "clusterWorkers" }, (err, data) => {

            var cleandata = { datatype: "clusterWorkers", workers: [] }

            if (data) {
                for (var worker of data.workers) {
                    var ago = new Date().getTime() - new Date(worker.updated).getTime()
                    if (ago < this.thresholdms) {
                        cleandata.workers.push(worker);
                    }
                }
            }


            this.documentstore.db.cluster.update({ datatype: "clusterWorkers" }, cleandata, (err, res) => {
                cb();
            })
        })
    }

    getlist(cb: (err: Error | undefined, clusterWorkers: any) => void) {
        this.refresh(() => {
            this.documentstore.db.cluster.findOne({ datatype: "clusterWorkers" }, (err: Error, data: any) => {
                data.worker = {
                    hostname: hostname(),
                    pid: process.pid,
                    updated: new Date()
                }
                cb(undefined, data);
            });
        })
    }
};

