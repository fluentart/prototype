import { Core } from "./core";
import { Application } from "express"
import * as _ from 'lodash'



export function webapiv3(app: Application, core: Core) {



    app.post("/api/v3/admin/register", (req: any, res) => {
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

    app.get("/api/v3/account", (req: any, res) => {
        if (!req.user) { res.json({ err: "user not authenticated" }); return; }
        var cleanUser = _.clone(req.user);
        delete cleanUser.password;
        res.json(cleanUser);
    })

    app.post("/api/v3/account", (req: any, res) => {
        // change account settings
        var query = { change: req.body, user: req.user }
        core.account(query, (err, result) => {
            if (err) { res.json(err); }
            if (result) { res.json(result); }
        })
    })


    app.get("/api/v3/version", (req: any, res) => {
        res.json(core.config.version)
    })

    // post packet data
    app.post("/api/v3/data/post", (req: any, res) => {
        core.datapost({ packet: req.body, user: req.user }, (err: object, result: object) => {
            if (err) { res.status(400).json(err); }
            if (result) { res.json(result); }
        })
    })

    // view state simple
    app.post("/api/v3/view", (req: any, res) => {
        core.view({ id: req.body.id, user: req.user }, (err, result) => {
            if (err) { res.status(400).json(err); }
            if (result) { res.json(result); }
        })
    })

    app.post("/api/v3/state", (req: any, res) => {
        var query = _.clone(req.body);
        query.user = req.user;
        core.view(query, (err, result: any) => {
            if (err) { res.status(400).json(err); }
            if (result) {
                //compatibility fix for v3.. removed in v4
                result.devid = result.id;
                result.payload = _.clone(result);
                ///
                res.json(result);
            }
        })
    })

    app.get("/api/v3/states", (req: any, res) => {
        core.view({ user: req.user }, (err, result) => {
            if (err) { res.status(400).json(err); }
            if (result) { res.json(result); }
        })
    })

    app.post("/api/v3/states", (req: any, res) => {

        var options = _.clone(req.body)
        options.user = req.user;
        console.log(options);
        core.view(options, (err, result) => {
            if (err) { res.status(400).json(err); }
            if (result) { res.json(result); }
        })
    })

    /** API V3 view packets history */
    app.post("/api/v3/packets", (req: any, res) => {
        core.packets({ request: req.body, user: req.user }, (err: any, result: any) => {
            console.log("----- core result")
            console.log(result);
            if (err) { res.status(400).json(err); }
            if (result) { res.json(result); }
        })
    });

    app.post("/api/v3/state/delete", (req: any, res) => {
        core.delete({ id: req.body.id, user: req.user }, (err: any, result: any) => {
            if (err) { res.status(400).json(err); }
            if (result) { res.json(result); }
        })
    })

    // general search api for finding users/devices across the system
    app.post("/api/v3/search", (req: any, res) => {
        core.search({ request: req.body, user: req.user }, (err: any, result: any) => {
            if (err) { res.status(400).json(err); }
            if (result) { res.json(result); }
        })
    })
}