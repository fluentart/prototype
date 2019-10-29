import { Core } from "./core";
import * as express from "express"
import * as _ from 'lodash'

import { APIdocumentation } from "../shared/interfaces"


export var apispec: APIdocumentation[] = [];

export function webapiv4(app: express.Application, core: Core) {

    //** For now we do not document this, might be abused. */
    // apispec.push({
    //     method: "post",
    //     path: "/api/v4/admin/register",
    //     description: "registration of accounts",
    //     post: { email: "valid email address", username: "account username", pass: "yourpassword" }
    // })
    app.post("/api/v4/admin/register", (req: any, res) => {
        core.register({
            email: req.body.email,
            username: req.body.username,
            pass: req.body.pass,
            userAgent: req.get('User-Agent'),
            ip: req.ip
        }, (err: any, user) => {
            if (err) res.json({ err: err.toString() });
            if (user) {
                if (user.account) {
                    //signin user
                    var expiryDate = new Date(Number(new Date()) + 315360000000);  //10 years
                    res.cookie('uuid', user.account.uuid, { expires: expiryDate, httpOnly: true });
                    res.json(user);
                }
            }
        })
    })


    // ----------------------------------------------------------------------------------

    // post packet data
    apispec.push({
        method: "post",
        path: "/api/v4/data/post",
        description: `Create a new device by using a unique id. Post again with new data to update. This post packet can contain 
        many other properties that may be useful.`,
        post: {
            "id": "yourDevice001",
            "data": {
                "temperature": 24.54,
                "doorOpen": false,
                "gps": {
                    "lat": 25.123,
                    "lon": 28.125
                }
            }
        },
        response: { result: "success" }
    })
    app.post("/api/v4/data/post", (req: any, res) => {
        core.datapost({ packet: req.body, user: req.user }, (err: object, result: object) => {
            if (err) { res.status(400).json(err); }
            if (result) { res.json(result); }
        })
    })

    // ----------------------------------------------------------------------------------

    apispec.push({
        description: "Get all your device state information.",
        method: "get",
        path: "/api/v4/states",
        response: [{
            "_created_on": "2019-09-04T12:34:23.196Z",
            "_last_seen": "2019-09-11T15:29:36.870Z",
            "_recieved": "2019-09-11T15:29:36.870Z",
            "_timestamp": "2019-09-11T15:29:36.868Z",
            "publickey": "xxxx",
            "key": "xxxx",
            "id": "poolsensor",
            "data": {
                "temperature": 30,
                "gps": {
                    "lat": -24.12435,
                    "lon": 21.586536
                }
            },
            "public": true,
            "userpublickey": "xxxx",
            "username": "joe",
            "meta": {},
            "history": [],
            "layout": []
        }]
    })

    app.get("/api/v4/states", (req: any, res) => {
        core.view({ user: req.user }, (err, result) => {
            if (err) { res.status(400).json(err); }
            if (result) { res.json(result); }
        })
    })

    // ----------------------------------------------------------------------------------

    apispec.push({
        description: "Get allowed device states from any account.",
        method: "post",
        path: "/api/v4/states",
        post: { username: "someusername" },
        response: [{
            "_created_on": "2019-09-04T12:34:23.196Z",
            "_last_seen": "2019-09-11T15:29:36.870Z",
            "_recieved": "2019-09-11T15:29:36.870Z",
            "_timestamp": "2019-09-11T15:29:36.868Z",
            "publickey": "xxxx",
            "key": "xxxx",
            "id": "poolsensor",
            "data": {
                "temperature": 30,
                "gps": {
                    "lat": -24.12435,
                    "lon": 21.586536
                }
            },
            "public": true,
            "userpublickey": "xxxx",
            "username": "joe",
            "meta": {},
            "history": [],
            "layout": []
        }]
    })

    app.post("/api/v4/states", (req: any, res) => {
        //var options = _.clone(req.body)
        var options: any = {
            user: req.user,
            request: req.body
        };

        core.states(options, (err, result) => {
            if (err) { res.status(400).json(err); }
            if (result) { res.json(result); }
        })
    })

    // ----------------------------------------------------------------------------------

    // view state simple
    apispec.push({
        method: "post",
        path: "/api/v4/view",
        description: `Used to view the current state of a device. If you post an empty {} you will recieve an array of all devices.`,
        post: { id: "yourDevice001" },
        response: {
            "_created_on": "2019-09-04T12:34:23.196Z",
            "_last_seen": "2019-09-11T15:29:36.870Z",
            "_recieved": "2019-09-11T15:29:36.870Z",
            "_timestamp": "2019-09-11T15:29:36.868Z",
            "publickey": "xxxx",
            "key": "xxxx",
            "id": "poolsensor",
            "data": {
                "temperature": 30,
                "gps": {
                    "lat": -24.12435,
                    "lon": 21.586536
                }
            },
            "public": true,
            "userpublickey": "xxxx",
            "username": "joe",
            "meta": {},
            "history": [],
            "layout": []
        }
    })
    app.post("/api/v4/view", (req: any, res) => {
        var query = _.clone(req.body);
        query.user = req.user;
        core.view(query, (err, result: any) => {
            if (err) { res.status(400).json(err); }
            if (result) {
                if (Array.isArray(result)) {
                    for (var r of result) {
                        delete r["_id"]
                        delete r["apikey"]
                    }
                } else {
                    delete result["apikey"]
                    delete result["_id"]
                }

                res.json(result);
            }
        })
    })

    //apispec.push({ method: "post", path: "/api/v4/state" })
    app.post("/api/v4/state", (req: any, res) => {
        var query = _.clone(req.body);
        query.user = req.user;

        core.view(query, (err, result: any) => {
            if (err) { res.status(400).json(err); }
            if (result) { res.json(result); }
        })
    })





    /** Todo switch to method DELETE */
    //apispec.push({ method: "post", path: "/api/v4/state/delete" })
    app.post("/api/v4/state/delete", (req: any, res) => {
        core.delete({ id: req.body.id, user: req.user }, (err: any, result: any) => {
            if (err) { res.status(400).json(err); }
            if (result) { res.json(result); }
        })
    })


    // general search api for finding users/devices across the system
    //apispec.push({ method: "post", path: "/api/v4/search" })
    app.post("/api/v4/search", (req: any, res) => {
        core.search({ request: req.body, user: req.user }, (err: any, result: any) => {
            if (err) { res.status(400).json(err); }
            if (result) { res.json(result); }
        })
    })

    //apispec.push({ method: "post", path: "/api/v4/stateupdate" })
    app.post("/api/v4/stateupdate", (req: any, res) => {
        core.stateupdate({ request: req.body, user: req.user }, (err: any, result: any) => {
            if (err) { res.status(400).json(err); }
            if (result) { res.json(result); }
        })
    })

    //apispec.push({ method: "post", path: "/api/v4/activity" })
    app.post("/api/v4/activity", (req: any, res) => {
        core.activity({ request: req.body, user: req.user }, (err: any, result: any) => {
            if (err) { res.status(400).json(err); }
            if (result) { res.json(result); }
        })
    })

    // view packets history
    //apispec.push({ method: "post", path: "/api/v4/packets" })
    app.post("/api/v4/packets", (req: any, res) => {
        core.packets({ request: req.body, user: req.user }, (err: any, result: any) => {
            if (err) { res.status(400).json(err); }
            if (result) { res.json(result); }
        })
    })


    // ----------------------------------------------------------------------------------


    apispec.push({
        method: "get",
        path: "/api/v4/account",
        description: "Retrieve your account information",
        response: {
            "_created_on": "2019-09-02T06:06:42.847Z",
            "_last_seen": "2019-09-11T14:32:58.457Z",
            "ip": "::1",
            "userAgent": "Chrome/75.0.3770.100",
            "email": "rouan",
            "level": 1,
            "apikey": "xxxxxxxxxxxxxxxxxxx",
            "publickey": "xxxxxxxxxxxxxxxxxxx",
            "username": "rouan2760"
        }
    })
    app.get("/api/v4/account", (req: any, res) => {
        if (!req.user) {
            res.json({ level: 0, username: "visitor" })
            return;
        }
        var cleanUser = _.clone(req.user);
        delete cleanUser["_id"];
        delete cleanUser.password;
        res.json(cleanUser);
    })

    // ----------------------------------------------------------------------------------

    //** TODO CHECK API SPEC HERE */

    // apispec.push({ method: "post", path: "/api/v4/account" })
    // app.post("/api/v4/account", (req: any, res) => {
    //     // change account settings
    //     var query = { change: req.body, user: req.user, ip: req.socket.remoteAddress };
    //     core.account(query, (err, result) => {
    //         if (err) { res.json({ err: err.toString() }); }
    //         if (result) { res.json(result); }
    //     })
    // })

    // ----------------------------------------------------------------------------------

    apispec.push({
        method: "get",
        path: "/api/v4/version",
        description: "Server version information",
        response: {
            name: "prototype",
            version: "5.1.0",
            description: "Typescript framework for general purpose remote monitoring/control."
        }
    })
    app.get("/api/v4/version", (req: any, res) => {
        res.json(core.config.version)
    })

    // ----------------------------------------------------------------------------------

    apispec.push({
        method: "post",
        path: "/api/v4/users",
        description: "Request information on users",
        post: { find: { "username": "joe" } },
        response:
            [{
                "publickey": "xxxxxxxxxxx",
                "username": "joe"
            }]

    })

    app.post("/api/v4/users", (req: any, res) => {
        core.users({ request: req.body, user: req.user }, (err: any, result: any) => {
            if (err) { res.status(400).json(err); }
            if (result) { res.json(result); }
        })
    })

    // ----------------------------------------------------------------------------------


    //////////////////////////////// LAST API SPEC
    apispec.push({
        description: "This api documentation in JSON format.",
        method: "get", path: "/api/v4",
        response: [
            {
                "method": "post",
                "path": "/api/v4/data/post",
                "description": "Create a new device by using a unique id. Post again with new data to update. This post packet can contain \n        many other properties that may be useful.",
                "post": {
                    "id": "yourDevice001",
                    "data": {
                        "temperature": 24.54,
                        "doorOpen": false,
                        "gps": {
                            "lat": 25.123,
                            "lon": 28.125
                        }
                    }
                },
                "response": {
                    "result": "success"
                }
            }, {}, {}]
    }
    )
    app.get("/api/v4", (req, res) => {
        res.end(JSON.stringify(apispec, null, 2))
    })



}