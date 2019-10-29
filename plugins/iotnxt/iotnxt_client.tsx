import React, { Component } from 'react';
import { PluginSuperClientside, PluginState, PluginProps } from "../../client/src/components/plugins_super_clientside"
import { AddGatewayPanel } from "./components/addGateway"
import { GatewayList } from "./components/gatewayList"
import { request } from "../../client/src/utils/requestweb"
import { GatewayType } from "./lib/iotnxtqueue"
import { CorePacket } from '../../server/shared/interfaces';
import { api } from '../../client/src/api';
import { colors } from '../../client/src/theme';

interface ActionTypes {
    addGateway?: GatewayType
    reconnectGateway?: GatewayType,
    deleteGateway?: GatewayType
}



//export default class Iotnxt<IotnxtProps extends PluginProps, IotnxtState extends PluginState> extends PluginSuperClientside {
export default class Iotnxt extends PluginSuperClientside {

    state = { gateways: [] }

    constructor(props) {
        super(props);

    }

    poll;

    componentDidMount() {
        this.loadServerGateways();
        this.poll = setInterval(() => {
            this.loadServerGateways();
        }, 5000)
    }

    componentWillUnmount() {
        clearInterval(this.poll);
    }

    //UNSAFE_componentWillMount
    //UNSAFE_componentWillReceiveProps
    //UNSAFE_componentWillUpdate

    /** new React 17.0 see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html    
    static getDerivedStateFromProps(props,state) { return null; }
    getSnapshotBeforeUpdate(prevProps, prevState) {}
    */

    /** SAFE for new React 17.0 */
    componentDidUpdate() { }

    loadServerGateways() {
        //console.log("requesting gateways...")
        request.get('/api/v3/iotnxt/gateways', {}, (err, res, body: GatewayType[]) => {
            if (err) console.log(err);
            if (body) {
                //console.log(body);
                this.setState({ gateways: body });
            }
        })
    }

    update = () => { this.loadServerGateways(); }

    /** This is passed as a prop to the gatewaylist component. When the user clicks buttons we will recieve actions here like delete,reconnect etc */
    actionHandler = (action: ActionTypes, cb?: Function) => {
        console.log("this.actionHandler", action)

        if (action.addGateway) {

            console.log("Adding " + action.addGateway.GatewayId)

            request.post('/api/v3/iotnxt/addgateway', { json: action.addGateway }, (err, res, result) => {
                if (err) { console.log(err); }
                if (result) {
                    console.log(result); this.loadServerGateways();
                    setTimeout(() => { this.loadServerGateways(); }, 500)
                    setTimeout(() => { this.loadServerGateways(); }, 2500)
                    setTimeout(() => { this.loadServerGateways(); }, 5000)
                    setTimeout(() => { this.loadServerGateways(); }, 7500)
                    setTimeout(() => { this.loadServerGateways(); }, 10000)

                    if (cb) cb();
                }
            })
        }

        if (action.deleteGateway) {
            console.log("Deleting " + action.deleteGateway.GatewayId)

            request.post("/api/v3/iotnxt/removegateway", { json: action.deleteGateway }, (err, res, result) => {
                console.log([err, result])
                if (result) { this.loadServerGateways() }
                if (cb) cb();
            })
        }

        if (action.reconnectGateway) {
            console.log("Reconnecting", action.reconnectGateway)

            request.post("/api/v3/iotnxt/reconnectgateway", { json: action.reconnectGateway }, (err, res, result) => {
                console.log([err, result])
                if (result) { this.loadServerGateways() }
                if (cb) cb();
            })
        }

    }

    settings() {
        return (
            <div>
                <AddGatewayPanel action={(action) => { this.actionHandler(action); }} update={this.update} />
                <GatewayList gateways={this.state.gateways} update={this.update} action={(action) => { this.actionHandler(action); }} />
            </div>
        );
    }


    /** Shows the box of data on the plugin window if the device is currently linked to a gateway */
    renderDeviceGateway = () => {
        if (!this.props.state["plugins_iotnxt_gateway"]) { return <div>No gateway set. Select from the dropdown.</div> }
        if (this.props.state["plugins_iotnxt_gateway"]["GatewayId"] == " ") { return <div>No gateway set. Select from the dropdown.</div> }

        return <div style={{ background: "rgba(0,0,0,0.25)", padding: colors.padding }}>
            GatewayID<br />
            <span style={{ fontSize: "1.25em", fontWeight: "bold" }}>{this.props.state["plugins_iotnxt_gateway"]["GatewayId"]}</span><br />
            {this.props.state["plugins_iotnxt_gateway"]["HostAddress"]}
        </div>

    }

    /** We recieve the gateway unique string from the dropdown select onChange in deviceview */
    setGatewayOnDevice(json: { key: string, id: string, plugins_iotnxt_gateway: { GatewayId: string, HostAddress: string } }) {
        console.log("setGatewayOnDevice", json);

        api.post(json, (err, result) => {
            console.log(err, result);
        })
    }

    /** Render the plugin popup on deviceview */
    deviceview() {

        var gateways = []

        if (this.state.gateways) {

        }
        gateways = this.state.gateways.sort((a: GatewayType, b: GatewayType) => {
            var at = new Date(a._created_on).getTime()
            var bt = new Date(b._created_on).getTime()
            return at > bt ? -1 : at < bt ? 1 : 0;
        })



        return (<div style={{ padding: colors.padding * 2 }}>
            <p>Connects this device to IoTnxt portal/commander.</p>

            {this.renderDeviceGateway()}

            <div style={{ paddingTop: 25, paddingBottom: 25 }}><a href="/settings/iotnxt"><button><i className="fas fa-list-ul"></i> MANAGE GATEWAYS</button></a></div>

            <h5>SELECT FROM AVAILABLE GATEWAYS:</h5>

            <select style={{ width: "100%" }} className="settingsSelect" onChange={(e) => {
                this.setGatewayOnDevice({
                    key: this.props.state.key,
                    id: this.props.state.id,
                    plugins_iotnxt_gateway: {
                        GatewayId: e.target.value.split("|")[0],
                        HostAddress: e.target.value.split("|")[1]
                    }
                });
            }}
                defaultValue="">
                <option key="none" value="none">select gateway</option>
                <option key="clear" value=" | ">clear</option>
                {
                    gateways.map((sGateway: GatewayType, i) => {
                        return <option key={sGateway.GatewayId + "|" + sGateway.HostAddress} value={sGateway.GatewayId + "|" + sGateway.HostAddress} >{sGateway.GatewayId + "|" + sGateway.HostAddress}</option>
                    })
                }
            </select>

        </div>)
    }
};

