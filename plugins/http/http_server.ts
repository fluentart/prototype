import { PluginSuperServerside } from "../../server/shared/plugins_super_serverside"
import { Core } from "../../server/core/core";
import { Webserver } from "../../server/core/webserver";
import { DocumentStore } from "../../server/core/data";
import { generateDifficult } from "../../server/utils/utils";

import { logger } from "../../server/shared/log";

import { HTTPRoute } from "./interfaces"


export default class HTTP extends PluginSuperServerside {

    constructor(props: { core: Core, documentstore: DocumentStore, webserver: Webserver, plugins: any }) {
        super(props);

        /** allows the user to get their list of routes */
        this.webserver.app.get("/api/v3/http/routes", (req: any, res: any) => {
            this.documentstore.db.plugins_http.find({ apikey: req.user.apikey }, (err: Error, routes: any) => {
                if (err) res.json({ err: err.toString() });

                for (var r in routes) {
                    delete routes[r]["_id"]
                    delete routes[r]["apikey"]
                }

                res.json(routes);
            });
        });

        //---------------------------------------------------------------------

        this.webserver.app.post("/api/v3/http/addroute", (req: any, res: any) => {
            if (req.user.level < 1) {
                res.json({ err: "permission denied" });
                return;
            }

            var newroute: HTTPRoute = {
                apikey: req.user.apikey,
                id: req.body.id,
                method: req.body.method,
                route: generateDifficult(32)
            }

            // check for existing
            this.documentstore.db.plugins_http.find({ id: newroute.id, apikey: newroute.apikey },
                (err: Error, conflictingroutes: any) => {
                    if (err) { res.json({ error: "db err" }); return; }

                    if (conflictingroutes.length == 0) {
                        this.documentstore.db.plugins_http.save(newroute, (e: Error, r: any) => {
                            res.json({ result: "success" })
                        });
                    } else {
                        res.json({ error: "Error. That device is already routed." }); return;
                    }

                }
            );

        });

        //---------------------------------------------------------------------

        this.webserver.app.post("/api/v3/http/removeroute", (req: any, res: any) => {
            if (!req.user) { return; }

            this.documentstore.db.plugins_http.remove({
                apikey: req.user.apikey,
                id: req.body.id,
                method: req.body.method
            }, (err: Error, result: any) => {
                if (err) res.json({ err: err.toString() });
                res.json({ result: "success", deletedCount: result.deletedCount })
            });
        });

        //--------------------------------------------------------------------------

        // CONNECT ROUTES!
        // get all routes and connect them at startup
        this.core.on("ready", () => {

            this.documentstore.db.plugins_http.find({}, (err: Error, routes: any) => {
                if (routes) {
                    for (var route of routes) {
                        ///////
                        this.listenRoute(route)
                        ////////////
                    }
                }
            });
        })

        this.documentstore.watch("plugins_http", (err: Error, data: HTTPRoute) => {
            console.log("DB CHANGE DETECTED! HTTP")
            console.log(data);
            if (!data.id) { return; }
            if (!data.method) { return; }
            if (!data.route) { return; }
            if (!data.apikey) { return; }

            this.listenRoute(data);

        })

    }

    addroute(routeOptions: any, apikey: any, cb: any) {


    }

    listenRoute(route: HTTPRoute) {
        logger.log({
            group: "http",
            message: "listening on route " + route.method + " /plugin/http/" + route.route,
            level: "verbose"
        })

        this.webserver.app[route.method]("/plugin/http/" + route.route, (req: any, res: any) => {

            // this.eventHub.emit("device", {
            //     //apikey: config.apikey,
            //     apikey: route.apikey,
            //     packet: {
            //         id: route.id,
            //         data: req.body,
            //         //http: { route: route },
            //         meta: { method: "http" }
            //     }
            // });

            var packet = { id: route.id, data: req.body, meta: { method: "http", path: req.url } }

            this.core.user({ apikey: route.apikey }, (e, user) => {
                this.core.datapost({ user, packet }, () => {
                    res.end("success")
                })
            })



        })
    }

};

