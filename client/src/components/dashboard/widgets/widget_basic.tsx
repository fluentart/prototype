import React, { Component } from 'react';
import { WidgetComponent } from "./widgetcomponent"
import { colors, opacity } from '../../../theme';
import { moment } from '../../../utils/momentalt';

export default class WidgetBasic extends WidgetComponent {
    state = {
        options: {
            color: { type: "color", default: "#ffffff", value: undefined }
        }
    }

    render() {

        var display = ""

        switch (typeof this.props.value) {
            case "object": {
                display = JSON.stringify(this.props.value)
                break;
            }
            case "string": {
                display = this.props.value;
                break;
            }

            case "number": {
                display = this.props.value.toString()
                break;
            }
        }

        if (!this.props.value) {
            return <div style={{
                padding: colors.padding * 2,
                paddingTop: colors.padding * 4,
                background: opacity(colors.share, 0.15),
                border: "1px solid " + colors.share,
                color: colors.share,
                height: "100%",
                boxSizing: "border-box"
            }}><i className="fas fa-exclamation-triangle" /> Blank widget. Please edit or remove.</div>
        }

        var datapath = ""

        if (this.props.widget.datapath) {
            if (this.props.widget.datapath.indexOf("data.") == 0) {
                datapath = this.props.widget.datapath.slice(5)
            }
        }

        var valueTimestamp = (this.props.valueTimestamp) ? this.props.valueTimestamp : undefined

        return (
            <div style={{
                color: this.state.options.color.value,
                wordBreak: "break-all",
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}>

                <div style={{
                    flex: "0",
                    opacity: 0.25,
                    width: "100%",
                    boxSizing: "border-box",
                    padding: 0,
                    margin: 0,
                    paddingBottom: colors.padding,
                    display: "flex",
                    flexDirection: "row"
                }}><div style={{
                    flex: "1",
                    paddingRight: 7, paddingTop: 7,
                    textAlign: "right"
                }}>{moment(valueTimestamp).fromNow()}</div></div>

                <div style={{
                    flex: "1",
                    display: "flex",
                    justifyContent: "center", /* align horizontal */
                    alignItems: "center", /* align vertical */
                    fontSize: "150%",
                    textAlign: "center",
                    padding: 0,
                    margin: 0
                }}>{display}</div>


                <div style={{
                    flex: "0",
                    textAlign: "center",
                    opacity: 1,
                    width: "100%",
                    boxSizing: "border-box",
                    padding: 0,
                    margin: 0,
                    paddingBottom: colors.padding
                }}>{datapath}</div>
            </div>
        );
    }
};

