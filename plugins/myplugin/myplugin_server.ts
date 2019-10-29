import { PluginSuperServerside } from "../../server/shared/plugins_super_serverside"
import { Core } from "../../server/core/core";
import { Webserver } from "../../server/core/webserver";
import { DocumentStore } from "../../server/core/data";


export default class MyPlugin extends PluginSuperServerside {
    constructor(props: { core: Core, documentstore: DocumentStore, webserver: Webserver, plugins: any }) {
        super(props);

        this.webserver.app.get("/api/v4/myplugin/test", (req, res) => {
            res.json({ test: "successful123!" })
        })

        this.webserver.app.post("/api/v4/myplugin/sendtest", (req, res) => {
            console.log(req.body);
            res.json({ test: "sendtestsuccess", recieved: req.body })
        })
    }
};

