import React, { Component } from 'react';
import { WidgetComponent } from "./widgetcomponent"
import { api } from "../../../api"
import { colors } from "../../../theme"

import { Line } from 'react-chartjs-2';

import { objectByString } from "../../../../../server/shared/shared"

export default class WidgetLog extends WidgetComponent {
    state = {
        options: {
            color: { type: "color", default: colors.widgetDefault, value: "" }
        },
        gettingdata: false,
        data: []
    }

    componentDidMount() {
        if (!this.state.gettingdata) {
            this.state.gettingdata = true;

            /** This is similar to mongodb query language */
            var query: any = {
                find: {
                    key: this.props.state.key,
                    [this.props.widget.datapath]: { $exists: true }
                },
                mask: {
                    [this.props.widget.datapath]: 1
                },
                sort: { "timestamp": -1 },
                limit: 50
            }

            api.packets(query, (err, data: any) => {
                if (err) { console.log(err); }
                if (data) {
                    data = data.reverse(); // flip order
                    this.setState({ data })
                }
            })

            api.on("packet", this.packetHandler)

        }
    }

    componentWillUnmount() {
        api.removeListener("packet", this.packetHandler);
    }

    packetHandler = (packet) => {
        if (Array.isArray(packet) == false) {
            if (packet.key == this.props.state.key) {
                var data: any = this.state.data;
                data.push(packet);
                this.setState({ data })
            }
        }
    }

    render() {


        //if (this.props.widget.datapath) { return <div>{this.props.widget.datapath}</div> }
        if (this.state.data.length == 0) { return <div></div> }

        var labels = [];
        var data = [];



        for (var d of this.state.data) {
            //var value = objectByString(this.props.state, this.props.widget.datapath)
            labels.push(d["timestamp"])
            var entry = {
                timestamp: d.timestamp,
                value: objectByString(d, this.props.widget.datapath)
            }

            if (entry.value != undefined) {
                data.push(entry)
            }

        }

        if (data.length == 0) {
            <div>log empty</div>
        }

        //cell padding
        var padding = Math.round(colors.padding / 3);

        return (
            <div style={{ padding: colors.padding }}>

                <div key={entry.timestamp} style={{ background: colors.bgDarker, borderBottom: colors.borders, display: "flex", flexDirection: "row" }}>
                    <div style={{ width: 207, padding }}>timestamp</div>
                    <div style={{ flex: 1, padding, paddingLeft: colors.padding }}>{this.props.widget.datapath}</div>
                </div>

                {data.reverse().map((entry, i) => {
                    var background = ((data.length - i) % 2 == 1) ? "rgba(255,255,255,0.05)" : ""
                    return <div key={entry.timestamp} style={{ background, display: "flex", flexDirection: "row" }}>
                        <div style={{ padding, opacity: 0.5, flex: 0, whiteSpace: "nowrap" }}>{entry.timestamp}</div>
                        <div style={{ padding, paddingLeft: colors.padding, flex: 1 }}>{entry.value}</div>
                    </div>
                })}
            </div>
        )
    }
};

