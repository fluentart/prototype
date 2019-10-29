import { DocumentStore } from "../core/data";
import { Core } from "../core/core";
import { Webserver } from "../core/webserver";
import { EventEmitter } from "events";

import { plugins } from "../../plugins/plugins_list_server"

/** This is the class all serverside plugins need to import and extend */
interface PluginSuperServersideProps {
    core: Core
    documentstore: DocumentStore
    webserver: Webserver
    plugins: plugins
}

export class PluginSuperServerside extends EventEmitter {
    core: Core;
    documentstore: DocumentStore;
    webserver: Webserver;
    plugins: plugins;

    constructor(props: PluginSuperServersideProps) {
        super();
        this.core = props.core
        this.documentstore = props.documentstore
        this.webserver = props.webserver
        this.plugins = props.plugins
    }
};

