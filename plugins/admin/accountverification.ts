import { PluginSuperServerside } from "../../server/shared/plugins_super_serverside"
import { Core } from "../../server/core/core";
import { Webserver } from "../../server/core/webserver";
import { DocumentStore } from "../../server/core/data";
import { logger } from "../../server/shared/log";
import { User } from "../../server/shared/interfaces";
import { validEmail } from "../../server/shared/shared";
import { EmailFormat } from "./emailservice"

import { URL } from "url"

var mongojs = require('mongojs')
var ObjectId = mongojs.ObjectId;

export class AccountVerification extends PluginSuperServerside {

    constructor(props: { core: Core, documentstore: DocumentStore, webserver: Webserver, plugins: any }) {
        super(props);

        // this adds a listener for POST /api/v4/admin/recover 
        this.webserver.app.get("/api/v3/admin/requestverificationemail", (req, res) => {
            this.handleVerificationEmailRequest(req, res);
        });

        // we handle incoming verification requests
        this.webserver.app.get("/verify/:id", (req, res) => {

            this.documentstore.db.users.findOne({ "_id": ObjectId(req.params["id"]) }, (e: Error, user: User) => {
                if (user) {
                    ////
                    delete user["_id"];
                    user.emailverified = true;

                    this.documentstore.db.users.update({ "_id": ObjectId(req.params["id"]) }, user, (err: Error, result: any) => {
                        if (err) { console.log(err); return; }
                        if (result) {
                            res.redirect("/")
                        }
                    })

                    ////
                }

            })



        });
    }


    /** recieves a json request from webserver, checks if the user with that email 
     * exists in the db, and if so starts the recovery process.
     */
    handleVerificationEmailRequest = (req, res) => {

        logger.log({
            group: "admin",
            message: "user verification email send " + req.user.email,
            data: req.user,
            level: "info"
        })

        var user: User = req.user;
        if (user.emailverified) {
            // already verified?
            res.json({ result: "error", message: "user already verified?" });
            return;
        }

        const myURL = new URL(req.headers.referer);
        this.emit("sendmail", this.generateVerificationEmail(myURL.origin, user), (err, result) => {
            if (result) {
                res.json({
                    result: "success",
                    message: "Success! User found. Email sent."
                })
            } else {
                res.json({
                    result: "error",
                    message: "Error. Something went wrong sending the mail."
                })
            }
        })

    }


    generateVerificationEmail = (origin, user: User) => {
        var verifyLink = origin + "/verify/" + user._id

        var mail: EmailFormat = {
            from: "",
            to: user.email,
            subject: "Account Verification",
            text: 'To verify your account please go to ' + verifyLink,
            html: '<p>To verify your account please go to <a href="' + verifyLink + '">' + verifyLink + '</a></p>'
        }

        return mail;
    }
}

