import React, { Component } from 'react';
import { WidgetComponent } from "./widgetcomponent"
import { api } from "../../../api"
import { Menu } from "../../menu"

export default class WidgetMenu extends WidgetComponent {
    state = {
        options: {
            color: { type: "color", default: "#111111", value: "" },
            background: { type: "color", default: "#11cc88", value: "" },
            config: {
                type: "json", default: {
                    menuitems: [
                        {
                            responsive: true,
                            icon: "caret-down",
                            text: "Menu",
                            onClick: () => { }
                        }
                    ]
                }, value: { menuitems: [] }
            }
        },
        height: "100%" //this auto adjusts
    }

    wrapper;

    componentDidMount() {
        this.wrapper = React.createRef();

    }

    componentDidUpdate() {

        // if (this.wrapper) {
        //     if (this.wrapper.current) {
        //         var dimensions = {
        //             width: this.wrapper.current.offsetWidth,
        //             height: this.wrapper.current.offsetHeight
        //         }
        //         this.setState((state) => {
        //             if (state.height != dimensions.height) {
        //                 return { height: dimensions.height }
        //             }
        //         })
        //     }
        // }
        this.getWidgetHeight()

        setTimeout(() => {
            this.getWidgetHeight()
        }, 500)
    }

    onClick() {
        //var data = JSON.parse(this.state.options.command.value);
        //api.post({ key: this.props.state.key, data })
    }

    getWidgetHeight() {

        if (this.wrapper) {
            if (this.wrapper.current) {
                if (this.state.height != this.wrapper.current.offsetHeight) this.setState({ height: this.wrapper.current.offsetHeight })
            }
        }
    }

    render() {
        return (
            <div style={{ height: "100%" }} ref={this.wrapper}>
                <Menu height={this.state.height} fill={true} config={this.state.options.config.value}
                    style={{
                        color: this.state.options.color.value,
                        background: this.state.options.background.value
                    }}>
                </Menu>
            </div>
        );
    }
};

