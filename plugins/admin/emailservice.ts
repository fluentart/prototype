import { PluginSuperServerside } from "../../server/shared/plugins_super_serverside"
import { Core } from "../../server/core/core";
import { Webserver } from "../../server/core/webserver";
import { DocumentStore } from "../../server/core/data";
import { logger } from "../../server/shared/log";

import * as nodemailer from "nodemailer"
import { User } from "../../server/shared/interfaces";

interface EmailSettings {
    host: string
    port: string
    auth: {
        user: string
        pass: string
    }
}

/** When using .sendmail please use this format for the mail object */
export interface EmailFormat {
    /** email address from? */
    from: string
    /** email address to? */
    to: string
    subject: string

    /**
     * example: 'This is just an email test. '
     */
    text: string

    /**
     * example: '<p>This is just an email test.</p>'
     */
    html: string
}

export class EmailService extends PluginSuperServerside {
    nodemailer: nodemailer.Transporter;
    emailsettings: EmailSettings;

    constructor(props: { core: Core, documentstore: DocumentStore, webserver: Webserver, plugins: any }) {
        super(props);

        this.webserver.app.get("/api/v3/admin/emailsettings", (req: any, res: any) => {
            if (req.user.admin) {
                this.documentstore.db.plugins_admin.findOne({ settings: "emailsettings" }, (err, result) => {
                    if (err) { res.json(err); } else {
                        delete result["_id"]
                        // TODO
                        // use new transport                        
                        // this will only load the new transport on this server.. we actually need to monitor db change and load on change
                        // this.checkifdbentryexists((err, smtpsettings) => {
                        //     this.startemailtransport(smtpsettings);
                        // });
                        // for now we have to restart entire server on email settings change
                        res.json(result);
                    }
                });
            } else { res.json({ err: "not sufficient user level", result: null }); }
        });

        this.webserver.app.post("/api/v3/admin/emailsettings", (req: any, res: any) => {
            logger.log({ group: "admin", message: "recieved new server email settings", level: "warn", data: req.body })
            if (req.user.admin) {
                this.documentstore.db.plugins_admin.update({
                    settings: "emailsettings"
                }, req.body, { upsert: true }, (err, result) => {
                    res.json(result);
                });
            } else { res.json({ err: "not sufficient user level", result: null }); }
        });


        this.webserver.app.get("/api/v3/admin/emailtester", (req: any, res: any) => {
            if (req.user.admin) {
                // send a test email
                logger.log({ group: "email", message: "admin requested test email", level: "warn" })
                var user: User = req.user;
                this.sendtestemail({ user })

            } else { res.json({ err: "not sufficient user level", result: null }); }
        });

        // start on boot
        this.checkifdbentryexists((err, smtpsettings) => {
            this.startemailtransport(smtpsettings);
        });


        // here we listen to db plugins_admin emailsettings changes and connect to the new settings if possible
        this.documentstore.on("plugins_admin", (data) => {
            if (data.settings == "emailsettings") {
                //console.log("email settings change")
                this.checkifdbentryexists((err, smtpsettings) => {
                    this.startemailtransport(smtpsettings);
                });
            }
        })

    }

    startemailtransport(smtpsettings) {

        if ((!smtpsettings.nodeMailerTransportHost) || (smtpsettings.nodeMailerTransportHost == "")) {

            logger.log({ group: "email", message: "nodemailer smtp ERROR hostname undefined", data: { smtpsettings }, level: "error" })
            console.log(smtpsettings);
            return;
        }

        // type: SMTPConnection.Options
        var emailsettings = {
            host: smtpsettings.nodeMailerTransportHost,
            port: smtpsettings.nodeMailerTransportPort,
            auth: {
                user: smtpsettings.nodeMailerTransportAuthUser,
                pass: smtpsettings.nodeMailerTransportAuthPass
            }
        }

        this.emailsettings = emailsettings;

        logger.log({ group: "email", message: "loading nodemailer transport", level: "info" })
        this.nodemailer = nodemailer.createTransport(emailsettings);
    }

    /** this creates the default entry for email registration */
    checkifdbentryexists(cb: (err: Error, smtpsettings: any) => void) {
        this.documentstore.db.plugins_admin.findOne({ settings: "emailsettings" }, (err, result) => {


            if (result == null) {

                logger.log({ group: "email", message: "did not find email settings", level: "error" })

                /** migration from 5.0 
                 * the old db entry was tagged with {settings:`registration`} which was a bit confusing so 
                 * we rename it to emailsettings. here we try to load the old settings and rename it so we
                 * dont give devops a hard time..                  
                */
                this.documentstore.db.plugins_admin.findOne({ settings: "registration" }, (err, result) => {
                    if (result) {
                        logger.log({ group: "email", message: "found old 5.0 smtp in registration", level: "error" })
                        result.settings = "emailsettings";
                        delete result["_id"]
                        this.documentstore.db.plugins_admin.update({ settings: "emailsettings" }, result, { upsert: true });
                    } else {
                        //---------- create new
                        var cleanInput = {
                            settings: "emailsettings",
                            userRegistration: true, //default on
                            userEmailVerify: false, //default off
                            nodeMailerTransportHost: "",
                            nodeMailerTransportPort: "",
                            nodeMailerTransportAuthUser: "",
                            nodeMailerTransportAuthPass: "",
                            nodeMailerTransportFrom: ""
                        }
                        this.documentstore.db.plugins_admin.update({ settings: "emailsettings" }, cleanInput, { upsert: true });
                        //----------
                    }
                });


            }
            //
            if (result) {
                if (result.nodeMailerTransportHost != "") {
                    // then its probably valid.. lets try.
                    this.startemailtransport(result);
                }
            }
            //

        });
    }

    sendmail(mail: EmailFormat, cb: Function) {
        mail.from = this.emailsettings.auth.user; //override

        logger.log({
            group: "email",
            message: "SENDING RECOVERY EMAIL to " + mail.to, level: "info"
        })

        this.nodemailer.sendMail(mail, (err, info) => {
            if (err) {
                logger.log({
                    group: "email",
                    message: "SENDING RECOVERY error " + mail.to,
                    level: "error"
                })
                cb(err, info)
            }
            if (info) {
                logger.log({
                    group: "email",
                    message: "SENDING RECOVERY success " + mail.to,
                    level: "info"
                })
                cb(err, info)
            }
        })
    }

    sendtestemail(options: { user: User }) {
        var user = options.user;

        logger.log({
            group: "email",
            message: "SENDING TEST EMAIL to " + user.email, level: "info"
        })

        var mail = {
            from: this.emailsettings.auth.user,
            to: user.email,
            subject: 'Prototype test email',
            text: 'This is just an email test. ',
            html: '<p>This is just an email test.</p>'
        }

        this.nodemailer.sendMail(mail, (err, info) => {
            if (err) {
                logger.log({
                    group: "email",
                    message: "SENDING TEST EMAIL error " + user.email,
                    level: "error"
                })
            }
            if (info) {
                logger.log({
                    group: "email",
                    message: "SENDING TEST EMAIL success " + user.email,
                    level: "info"
                })
            }
        })
    }
}

