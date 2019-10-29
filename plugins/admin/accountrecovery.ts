import { PluginSuperServerside } from "../../server/shared/plugins_super_serverside"
import { Core } from "../../server/core/core";
import { Webserver } from "../../server/core/webserver";
import { DocumentStore } from "../../server/core/data";
import { logger } from "../../server/shared/log";
import { User } from "../../server/shared/interfaces";
import { validEmail, validPassword } from "../../server/shared/shared";
import { EmailFormat } from "./emailservice"
import { generateDifficult } from "../../server/utils/utils";

import { URL } from "url"
export class AccountRecovery extends PluginSuperServerside {

    constructor(props: { core: Core, documentstore: DocumentStore, webserver: Webserver, plugins: any }) {
        super(props);

        // this adds a listener for POST /api/v4/admin/recover 
        /** recieves account recovery requests. */
        this.webserver.app.post("/api/v4/admin/recover", this.handleEmailRecoveryRequest);

        /** handle incoming recovery link clicks */
        this.webserver.app.get("/recover/:code", (req, res) => {
            res.end(this.webserver.reactHtml);
        })

        /** verifies if a code is valid */
        this.webserver.app.post("/recover/code", (req, res) => {

            this.checkCode(req.body.code, (response) => {
                res.json(response);
            })


        })

        /** set new password on an account by using the recovery code and new password string */
        this.webserver.app.post("/recover/set", (req, res) => {

            if (!req.body.code) { res.json({ result: "error", message: "expected code parameter" }); return; }
            if (!req.body.password) { res.json({ result: "error", message: "expected password parameter" }); return; }
            if (!validPassword(req.body.password).valid) { res.json({ result: "error", message: "new password not valid" }); return; }

            this.checkCode(req.body.code, (response) => {
                if (response.result == "success") {

                    this.core.encryptPass(req.body.password, (e, encrypted) => {
                        if (encrypted) {
                            this.documentstore.db.users.update({ "recover.code": req.body.code }, { $set: { password: encrypted } }, (e, r) => {
                                res.json({ result: "success", message: "password successfully changed." })
                            })
                        }
                    })

                } else {
                    res.json(response);
                }
            })
        })
    }


    checkCode(code, cb) {
        this.documentstore.db.users.findOne({ "recover.code": code }, (e, user: User) => {
            if (user) {
                //check time delta
                var delta = new Date().getTime() - new Date(user.recover.timestamp).getTime()
                var maxtime = 1000 * 60 * 15; //15 minutes
                if (delta > maxtime) {
                    cb({
                        result: "error",
                        message: "Recovery code invalid. Older than 15minutes."
                    });
                    return;
                } else {
                    // all fine?
                    cb({ result: "success", message: "Recovery code is valid. You can now set a new password." })
                }
            } else {
                cb({ result: "error", message: "Code invalid. Try again." })
            }
        })
    }

    /** recieves a json request from webserver, checks if the user with that email 
     * exists in the db, and if so starts the recovery process.
     */
    handleEmailRecoveryRequest = (req, res) => {

        logger.log({
            group: "admin",
            message: "user request account recovery " + req.body.email,
            data: req.body,
            level: "info"
        })

        if (!req.body.email) { res.json({ error: "missing email property" }); return; }
        if (!validEmail(req.body.email)) { res.json({ error: "invalid email format" }); return; }

        this.core.user({ email: req.body.email }, (err, user) => {
            if (err) { res.json({ result: "error", message: "db error", error: "db error" }); return; }
            if (user) {

                const origin = new URL(req.headers.referer).origin
                this.generateRecoveryEmail(origin, user, (e, mail) => {
                    if (mail) {

                        this.emit("sendmail", mail, (err, result) => {
                            if (result) {
                                res.json({
                                    result: "success",
                                    message: "Success! User found. Email sent."
                                })
                            } else {
                                res.json({
                                    result: "success",
                                    message: "Success! User found. But something went wrong sending the email."
                                })
                            }
                        })
                    }
                })



            } else {
                res.json({
                    result: "notfound",
                    message: "Error! User with that email not found. Try again."
                })
            }
        })
    }


    /** origin is the string url of the current webserver. like http://localhost:8080 */
    generateRecoveryEmail = (origin: string, user: User, cb: (e: Error | undefined, mail: EmailFormat) => void) => {



        var recover = {
            code: generateDifficult(32),
            timestamp: new Date()
        }

        var recoverLink = origin + "/recover/" + recover.code

        this.documentstore.db.users.update({ apikey: user.apikey }, { $set: { recover } }, (e, r) => {
            var mail: EmailFormat = {
                from: "",
                to: user.email,
                subject: "Account Recovery",
                text: 'To recover your account please go to ' + recoverLink,
                html: '<p>To recover your account please go to <a href="' + recoverLink + '">' + recoverLink + '</a></p>'
            }

            cb(undefined, mail)
        })


    }
}

