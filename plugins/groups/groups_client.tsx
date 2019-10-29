import React, { Component } from 'react';
import { PluginSuperClientside } from "../../client/src/components/plugins_super_clientside"
import { request } from "../../client/src/utils/requestweb"
import { CodeBlock } from "../../client/src/components/codeblock"

export default class Groups extends PluginSuperClientside {
    state = {}

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
        // request.get("/api/v4/myplugin/test", {}, (err, res, serverresponse) => {
        //     this.setState({ testone: serverresponse })
        // })

        // request.post("/api/v4/myplugin/sendtest", { json: { somedata: 123 } }, (err, res, serverresponse) => {
        //     this.setState({ testtwo: serverresponse })
        // })
    }

    /** this will render on the /settings view */
    settings() {

        var boxstyles = { background: "rgba(0,0,0,0.2)", padding: 10 }
        var codestyles = { background: "rgba(0,0,0,0.2)", padding: 10, color: "rgb(25,255,60)" }

        return (
            <div>

                <p>This plugin implements the concept of groups very much inspired by the unix style of groups
 Users can belong to multiple groups.
 Devices/Data endpoints can be linked to a single group with RWX/R-- permissions</p>

            </div >
        );
    }

    /** this will render in the deviceview popup */
    deviceview() {
        return (<div>
            <div>Change group.</div>
            <div>Change permission to group.</div>
        </div>)
    }
};

