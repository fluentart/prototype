import React, { Component, Suspense } from "react";

import { CodeBlock } from "../components/codeblock"
import { Menu } from "../components/menu"
import { api } from "../api"
import { colors } from "../theme";

import { DocsApikey } from "./docs/docs_apikey"
import { DocsHTTPS } from "./docs/docs_https";
import { DocsWebsocket } from "./docs/docs_websocket"
import { DocsMQTT } from "./docs/docs_mqtt"

interface MyProps {
    page?: string
}

interface MyState {
    //[index: string]: any
}
export class Documentation extends React.Component<MyProps, MyState> {
    state = {
        apiMenu: 1,
        testPacket: {
            "id": "yourDevice001",
            "data": {
                "temperature": 24.54,
                "doorOpen": false,
                "gps": {
                    "lat": 25.123,
                    "lon": 28.125
                }
            }
        },
        background: colors.panels
    };

    handleCopyClipboard() {
        var textField = document.createElement("textarea");
        //textField.innerText = $("#postSample").html();
        document.body.appendChild(textField);
        textField.select();
        document.execCommand("copy");
        textField.remove();
    }

    getMenuClasses = function (num) {
        if (num == this.state.apiMenu) {
            return "menuTab borderTopSpot"
        } else {
            return "menuTab menuSelectable"
        }
    }

    getMenuPageStyle = function (num) {
        if (num == this.state.apiMenu) {
            return { display: "", background: this.state.background, padding: 20 }
        } else {
            return { display: "none" }
        }
    }

    onClickMenuTab = function (num) {
        return (event) => {
            /*
            console.log(event);
            event.currentTarget.className = "col-md-2 menuTab borderTopSpot";
            console.log(num)
            */
            var apiMenu = num;
            this.setState({ apiMenu })
        }
    }

    sendHttpRestTest = () => {

        api.post(this.state.testPacket, (e, r) => {

        })
        //console.log("TEST")
        // fetch("/api/v3/data/post", {
        //     method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
        //     body: JSON.stringify(this.state.testPacket)
        // }).then(response => response.json()).then(resp => {
        //     //console.log(resp);
        // }).catch(err => console.error(err.toString()));
    }

    render() {
        var apiCall = { path: window.location.origin }

        var samplePacket = { "id": "yourDevice001", "data": { "temperature": 24.54, "doorOpen": false, "gps": { "lat": 25.123, "lon": 28.125 } } }

        var authheader = 'Basic ' + Buffer.from("api:key-" + api.data.account.apikey).toString('base64')



        return (
            <div className="apiInfo" style={{ padding: 0 }} >
                <div style={{ display: "flex", flexDirection: "row" }}>

                    <div style={{ flex: "0" }}>
                        <Menu active={this.props.page} config={{
                            menuitems: [
                                { responsive: true, link: "/docs/apikey", icon: "key", text: "APIKEY", onClick: this.onClickMenuTab(1) },
                                { responsive: false, link: "/docs/http", text: "HTTP/S", onClick: this.onClickMenuTab(2) },
                                { responsive: false, link: "/docs/websocket", text: "WEBSOCKET", onClick: this.onClickMenuTab(3) },
                                { responsive: false, link: "/docs/mqtt", text: "MQTT", onClick: this.onClickMenuTab(4) }]
                        }} />
                    </div>

                    <div style={{ flex: "1" }}></div>
                </div>


                <div className="row" style={this.getMenuPageStyle(1)}><DocsApikey /></div>
                <div className="row" style={this.getMenuPageStyle(2)}><DocsHTTPS /></div >
                <div className="row" style={this.getMenuPageStyle(3)}><DocsWebsocket /></div>
                <div className="row" style={this.getMenuPageStyle(4)}><DocsMQTT /></div>
            </div >
        );
    }
}

