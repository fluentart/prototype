import React, { Component } from 'react';
import { PluginSuperClientside } from "../../client/src/components/plugins_super_clientside"
import { request } from "../../client/src/utils/requestweb"
import { colors } from '../../client/src/theme';

import { CodeBlock } from "../../client/src/components/codeblock"
import { moment } from '../../client/src/utils/momentalt';

/** TEMPLATE PLUGIN 
 * 
 * Remember to rename MyPlugin for your own plugin */
export default class Cluster extends PluginSuperClientside {

    /** sets this plugin to be only accessible by admins */
    admin = true;

    state = { info: { workers: [] } }

    //UNSAFE_componentWillMount
    //UNSAFE_componentWillReceiveProps
    //UNSAFE_componentWillUpdate

    /** new React 17.0 see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html    
    static getDerivedStateFromProps(props,state) { return null; }
    getSnapshotBeforeUpdate(prevProps, prevState) {}
    */

    checker;
    redraw;

    componentDidMount() {
        this.getclusterinfo()
        this.redraw = setInterval(() => { this.setState({ counter: Math.random() }); }, 1000)
        this.checker = setInterval(() => { this.getclusterinfo(); }, 5000)
    }

    componentWillUnmount() {
        clearInterval(this.checker);
        clearInterval(this.redraw);
    }

    getclusterinfo() {
        request.get("/api/v4/cluster/info", {}, (err, res, info) => {
            this.setState({ info })
        })
    }

    /** uncomment to override alternative views for settings/deviceview 
    render() {}
    */

    /** this will render on the /settings view */
    settings() {

        var boxstyles = { background: "rgba(0,0,0,0.2)", padding: 10 }
        var codestyles = { background: "rgba(0,0,0,0.2)", padding: 10, color: "rgb(25,255,60)" }

        return (
            <div>


                <button style={{ float: "right", marginRight: 20 }} onClick={() => {
                    request.get("/api/v4/cluster/refresh", {}, (err, res, response) => {
                        this.getclusterinfo();
                    })
                }} >
                    <i className="fas fa-sync-alt" style={{ color: colors.public, opacity: 0.5, paddingRight: "10px" }} ></i> REFRESH
                </button>

                <div>
                    Number of workers: {this.state.info.workers.length}
                </div>

                <div>
                    {this.state.info.workers.map((worker, i) => {
                        return <div key={i} > {worker.hostname} | {worker.pid} | {worker.updated} | {moment(worker.updated).fromNow()} </div>
                    })}
                </div>


                <div style={boxstyles}>
                    <h3>RAW CLUSTER DATA:</h3>



                    <CodeBlock language='json' value={JSON.stringify(this.state.info, null, 2)} />

                </div>
            </div>
        );
    }

    /** this will render in the deviceview popup */
    deviceview() {
        return (<div>This is Cluster deviceview popup
            <h4>Device STATE:</h4>
            <pre style={{ maxHeight: 250, overflow: "scroll" }}>
                {JSON.stringify(this.props.state, null, 2)}
            </pre>
        </div>)
    }
};

