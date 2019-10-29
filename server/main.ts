import * as fs from 'fs';
import { Webserver } from "./core/webserver"
import { DocumentStore } from "./core/data"
import { Core } from "./core/core"
import * as cluster from "cluster"
import { logger } from './shared/log';
import { DBchange, User } from "./shared/interfaces"
import * as repl from "repl";
import { SocketServer } from './core/socketserver';

import { cfg } from "./core/config"
import { Migration } from "./utils/migrate"

import * as plugins from "../plugins/plugins_list_server"
import { hostname } from "os"

require('source-map-support').install();
logger.log({ message: "process start", level: "info" })

var numCPUs = require('os').cpus().length;

// Force cluster on single core for dev server testing
if (numCPUs == 1) { numCPUs = 2 }

// dev override
// numCPUs = 1;

interface State {
    isMaster: boolean;
    pid: any;
    numCPUs: any;
    workers: cluster.Worker[];
}

var state: State = {
    isMaster: cluster.isMaster,
    pid: process.pid,
    numCPUs: require('os').cpus().length,
    workers: []
}


if (cluster.isMaster) {

    logger.log({ message: "cluster isMaster", data: { state }, level: "info" })

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        logger.log({ message: "cluster forking", data: { workernum: i }, level: "info" })
        var worker = cluster.fork();
        state.workers.push(worker);
    }

    cluster.on('message', (worker, message, handle) => {
        logger.log({ message: "cluster message", data: { worker, message, handle }, level: "verbose" })
    });

    cluster.on('exit', (worker, code, signal) => {
        logger.log({ message: "cluster fork died", data: { workerpid: worker.process.pid, signal, code }, level: "warn" })
    });

    process.on('message', (msg) => {
        //process.send(msg);
        logger.log({ message: "master process recv", data: { msg }, level: "verbose" });
    });

    setTimeout(() => {

        // expose state to repl context
        var core;
        var documentstore = new DocumentStore({
            mongoConnection: cfg.config.mongoConnection
        });

        documentstore.on("ready", () => {

            core = new Core({ documentstore, config: cfg.config })

            var replserver = repl.start("");
            replserver.context.state = state;
            replserver.context.api = core;

            var migration = new Migration({ documentstore })
        });

    }, 2000)


} else {
    logger.log({ message: "cluster fork active", data: { workerpid: process.pid }, level: "info" })

    var core: Core;
    var webserver: Webserver;
    var socketserver: SocketServer;
    //var mqttserver: MQTTServer;

    var pluginInstances: any = [];
    var pluginInstancesObject: any = {};

    var documentstore = new DocumentStore({ mongoConnection: cfg.config.mongoConnection });



    process.on('message', (msg) => {
        console.log("process message")
        console.log(msg);
        // logger.log({ message: "worker process recv", data: { msg }, level: "verbose" });
        // if (process) if (process.send) if (msg) process.send(msg);
    });

    documentstore.on("ready", () => {
        // only allow webserver to recieve api calls once db is ready.
        core = new Core({ documentstore, config: cfg.config })
        webserver = new Webserver({ core, config: cfg.config });

        if (webserver.serverhttp) socketserver = new SocketServer({ server: webserver.serverhttp, core });
        if (webserver.serverhttps) socketserver = new SocketServer({ server: webserver.serverhttps, core });

        ///////////////////////////////////////////////////////////////////

        // update client that packets has changed
        documentstore.on("packets", (data: DBchange) => {
            if (data.fullDocument) {
                socketserver.emit("packets", data.fullDocument);
            }
        })

        // update client that packets has changed
        documentstore.on("states", (data: DBchange) => {
            if (data.fullDocument) {
                socketserver.emit("states", data.fullDocument);
            }
        })

        // update client that account has changed
        documentstore.on("users", (data: DBchange) => {
            if (data.fullDocument) {
                socketserver.emit("users", data.fullDocument);
            }
        })
        ///////////////////////////////////////////////////////////////////

        var pluginprops = { core, documentstore, webserver, plugins: pluginInstancesObject }

        var loadedplugins: any = plugins;
        for (var pluginname of Object.keys(loadedplugins)) {
            if (pluginname != "__esModule") {
                var pluginClass = loadedplugins[pluginname]
                var pluginInst = new pluginClass(pluginprops);
                pluginInstances.push(pluginInst)
                pluginInstancesObject[pluginname] = pluginInst;
            }

        }

        webserver.listen(() => {
            core.emit("ready");
            logger.log({ message: "worker pid " + process.pid + " on " + hostname() + " ready", level: "info" })
        });
    });
}

// catch errors instead of crashing process.
process.on('uncaughtException', function (err) {
    // handle the error safely
    console.log(err)
})
