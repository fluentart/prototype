import React, { Component } from 'react';
import { PluginSuperClientside } from "../../client/src/components/plugins_super_clientside"
import { EmailSetup } from './emailsetup';


/** TEMPLATE PLUGIN 
 * 
 * Remember to rename MyPlugin for your own plugin */
export default class Admin extends PluginSuperClientside {

    /** sets this plugin to be only accessible by admins */
    admin = true;

    state = {
        gateways: []
    }

    /** uncomment to override alternative views for settings/deviceview 
    render() {}
    */

    /** this will render on the /settings view */
    settings() {
        return (
            <div>
                <EmailSetup />
            </div>
        );
    }

    /** this will render in the deviceview popup */
    deviceview() {
        return (<div>This is Admin deviceview popup
            <h4>Device STATE:</h4>
            <pre style={{ maxHeight: 250, overflow: "scroll" }}>
                {JSON.stringify(this.props.state, null, 2)}
            </pre>
        </div>)
    }
};

