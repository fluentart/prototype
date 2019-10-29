import React, { Component } from 'react';
import { WidgetComponent } from "./widgetcomponent"
import { colors } from '../../../theme';
import { api } from '../../../api';

export default class WidgetInput extends WidgetComponent {
    state = {
        options: {
            color: { type: "color", default: "#ffffff", value: undefined },
            name: { type: "input", default: "default", value: "" }
        },
        inputval: ""
    }

    render() {
        return (
            <div style={{
                color: this.state.options.color.value,
                wordBreak: "break-all",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
                paddingLeft: colors.padding,
                paddingRight: colors.padding,
                paddingTop: colors.padding / 2,
                paddingBottom: colors.padding
            }}>
                <div style={{
                    flex: 0,
                    boxSizing: "border-box",
                    width: "100%"
                }}> {this.state.options.name.value}: </div>

                <div style={{
                    flex: 1,
                    display: "flex",
                    boxSizing: "border-box"
                }}>

                    <div style={{ flex: 2 }}><input
                        onChange={(e) => { this.setState({ inputval: e.target.value }) }}
                        value={this.state.inputval}
                        style={{ width: "100%", height: "100%", padding: 5 }}></input>
                    </div>

                    <div style={{ flex: 1 }}>

                        <button style={{ border: colors.borders, height: "100%", width: "100%", padding: 6, minWidth: 30, textAlign: "center", margin: 0 }}
                            onClick={e => {
                                var data = {}
                                data[this.state.options.name.value] = this.state.inputval;
                                api.post({ key: this.props.state.key, data })
                            }}><i className="fas fa-save"></i></button>
                    </div>

                </div>
            </div>
        );
    }
};


