import { PluginSuperServerside } from "../../server/shared/plugins_super_serverside"
import { Core } from "../../server/core/core";
import { Webserver } from "../../server/core/webserver";
import { DocumentStore } from "../../server/core/data";
import { logger } from "../../server/shared/log";
import { EmailService } from "./emailservice"
import { AccountRecovery } from "./accountrecovery";
import { AccountVerification } from "./accountverification"
import { validEmail, validUsername, validPassword } from "../../server/shared/shared";
import { User } from "../../server/shared/interfaces";


var mongojs = require('mongojs')
var ObjectId = mongojs.ObjectId;

export default class Admin extends PluginSuperServerside {
    emailservice: EmailService;
    accountrecoveryservice: AccountRecovery;
    accountverificationservice: AccountVerification;

    constructor(props: { core: Core, documentstore: DocumentStore, webserver: Webserver, plugins: any }) {
        super(props);

        // this handles the email setup api calls and so on
        this.emailservice = new EmailService(props);
        this.accountrecoveryservice = new AccountRecovery(props);
        this.accountverificationservice = new AccountVerification(props);

        // allows acccount recover service to be able to send emails.
        this.accountrecoveryservice.on("sendmail", (mail, cb) => {
            this.emailservice.sendmail(mail, cb);
        })

        // allows account verification service to be able to send emails.
        this.accountverificationservice.on("sendmail", (mail, cb) => {
            this.emailservice.sendmail(mail, cb);
        })

        // --------------------------------------------------------------------------------------
        // user account email change:
        this.webserver.app.post("/api/v4/admin/emailchange", (req: any, res) => {
            if (!req.user) { res.json({ result: "error", message: "user not authenticated" }); return; }
            if (!req.body.email) { res.json({ result: "error", message: "expecting email string" }); return; }
            if (!validEmail(req.body.email)) { res.json({ result: "error", message: "not a valid email" }); return; }
            ///
            this.documentstore.db.users.findOne({ "apikey": req.user.apikey }, (e: Error, user: User) => {
                if (user) {
                    ////
                    delete user["_id"];
                    user.email = req.body.email;
                    user.emailverified = false;

                    this.documentstore.db.users.update({ "apikey": req.user.apikey }, user, (err: Error, result: any) => {
                        if (err) { console.log(err); return; }
                        if (result) {
                            res.json({ result: "success", message: "email successfully changed" })
                        }
                    })

                    ////
                }

            })
            ///
        })

        // ------------------------------------------------------------------------------------------
        /** please note that username changes cause device states to have the old usernames, thus we have to update all device states with the new username. */
        this.webserver.app.post("/api/v4/admin/usernamechange", (req: any, res) => {
            if (!req.user) { res.json({ result: "error", message: "user not authenticated" }); return; }
            if (!req.body.username) { res.json({ result: "error", message: "expecting username string" }); return; }
            //if (!validUsername(req.body.username)) { res.json({ result: "error", message: "not a valid email" }); return; }

            var usernameTest = validUsername(req.body.username);

            if (req.body.username == req.user.username) {
                res.json({ result: "error", message: "username already set to " + req.body.username })
                return;
            }

            if (!usernameTest.valid) {
                res.json({ result: "error", message: "username is invalid", validation: usernameTest })
                return;
            }

            this.core.users({ request: { find: { username: req.body.username } }, user: req.user }, (e, user) => {
                if (user.length != 0) { res.json({ result: "error", message: "username is already taken." }) }
                if (user.length == 0) {
                    //available.
                    var user = req.user;
                    delete user["_id"]
                    user.username = req.body.username
                    this.documentstore.db.users.update({ apikey: req.user.apikey }, user, (e, result) => {
                        if (result) {

                            this.documentstore.db.states.update({ apikey: user.apikey }, { $set: { username: req.body.username } }, (e, r) => {
                                res.json({ result: "success", message: "username changed to " + req.body.username, db: result })
                            })

                        } else {
                            res.json({ result: "error", message: "db error" })
                        }

                    })
                }
            })

        })
        // --------------------------------------------------------------------------------------
        this.webserver.app.post("/api/v4/admin/passwordchange", (req: any, res: any) => {
            console.log(req.body);

            if (!req.body.currentpassword) { res.json({ result: "error", message: "current password invalid" }); return; }
            if (!req.body.newpassword) { res.json({ result: "error", message: "new password invalid" }); return; }
            if (!validPassword(req.body.newpassword).valid) { res.json({ result: "error", message: "new password invalid password string" }); return; }

            console.log("1")
            this.core.checkPassword({ pass: req.body.currentpassword, apikey: req.user.apikey }, (e, user) => {
                console.log("2")
                if (user) {
                    console.log("3")
                    this.core.encryptPass(req.body.newpassword, (e, encryptednewpass) => {
                        console.log("4")
                        this.documentstore.db.users.update({ apikey: req.user.apikey },
                            { $set: { password: encryptednewpass } }, (e, r) => {
                                console.log("5")
                                console.log("new password set")
                                res.json({ result: "success", message: "password set" })
                            })
                    })

                } else {
                    res.json({ result: "error", message: "current password mismatch." })
                }
            })
        })
        // --------------------------------------------------------------------------------------

    }


}

