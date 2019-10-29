import React from "react";
import { BrowserRouter, Route, Link, NavLink } from "react-router-dom";

import { User } from "../../../server/shared/interfaces";
import { theme, colors } from "../theme";
import { api } from "../api";
import { SearchBox } from "./searchbox";

import { Menu, MenuItems } from "../components/menu"


interface MyProps { action: Function }

interface MyState { }

export class MobileNavBottom extends React.Component<MyProps, MyState> {
    state = {

    };

    render() {

        var style: any = {
            ...colors.quickShadow, ...{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                zIndex: 2000,
                background: colors.panels,
                display: "flex",
                flexDirection: "row",
                boxSizing: "border-box",
                borderTop: colors.borders
            }
        }

        var menuItemStyles: any = { flex: "0", textAlign: "center", padding: colors.padding }

        return (
            <div style={style}>
                <div className="button"
                    style={menuItemStyles}
                    onClick={() => { this.props.action({ view: "list" }) }}>
                    <i className="fas fa-list"></i><br />LIST
                    </div>

                <div className="button"
                    style={menuItemStyles}
                    onClick={() => { this.props.action({ view: "map" }) }}>
                    <i className="fas fa-map-marked-alt"></i><br />MAP
                </div>

                <div className="button"
                    style={menuItemStyles}
                    onClick={() => { this.props.action({ view: "docs" }) }}>
                    <i className="fas fa-book"></i><br />DOCS
                </div>

            </div>
        );

    }
}
