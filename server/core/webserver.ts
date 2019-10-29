import * as express from "express"

const cookieParser = require('cookie-parser');
const session = require('express-session');
var compression = require('compression')

import { EventEmitter } from 'events';

import * as http from "http";
import * as https from "https";
import * as fs from "fs";
import * as path from "path"

import { logger } from "../shared/log"
import { Core } from "./core"
import { webapiv3 } from "./webapi_v3"
import { webapiv4, apispec } from "./webapi_v4"
import { LogEvent, ConfigFile } from '../shared/interfaces';



export class Webserver extends EventEmitter {
    app: express.Application;
    ssl: any;
    serverhttp: http.Server | undefined;
    serverhttps: https.Server | undefined;
    httpPort: number = 8080;
    httpsPort: number = 443;
    core: Core;

    reactHtml: any;

    constructor(options: { core: Core, config: ConfigFile }) {
        super();



        this.app = express();


        this.app.disable('x-powered-by'); //security
        this.app.use(compression());
        this.app.use(cookieParser());

        // this.app.use(session({
        //     secret: "ajnsjdknasjkdnjkasd",
        //     resave: false,
        //     saveUninitialized: false
        // }))

        this.core = options.core;

        this.app.use(this.nocache);
        this.app.use(this.safeParser);
        this.app.use(this.parseHeaderAuth(this.core));

        this.app.use((req: any, res, next) => {



            var logmsg: LogEvent = {
                message: "http",
                data: {
                    url: req.url,
                    method: req.method,
                    ip: req.socket.remoteAddress
                }, level: "verbose"
            }

            // log current user if logged in (req.user);            
            if (req.user) { logmsg.data.user = { username: req.user.username, email: req.user.email } }

            logger.log(logmsg)
            next();
        })

        this.app.use(express.static(path.resolve(__dirname, '../../../public')))
        this.app.use(express.static(path.resolve(__dirname, '../../../client/dist')))
        this.app.use('/u/:username/view', express.static(path.resolve(__dirname, '../../../client/dist')))
        this.app.use('/u/:username/view/:device', express.static(path.resolve(__dirname, '../../../client/dist')))



        webapiv3(this.app, this.core);
        webapiv4(this.app, this.core);

        var reactHtml = "";
        fs.readFile(path.resolve(__dirname, '../../../public/react.html'), (err, data: any) => {
            this.reactHtml = data.toString();
            reactHtml = data.toString();
        })

        this.app.get("/", (req: any, res) => {

            if (options.config.httpsPort) {
                // check if incoming request is on http or https and redirect to https if needed.
                console.log(req.socket.encrypted)
                if (req.socket.encrypted) {
                    res.end(reactHtml);
                } else {
                    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
                    res.end();
                }
                ////     
                //     
            } else res.end(reactHtml);
        })
        this.app.get("/resources", (req, res) => { res.end(reactHtml); })
        this.app.get("/features", (req, res) => { res.end(reactHtml); })
        this.app.get("/products", (req, res) => { res.end(reactHtml); })

        // account registration, login and recovery
        this.app.get("/register", (req, res) => { res.end(reactHtml); })
        this.app.get("/login", (req, res) => { res.end(reactHtml); })
        this.app.get("/recover", (req, res) => { res.end(reactHtml); })

        // account information once logged in
        this.app.get("/account", (req, res) => { res.end(reactHtml); })
        this.app.get("/docs*", (req, res) => { res.end(reactHtml); })
        this.app.get("/settings", (req, res) => { res.end(reactHtml); })
        this.app.get("/settings/*", (req, res) => { res.end(reactHtml); })
        this.app.get("/settings/account", (req, res) => { res.end(reactHtml); })


        this.app.post("/signin", (req, res) => {
            this.core.user({ email: req.body.email, pass: req.body.pass }, (err: Error | undefined, user: any) => {
                if (err) {
                    logger.log({ message: "web api signin error", data: { err }, level: "error" })
                    res.json({ err: err.toString() }); return;
                }
                if (user) {
                    //signin user
                    var expiryDate = new Date(Number(new Date()) + 315360000000);  //10 years
                    res.cookie('uuid', user.uuid, { expires: expiryDate, httpOnly: true });

                    logger.log({ message: "web api signin", data: { email: user.email }, level: "info" })
                    var auth = 'Basic ' + Buffer.from("api:key-" + user.apikey).toString('base64')
                    res.json({ signedin: true, auth })
                }
            })
        })

        ///////////////////////////////////////////////////////

        this.app.get('/u/:username', (req, res) => { res.end(reactHtml); })
        this.app.get('/u/:username/view', (req, res) => { res.end(reactHtml); })
        this.app.get('/u/:username/view/:id', (req, res) => { res.end(reactHtml); })
        this.app.get('/v/:publickey', (req, res) => { res.end(reactHtml); })

        this.app.get('/signout', (req, res) => {
            console.log("SIGNOUT");
            res.clearCookie("uuid");
            res.redirect('/');
        });

        if (options.config.httpPort) {
            this.httpPort = options.config.httpPort;
        }

        if (options.config.ssl) {
            if (!options.config.sslOptions) { console.error("missing sslOptions from config"); return; }
            this.serverhttps = https.createServer(options.config.sslOptions, this.app);
            if (!options.config.httpsPort) { console.error("missing httpsPort setting from config"); return; }
            this.httpsPort = options.config.httpsPort
            this.serverhttp = http.createServer(this.app);

            //REDIR TO HTTPS
            /*
             * Forward port 80 to https 
             */
            // OCT 21 removed to allow port 80 api access.
            // http.createServer(function (req: any, res: any) {
            //     res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
            //     res.end();
            // }).listen(80);

        } else {
            this.serverhttp = http.createServer(this.app);
        }
    }

    listen(cb?: any) {

        // ADD CATCH 404 INVALID PATHS AT THE END.

        // this.app.get("*", (req, res) => {
        //     //res.status(404).end(reactHtml);
        //     res.status(404).json({ err: 404 })
        // })

        // this.app.post("*", (req, res) => {
        //     res.status(404).json({ error: "404 not found " + req.method + " " + req.url, url: req.url, method: req.method })
        // })

        if (this.serverhttp) {

            this.serverhttp.listen(this.httpPort, () => {
                logger.log({ message: "webserver started", data: { port: this.httpPort }, level: "info" })
                if (cb) cb();
            });
        }

        if (this.serverhttps) {
            this.serverhttps.listen(this.httpsPort, () => {
                logger.log({ message: "webserver started", data: { port: this.httpsPort }, level: "info" })
                if (cb) cb();
            });
        }


    }

    safeParser(req: any, res: any, next: any) {
        var buf = ""
        req.on("data", (chunk: any) => { buf += chunk.toString(); })
        req.on("end", () => {
            if (buf.length > 0) {
                try {
                    var jsonin = JSON.parse(buf)
                    req.body = jsonin;
                    next();
                } catch (err) {
                    res.status(400).json({ "error:": err.toString() + ". Make sure you are sending valid JSON" })
                    next();
                }
            } else { next(); }
        })
    }

    parseHeaderAuth(core: Core) {
        return (req: express.Request | any, res: express.Response, next: express.NextFunction) => {

            if (req.headers.authorization) {
                this.core.user({ authorization: req.headers.authorization }, (err, user) => {
                    if (err) { next(); }
                    if (user) {
                        req.user = user;
                        next();
                    }
                })
            } else if (req.cookies.uuid) {
                this.core.user({ uuid: req.cookies.uuid }, (err, user) => {
                    if (err) {
                        res.clearCookie("uuid");
                        next();
                        return;
                    }
                    if (user) {
                        req.user = user;
                        next();
                    } else {
                        next();
                    }
                })
            } else {
                next();
            }
        }
    }


    nocache(req: Express.Request, res: any, next: any) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        next();
    }


}  
