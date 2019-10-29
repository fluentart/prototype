import * as fs from 'fs';
import { EventEmitter } from 'events';
import { logger } from "../shared/log"
import { Package, DBchange, User, ConfigFile } from "../shared/interfaces"
import { pathMatch } from 'tough-cookie';
import * as path from 'path';

export class Config extends EventEmitter {
    filepath: string = '../../iotconfig.json';
    config: ConfigFile;
    package: any | Package = {}

    constructor(options?: any) {
        super();

        // DEFAULTS
        this.config = {
            ssl: false,
            httpPort: 8080,
            mongoConnection: "mongodb://localhost:27017/prototype",
            version: {
                name: "prototype",
                version: "5.1.0-default",
                description: "typescript realtime data coordination system"
            }
        }

        this.loadnodepkg();
        this.loadconfig((err, configfile) => {

            if (configfile) {
                // fix mongoConnection
                if (configfile.mongoConnection) {
                    if (configfile.mongoConnection.indexOf("mongodb://") != 0) {
                        console.log("mongodb config format fix.")
                        configfile.mongoConnection = "mongodb://localhost:27017/" + configfile.mongoConnection
                    }
                }

                this.config = { ...this.config, ...configfile }
                //console.log(JSON.stringify(this.config, null, 2))
            }

        });

        this.config.version = {
            name: this.package.name,
            version: this.package.version,
            description: this.package.description
        }


        this.loadsslkeys();
    }

    loadconfig(cb: (err: Error | undefined, configfile?: ConfigFile) => void) {

        try {
            // changed in 5.1
            // reads config file from base folder /iotconfig.json
            var readconfig: ConfigFile = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../iotconfig.json')).toString());
            if (readconfig) {
                logger.log({ message: "success read iotconfig.json", level: "verbose", data: readconfig })
            } else {
                logger.log({ message: "could not read iotconfig.json", level: "error" })
            }

            cb(undefined, readconfig)
        }
        catch (err) {
            logger.log({ message: "could not read iotconfig.json " + err.toString(), level: "error" })
            cb(err);
        }
    }

    loadnodepkg() {
        try {

            var nodePackage: Package = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../../package.json")).toString());

            this.package = nodePackage;

        } catch (err) {
            logger.log({ message: "config " + err.toString(), level: "error" })
        }
    }

    loadsslkeys() {
        if (this.config.ssl == true) {
            if (!this.config.sslOptions) { console.log("SSL CERT ERROR"); return; }
            try {
                if (this.config.sslOptions.certPath) this.config.sslOptions.cert = fs.readFileSync(this.config.sslOptions.certPath);
                if (this.config.sslOptions.keyPath) this.config.sslOptions.key = fs.readFileSync(this.config.sslOptions.keyPath);
                if (this.config.sslOptions.caPath) this.config.sslOptions.ca = fs.readFileSync(this.config.sslOptions.caPath);
            } catch (err) {
                console.log(err);
            }
        }
    }

    // configGenFunction() {
    //     var defaultconfig = {
    //         "ssl": false,
    //         "httpPort": 8080,
    //         "mongoConnection": "prototype",
    //         "iotnxtV3Queue": {
    //             "gateways": []
    //         },
    //         "webpushkeys": {
    //             "publicVapidKey": "BNOtJNzlbDVQ0UBe8jsD676zfnmUTFiBwC8vj5XblDSIBqnNrCdBmwv6T-EMzcdbe8Di56hbZ_1Z5s6uazRuAzA",
    //             "privateVapidKey": "IclWedYTzNBuMaDHjCjA1B5km-Y3NAxTGbxR7BqhU90"
    //         }
    //     }

    //     try {
    //         var mainconfig = JSON.parse(fs.readFileSync('../../../iotconfig.json').toString());
    //         mainconfig.version = version
    //         mainconfig.mongoCollections = ['packets', 'users', 'states']

    //         if (!mainconfig.ssl) {
    //             mainconfig.ssl = defaultconfig.ssl;
    //         }

    //         if (mainconfig.ssl == true) {
    //             mainconfig.sslOptions.cert = fs.readFileSync(mainconfig.sslOptions.certPath)
    //             mainconfig.sslOptions.key = fs.readFileSync(mainconfig.sslOptions.keyPath)
    //             if (mainconfig.sslOptions.caPath) {
    //                 mainconfig.sslOptions.ca = fs.readFileSync(mainconfig.sslOptions.caPath)
    //             }
    //         }

    //         if (!mainconfig.httpPort) {
    //             mainconfig.httpPort = defaultconfig.httpPort;
    //         }

    //         if (!mainconfig.mongoConnection) {
    //             mainconfig.mongoConnection = defaultconfig.mongoConnection;
    //         }

    //         if (!mainconfig.iotnxtV3Queue) {
    //             mainconfig.iotnxtV3Queue = defaultconfig.iotnxtV3Queue;
    //         }

    //         if (!mainconfig.webpushkeys) {
    //             mainconfig.webpushkeys = defaultconfig.webpushkeys;
    //         }

    //         return mainconfig
    //     } catch (err) {
    //         log("CONFIG \tFile not found. Using defaults. See /src/config.ts for details.")
    //         //DEFAULTS
    //         return defaultconfig
    //     }
    // }
}


export var cfg = new Config()