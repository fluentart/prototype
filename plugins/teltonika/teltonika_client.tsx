import React, { Component } from 'react';
import { PluginSuperClientside } from "../../client/src/components/plugins_super_clientside"
import { request } from "../../client/src/utils/requestweb"
import { CodeBlock } from "../../client/src/components/codeblock"
import { colors } from '../../client/src/theme';
import { logger } from '../../server/shared/log';
/** TEMPLATE PLUGIN 
 * 
 * Remember to rename MyPlugin for your own plugin */

interface TeltonikaState {
    /** if the user has a port assigned to their account for teltonika devices */
    port: number | undefined
    /** if we need to display a server error or response to the user */
    message: string | undefined
}

export default class Teltonika extends PluginSuperClientside {
    state = {
        port: undefined,
        message: undefined
    }
    componentDidMount = () => {
        this.updateFromServer();
    }

    updateFromServer() {
        request.get("/api/v3/teltonika/info", {}, (err: any, res, response: any) => {
            console.log(response);
            if (err) {
                logger.log({ group: "teltonika", message: "ERROR " + err.err + " GET /api/v3/teltonika/info", level: "error" })
                console.log(err);
            }

            if (response) {
                if (response.port) {
                    this.setState({ port: response.port })
                }
            }

        })
    }

    enablePrivatePort = () => {
        request.get("/api/v3/teltonika/reqport", { json: true }, (err, res, result) => {
            console.log(result);
            this.updateFromServer();
        })
    }

    /** this will render on the /settings view */
    settings() {

        var boxstyles = { background: "rgba(0,0,0,0.2)", padding: 10 }
        var codestyles = { background: "rgba(0,0,0,0.2)", padding: 10, color: "rgb(25,255,60)" }

        return (
            <div>



                {/* <div style={{ marginBottom: 20, background: colors.bgDarker, padding: colors.padding * 2 }}>
                    <h4>PUBLIC PORT (new.. under development)</h4>
                    DEFAULT PORT: 12000
                    <p>If you set Teltonika device to connect to this port devices will be visible to
                        administrators only. Any user can then use the ADD device wizard and type in IMEI
                        to add device to their account.</p>
                </div> */}

                <div style={{ marginBottom: 20, background: colors.bgDarker, padding: colors.padding * 2 }}>
                    <h4>PRIVATE PORT</h4>
                    <p>A private port for Teltonika devices will bind a server port to your account so all
                        teltonika devices pointed to this port will automatically be added to your account.</p>

                    <div>
                        {(this.state.port) ? <div className="commanderBgPanel"
                        > <i className="fas fa-check-circle" style={{ color: "#11cc88" }}></i> PORT IS ACTIVE: {this.state.port} </div>
                            : <button onClick={() => { this.enablePrivatePort() }}
                                style={{ marginLeft: colors.padding, whiteSpace: "nowrap" }}>
                                <i className="fas fa-play-circle" style={{ color: colors.good }} /> ENABLE</button>}
                    </div>

                </div>

            </div >
        );
    }

    /** this will render in the deviceview popup */
    deviceview() {
        return (<div>This is MyPlugin deviceview popup
            <h4>Device STATE:</h4>
            <pre style={{ maxHeight: 250, overflow: "scroll" }}>
                {JSON.stringify(this.props.state, null, 2)}
            </pre>
        </div>)
    }
};

