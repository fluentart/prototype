import React, { Component } from 'react';
import { WidgetComponent } from "./widgetcomponent"
import { api } from "../../../api"

export default class WidgetButton extends WidgetComponent {
    state = {
        options: {
            color: { type: "color", default: "#111111", value: "" },
            background: { type: "color", default: "#11cc88", value: "" },
            command: { type: "input", default: JSON.stringify({ "foo": true }), value: "" },
            buttonText: { type: "input", default: "SEND", value: "" },
        }
    }

    onClick() {
        var data = JSON.parse(this.state.options.command.value);
        api.post({ key: this.props.state.key, data })
    }

    render() {
        return (
            <div style={{ height: "100%" }}>
                <button
                    onClick={() => { this.onClick() }}
                    style={{
                        color: this.state.options.color.value,
                        background: this.state.options.background.value,
                        width: "100%",
                        height: "100%"
                    }}>
                    {this.state.options.buttonText.value}<br />
                    {this.state.options.command.value}
                </button>
            </div>
        );
    }
};

