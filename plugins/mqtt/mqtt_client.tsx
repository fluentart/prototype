import React, { Component } from 'react';
import { PluginSuperClientside } from "../../client/src/components/plugins_super_clientside"
import { request } from "../../client/src/utils/requestweb"
import { CodeBlock } from "../../client/src/components/codeblock"
/** TEMPLATE PLUGIN 
 * 
 * Remember to rename MyPlugin for your own plugin */
export default class MQTT extends PluginSuperClientside {
    state = {
        testone: undefined,
        testtwo: undefined
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

    componentDidMount() {
        request.get("/api/v4/mqtt/test", {}, (err, res, serverresponse) => {
            this.setState({ testone: serverresponse })
        })

        request.post("/api/v4/mqtt/sendtest", { json: { somedata: 123 } }, (err, res, serverresponse) => {
            this.setState({ testtwo: serverresponse })
        })
    }

    /** this will render on the /settings view */
    settings() {

        var boxstyles = { background: "rgba(0,0,0,0.2)", padding: 10 }
        var codestyles = { background: "rgba(0,0,0,0.2)", padding: 10, color: "rgb(25,255,60)" }

        return (
            <div>

                <p>This is MyPlugin settings view.
                    See <a href="https://github.com/IoT-nxt/prototype/tree/5.1/plugins/myplugin">/plugins/myplugin/myplugin_server.ts</a> for the serverside code.
                    TODO add documentation on plugin development here.</p>

                <div style={boxstyles}>
                    <h3>GET "/api/v4/myplugin/test"</h3>

                    <CodeBlock language='json' value={JSON.stringify(this.state.testone, null, 2)} />
                </div>

                <div style={boxstyles}>
                    <h3>POST "/api/v4/myplugin/sendtest"</h3>

                    <CodeBlock language='json' value={JSON.stringify(this.state.testtwo, null, 2)} />
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

