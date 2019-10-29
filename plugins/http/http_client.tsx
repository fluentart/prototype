import React, { Component } from 'react';
import { PluginSuperClientside } from "../../client/src/components/plugins_super_clientside"
import { request } from "../../client/src/utils/requestweb"
import { CodeBlock } from "../../client/src/components/codeblock"

import { AddRoute } from "./components/addRouteForm"
import { PortList } from "./components/routeList"
import { HTTPRoute } from './interfaces';

/** TEMPLATE PLUGIN 
 * 
 * Remember to rename MyPlugin for your own plugin */



export default class HTTP extends PluginSuperClientside {
    state = {
        routes: []
    }

    //UNSAFE_componentWillMount
    //UNSAFE_componentWillReceiveProps
    //UNSAFE_componentWillUpdate

    /** new React 17.0 see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html    
    static getDerivedStateFromProps(props,state) { return null; }
    getSnapshotBeforeUpdate(prevProps, prevState) {}
    */

    /** uncomment to override alternative views for settings/deviceview 
    render() {}
    */


    addroute = (form: HTTPRoute, cb) => {
        console.log(form);
        request.post("/api/v3/http/addroute", { json: form }, (e: any, r, data: any) => {
            if (e) {
                console.log(e);
                cb(e.error);
                return;
            }
            console.log(data);
            if (data.err) {
                cb(data.err, undefined)
            } else {
                cb(undefined, data);
            }
            this.getroutes();
        })
    };

    getroutes = () => {
        request.get("/api/v3/http/routes", { json: true }, (e, r, routes) => {
            console.log(routes);
            if (Array.isArray(routes)) this.setState({ routes });
        })
    };

    componentDidMount() {
        this.getroutes();
    }

    /** this will render on the /settings view */
    settings() {
        return (
            <div>
                <p>
                    Here you can set up custom HTTP routes. <br />
                    These are useful when accepting HTTP POST calls from external apis without authorization headers. <br />
                    Github webhooks being a great example of this.
                </p>
                <AddRoute formSubmit={this.addroute} />
                <PortList list={this.state.routes} update={this.getroutes} />
            </div>
        );
    }

    /** this will render in the deviceview popup */
    deviceview() {
        return (<div>HTTP has no options for this device.
            <a href="/settings/http">go to settings</a>
        </div>)
    }
};

